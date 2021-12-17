import { Command, Option } from "commander";
import { Boilerplate } from "./application";
import { UserDataAuthorizer } from "./authorization";
import rules from "./rules";

const boilerplate = new Boilerplate();

/**
 * Set up CLI options and config.
 */
const program = new Command();
program
    .version("0.0.1")
    .addOption(
        new Option("-p, --port <port>", "Port to run the service on")
            .default(5000)
            .env("PORT")
            .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "--probes-port <port>",
            "Port to serve /live, /health and /ready probes on.",
        )
            .default(6000)
            .env("PROBES_PORT"),
    )
    .addOption(
        new Option(
            "--metrics-port <port>",
            "Port to serve Prometheus metrics on.",
        )
            .default(9090)
            .env("METRICS_PORT"),
    )
    .addOption(
        new Option(
            "--pg-user <username>",
            "The postgresql username to connect with",
        )
        .env('PG_USER')
        .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "--pg-host <hostname>",
            "The postgresql host to connect to",
        )
        .env('PG_HOST')
        .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "--pg-password <password>",
            "The postgresql password to connect with",
        )
        .env('PG_PASSWORD')
        .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "--pg-database <database>",
            "The postgresql database to connect to",
        )
        .env('PG_DATABASE')
        .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "--pg-port <port>",
            "The postgresql host port to connect to",
        )
        .env('PG_PORT')
        .default(5432)
        .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "--private-signing-key-base64",
            "The PRIVATE key for message signing in base64 format",
        )
        .env('SIGNING_SECRET_KEY')
        .makeOptionMandatory(),
    );


program.parse(process.argv);
const config = program.opts();
const app = boilerplate.prepare(config);


app.get('/favicon.ico', (req, res) => { res.status(404).send('Not found'); });

app.use('*', UserDataAuthorizer({
    showFailures: true,
    privateSigningKey: Buffer.from(config.privateSigningKeyBase64, 'base64'),
    connection:{
        username: config.pgUser,
        password: config.pgPassword,
        host: config.pgHost,
        db: config.pgDatabase,
        port: config.pgPort,
    },
    ruleset:[
        rules.deny,
        // rules.AllowOnly(""),
    ],
}));

boilerplate.launch();
