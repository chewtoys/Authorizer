import { Application } from "express";
import { Lightship } from "lightship";
import { AddressInfo, Server } from "net";

/**
 * handle permission and addressing errors on all servers
 */
const handlePortError =
    (address: AddressInfo, lightship: Lightship) =>
    (error: NodeJS.ErrnoException): void => {
        if (error.syscall !== "listen") {
            throw error;
        }
        lightship.signalNotReady();

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                console.error(`${address} requires elevated privileges`);
                lightship.shutdown();
                break;
            case "EADDRINUSE":
                console.error(`${address} is already in use`);
                lightship.shutdown();
                break;
            default:
                throw error;
        }
    };

export interface LaunchOptions {
    name: string;
    app: Application;
    port: number;
    onReady?: () => void;
}

export const withLightship =
    (lightship: Lightship) =>
    (o: LaunchOptions): Server => {
        const server = o.app.listen(o.port, () => {
            console.log(`Serving ${o.name} on ${o.port}`);
            if (o.onReady) {
                o.onReady();
            }
        });
        server.on(
            "error",
            handlePortError(server.address() as AddressInfo, lightship),
        );
        return server;
    };
