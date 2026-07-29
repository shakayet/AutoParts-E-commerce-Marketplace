"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */
const colors_1 = __importDefault(require("colors"));
const mongoose_1 = __importDefault(require("mongoose"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const seedAdmin_1 = require("./DB/seedAdmin");
const socketHelper_1 = require("./helpers/socketHelper");
const logger_1 = require("./shared/logger");
const process_1 = __importDefault(require("process"));
const TRANSIENT_ERROR_PATTERNS = [
    'querySrv',
    'SRV',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ECONNRESET',
    'ENOTFOUND',
    'EAI_AGAIN',
    'getaddrinfo',
    'DNS',
    'resolution',
];
const HUMAN_STARTUP_ERROR_CODES = new Set(['EADDRINUSE', 'EADDRNOTAVAIL']);
const isTransientDbNetworkError = (err) => {
    const msg = err instanceof Error
        ? `${err.name} ${err.message} ${err.code ?? ''}`
        : String(err ?? '');
    return TRANSIENT_ERROR_PATTERNS.some(p => msg.toLowerCase().includes(p.toLowerCase()));
};
//uncaught exception
process_1.default.on('uncaughtException', error => {
    if (isTransientDbNetworkError(error)) {
        logger_1.errorLogger.error(`Transient network/DNS exception (kept running): ${error instanceof Error
            ? `${error.name}: ${error.message}`
            : String(error)}`);
        return;
    }
    const code = error instanceof Error ? error.code : undefined;
    if (code && HUMAN_STARTUP_ERROR_CODES.has(code)) {
        // Listen/bind errors — server.once('error') above normally catches these
        // first, but as a last-resort safety net we still print the message clearly.
        logger_1.errorLogger.error(colors_1.default.red(`🚫 Startup bind error (${code}): ${error instanceof Error ? error.message : String(error)}`));
        process_1.default.exit(1);
    }
    logger_1.errorLogger.error('UnhandleException Detected', error);
    process_1.default.exit(1);
});
// handle unhandleRejection (registered BEFORE main() so bootstrap rejections are also caught)
process_1.default.on('unhandledRejection', error => {
    if (isTransientDbNetworkError(error)) {
        logger_1.errorLogger.error(`Transient network/DNS rejection (kept running): ${error instanceof Error
            ? `${error.name}: ${error.message}`
            : String(error)}`);
        return;
    }
    const code = error instanceof Error ? error.code : undefined;
    if (code && HUMAN_STARTUP_ERROR_CODES.has(code)) {
        logger_1.errorLogger.error(colors_1.default.red(`🚫 Startup bind error (${code}): ${error instanceof Error ? error.message : String(error)}`));
        process_1.default.exit(1);
    }
    if (server) {
        server.close(() => {
            logger_1.errorLogger.error('UnhandleRejection Detected', error);
            process_1.default.exit(1);
        });
    }
    else {
        logger_1.errorLogger.error('UnhandleRejection Detected (no server to close)', error);
        process_1.default.exit(1);
    }
});
let server;
let socketServer;
let shuttingDown = false;
const MAX_CONNECT_ATTEMPTS = 5;
const CONNECT_BASE_DELAY_MS = 2000;
const isSRVUri = (uri) => uri.trimStart().startsWith('mongodb+srv://');
const extractSRVHost = (uri) => {
    const match = uri.match(/^mongodb\+srv:\/\/[^@]+@([^/?]+)/);
    return match ? match[1] : null;
};
const printSRVWorkaround = (uri) => {
    const srvHost = extractSRVHost(uri);
    const clusterPart = srvHost
        ? srvHost.split('.')[0] // e.g. "cluster0" from "cluster0.ndrhfpm.mongodb.net"
        : '<cluster>';
    logger_1.errorLogger.error('══════════════════════════════════════════════════════════════════════\n' +
        '  DNS SRV LOOKUP BLOCKED (Windows/Git Bash / firewall / VPN)\n' +
        '  Your network is refusing DNS SRV queries required by mongodb+srv://\n\n' +
        (srvHost
            ? `  Run this command (Windows PowerShell) to find the seed hosts:\n` +
                `     nslookup -type=SRV _mongodb._tcp.${srvHost}\n\n`
            : '') +
        '  QUICK FIX — In Atlas go to: Connect → Drivers → Node.js 2.2.12 or later.\n' +
        '  Copy the "mongodb://" (NOT "mongodb+srv://") seed-list URI and paste it\n' +
        '  into your .env DATABASE_URL. Example shape:\n\n' +
        `    mongodb://<user>:<pass>@${clusterPart}-shard-00-00.XXXXX.mongodb.net:27017,\n` +
        `    ${clusterPart}-shard-00-01.XXXXX.mongodb.net:27017,\n` +
        `    ${clusterPart}-shard-00-02.XXXXX.mongodb.net:27017/<db>?ssl=true&\n` +
        `    replicaSet=atlas-${clusterPart}-shard-0&authSource=admin&\n` +
        `    retryWrites=true&w=majority\n\n` +
        '  That format uses standard A-record DNS and avoids SRV entirely.\n' +
        '══════════════════════════════════════════════════════════════════════');
};
async function connectWithRetry(connectionUri) {
    let lastErr;
    for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt++) {
        try {
            await mongoose_1.default.connect(connectionUri, {
                serverSelectionTimeoutMS: 15000,
                heartbeatFrequencyMS: 20000,
            });
            if (attempt > 1) {
                logger_1.logger.info(`MongoDB connected on attempt ${attempt}/${MAX_CONNECT_ATTEMPTS}`);
            }
            return;
        }
        catch (error) {
            lastErr = error;
            if (attempt < MAX_CONNECT_ATTEMPTS) {
                const delay = CONNECT_BASE_DELAY_MS * Math.pow(2, attempt - 1);
                logger_1.logger.warn(`MongoDB connect attempt ${attempt}/${MAX_CONNECT_ATTEMPTS} failed, retrying in ${delay}ms: ${error instanceof Error ? error.message : String(error)}`);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    throw lastErr;
}
async function main() {
    const databaseUrl = config_1.default.database_url;
    try {
        // Actually await the connection so the try/catch below works, with retry
        await connectWithRetry(databaseUrl);
        logger_1.logger.info(colors_1.default.green('🚀 Database connected successfully'));
        // Mongoose emits errors on the connection after connect (e.g. DNS SRV polling
        // failures). Log them but do NOT kill the process — the driver will retry.
        mongoose_1.default.connection.on('error', err => {
            if (isTransientDbNetworkError(err)) {
                logger_1.errorLogger.error(`Transient DB connection issue (driver will retry): ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`);
            }
            else {
                logger_1.errorLogger.error('Mongoose connection error:', err);
            }
        });
        mongoose_1.default.connection.on('disconnected', () => {
            // eslint-disable-next-line no-unused-expressions
            logger_1.errorLogger.warn
                ? logger_1.errorLogger.warn('Mongoose disconnected — driver will reconnect')
                : logger_1.errorLogger.error('Mongoose disconnected — driver will reconnect');
        });
        //Seed Super Admin after database connection is successful
        await (0, seedAdmin_1.seedSuperAdmin)();
        // config.port is now GUARANTEED to be a valid int 1-65535 by resolvePort().
        const port = config_1.default.port;
        const bindAddress = config_1.default.ip_address || '0.0.0.0';
        server = app_1.default.listen(port, bindAddress, () => {
            logger_1.logger.info(colors_1.default.yellow(`♻️  Application listening on ${bindAddress}:${port}`));
        });
        // Catch bind/listen errors BEFORE they bubble to uncaughtException and
        // print a clear, actionable message (e.g. EADDRINUSE tells you who to kill).
        server.once('error', err => {
            const code = err.code;
            const addr = `${bindAddress}:${port}`;
            if (code === 'EADDRINUSE') {
                logger_1.errorLogger.error(colors_1.default.red(`🚫 Port ${port} is already in use at ${addr}. Another process is ` +
                    `holding it — close that terminal first or run (PowerShell):\n` +
                    `    Get-Process -Id (Get-NetTCPConnection -LocalPort ${port}).OwningProcess\n` +
                    `    Stop-Process -Id <PID> -Force`));
            }
            else if (code === 'EADDRNOTAVAIL') {
                logger_1.errorLogger.error(colors_1.default.red(`🚫 Cannot bind to ${addr} — IP_ADDRESS="${bindAddress}" is not ` +
                    `assigned to any local adapter. Set IP_ADDRESS=0.0.0.0 or your machine's ` +
                    `real LAN IP in .env.`));
            }
            else {
                logger_1.errorLogger.error(colors_1.default.red(`🚫 Failed to start HTTP server on ${addr}: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`));
            }
            process_1.default.exit(1);
        });
        //socket
        socketServer = new socket_io_1.Server(server, {
            pingTimeout: 60000,
            cors: {
                origin: config_1.default.corsOrigins,
            },
        });
        socketHelper_1.socketHelper.socket(socketServer);
        //@ts-expect-error
        global.io = socketServer;
    }
    catch (error) {
        logger_1.errorLogger.error(colors_1.default.red('🤢 Failed to connect / bootstrap Database'), error instanceof Error ? error : undefined);
        // If the failure is SRV-related and the user has a mongodb+srv:// URI,
        // print the exact workaround (Atlas seed-list URI format) so they can fix it.
        if (databaseUrl &&
            isSRVUri(databaseUrl) &&
            isTransientDbNetworkError(error)) {
            printSRVWorkaround(databaseUrl);
        }
        // fatal: could not even bootstrap — let process manager restart
        process_1.default.exit(1);
    }
}
main();
const shutdown = async (signal) => {
    if (shuttingDown)
        return;
    shuttingDown = true;
    logger_1.logger.info(`${signal} received; shutting down`);
    const forceExit = setTimeout(() => {
        logger_1.errorLogger.error('Graceful shutdown timed out');
        process_1.default.exit(1);
    }, 10000);
    forceExit.unref();
    socketServer?.close();
    await new Promise(resolve => {
        if (!server) {
            resolve();
            return;
        }
        server.close(() => resolve());
    });
    await mongoose_1.default.disconnect();
    clearTimeout(forceExit);
    process_1.default.exit(0);
};
process_1.default.on('SIGTERM', () => void shutdown('SIGTERM'));
process_1.default.on('SIGINT', () => void shutdown('SIGINT'));
//# sourceMappingURL=server.js.map