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
    );

program.parse(process.argv);
const config = program.opts();
const app = boilerplate.prepare(config);

app.use('*', UserDataAuthorizer({
    showFailures: true,
    connection:{},
    ruleset:[
        rules.deny,
    ],
}));

boilerplate.launch();
