import { createLightship } from "lightship";
import { Command, Option } from "commander";

import metrics from "./metrics";
import { withLightship } from "./apputils";
import Boilerplate from "./application";
import { Request, Response } from "express";

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

const boilerplate = new Boilerplate();

const app = boilerplate.prepare(config);

app.get("/", (req: Request, res: Response) => {
    res.status(200).render("index", { title: "Express" });
});

boilerplate.launch();
