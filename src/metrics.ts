import express, { Application, Handler } from "express";
import promMiddleware from "express-prometheus-middleware";

export const app = express();
export const middleware = promMiddleware({ metricsApp: app });

export default {
    app: (): Application => app,
    middleware: (): Handler => middleware,
};
