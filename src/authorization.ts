import nacl from "tweetnacl";
import { Request, Response, NextFunction, Handler } from "express";
import { Pool } from "pg";
import { Rule } from "./rules";
import { UserDB } from "./users";

export interface AuthzRequest {
    headers: Record<string, any>;
    forwardArgs: {
        method: string;
        protocol: string;
        host: string;
        uri: string;
        source: string;
    };
}

export interface AuthzIdentity {
    guid: string;
}

export interface AuthzResult {
    details: any;
    allow: boolean;
}

interface configArgs {
    showFailures: boolean;
    privateSigningKey: Uint8Array;
    connection: {
        username: string;
        password: string;
        host: string;
        db: string;
        port: number;
    };
    ruleset: Rule[];
}

function parseAuthzRequest(req: Request): AuthzRequest {
    return {
        headers: req.headers,
        forwardArgs: {
            method: req.header("x-forwarded-method"),
            host: req.header("x-forwarded-host"),
            uri: req.header("x-forwarded-uri"),
            protocol: req.header("x-forwarded-proto"),
            source: req.header("x-forwarded-for"),
        },
    };
}

export function getIdentityFor(r: AuthzRequest): AuthzIdentity {
    // Maybe parse appsession cookie
    // Maybe accept signed JWT
    return {
        guid: r.headers["x-forwarded-user"],
    };
}

function approve(req: AuthzRequest, key: Uint8Array): string {
    const hash = nacl.hash(Buffer.from(JSON.stringify(req)));
    const msg = Buffer.from(
        JSON.stringify({
            message: "OK",
            requestHash: hash, // Tie signature to this action
            nonce: nacl.randomBytes(32), // Tie signature to this unique event
            time: Date.now(), // Tie signature to now
        }),
    );
    const signedMsg = nacl.sign(msg, key);
    return Buffer.from(signedMsg).toString("base64");
}

export function UserDataAuthorizer(config: configArgs): Handler {
    const pool = new Pool(config.connection);
    const userdb = new UserDB(pool);

    const middleware = (req: Request, res: Response, next: NextFunction) => {
        const parsedRequest = parseAuthzRequest(req);
        const identityData = getIdentityFor(parsedRequest);
        const userData = userdb.getData(identityData);
        const results = config.ruleset.map(rule =>
            rule(parsedRequest, userData),
        );
        const failures = results.filter(result => !result.allow);

        if (failures.length > 0) {
            res.status(401).json({
                status: 401,
                message: "Unauthorized",
                reasons: config.showFailures ? failures : "redacted",
            });
        } else {
            res.header(
                "X-Authz-Token",
                approve(parsedRequest, config.privateSigningKey),
            )
                .status(200)
                .json({
                    status: 200,
                    message: "Authorized",
                });
        }
    };

    return middleware;
}
