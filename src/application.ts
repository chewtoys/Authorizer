import * as path from "path";
import { OptionValues } from "commander";
import express, {
    Application,
} from "express";
import logger from "morgan";

import { errorHandler, errorNotFoundHandler } from "./middlewares/errorHandler";
import metrics from "./metrics";
import { createLightship, Lightship } from "lightship";
import { withLightship } from "./apputils";
import helmet from "helmet";

export class Boilerplate {
    config: any;
    app: Application;
    telemetry: Application;
    lightship: Lightship;

    prepare(config: OptionValues): Application {
        this.lightship = createLightship({
            port: config.probesPort,
        });
        this.telemetry = metrics.app();

        this.app = express();
        this.app.use(helmet());
        this.app.set("views", path.join(__dirname, "../views")); // Use views
        this.app.set("view engine", "pug"); // Use Pug

        this.app.use(logger("dev")); // Set up default logger
        this.app.use(express.static(path.join(__dirname, "../public")));
        this.app.use(metrics.middleware());
        return this.app;
    }

    launch(): void {
        this.app.use(errorNotFoundHandler);
        this.app.use(errorHandler);

        withLightship(this.lightship)({
            name: "Telemetry",
            app: this.telemetry,
            port: this.config.metricsPort,
        });

        withLightship(this.lightship)({
            name: "Application",
            app: this.app,
            port: this.config.port,
            onReady: () => this.lightship.signalReady(),
        });
    }
}
