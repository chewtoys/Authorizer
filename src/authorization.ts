import { Request, Response, NextFunction, Handler } from 'express';


export interface AuthzRequest {}
export interface AuthzIdentity {}
export interface AuthzResult {
    details: any;
    allow: boolean;
}

export type Rule = (r: AuthzRequest, d: AuthzIdentity) => AuthzResult;

interface configArgs {
    showFailures: boolean;
    connection: any;
    ruleset: Rule[];
}


function parseAuthzRequest(re:Request): AuthzRequest {
    return {};
}

function getIdentityFor(r: AuthzRequest): AuthzIdentity {
    return {};
}

export function UserDataAuthorizer (config: configArgs): Handler{
    const middleware = (req: Request, res: Response, next: NextFunction) => {
        const results = config.ruleset.map((rule) => {
            const parsedRequest = parseAuthzRequest(req);
            const identityData = getIdentityFor(parsedRequest);
            const authResult = rule(parsedRequest, identityData);
            return authResult;
        });
        const failures = results.filter((result) => !result.allow);

        if (failures.length > 0) {
            res.status(401).json({
                status: 401,
                message: "Unauthorized",
                reasons: config.showFailures? failures: "redacted",
            });
        }else{
            res.status(200).json({
                status: 200,
                message: "Authorized",
            });
        }

    };

    return middleware;
}
