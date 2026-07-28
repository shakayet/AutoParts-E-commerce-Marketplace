/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */
import colors from 'colors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { seedSuperAdmin } from './DB/seedAdmin';
import { socketHelper } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';
import process from 'process';

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

const isTransientDbNetworkError = (err: unknown): boolean => {
  const msg =
    err instanceof Error
      ? `${err.name} ${err.message} ${(err as Error & { code?: string }).code ?? ''}`
      : String(err ?? '');
  return TRANSIENT_ERROR_PATTERNS.some((p) =>
    msg.toLowerCase().includes(p.toLowerCase()),
  );
};

//uncaught exception
process.on('uncaughtException', (error) => {
  if (isTransientDbNetworkError(error)) {
    errorLogger.error(
      `Transient network/DNS exception (kept running): ${
        error instanceof Error ? `${error.name}: ${error.message}` : String(error)
      }`,
    );
    return;
  }
  const code =
    error instanceof Error ? (error as NodeJS.ErrnoException).code : undefined;
  if (code && HUMAN_STARTUP_ERROR_CODES.has(code)) {
    // Listen/bind errors — server.once('error') above normally catches these
    // first, but as a last-resort safety net we still print the message clearly.
    errorLogger.error(
      colors.red(
        `🚫 Startup bind error (${code}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      ),
    );
    process.exit(1);
  }
  errorLogger.error('UnhandleException Detected', error);
  process.exit(1);
});

// handle unhandleRejection (registered BEFORE main() so bootstrap rejections are also caught)
process.on('unhandledRejection', (error) => {
  if (isTransientDbNetworkError(error)) {
    errorLogger.error(
      `Transient network/DNS rejection (kept running): ${
        error instanceof Error ? `${error.name}: ${error.message}` : String(error)
      }`,
    );
    return;
  }
  const code =
    error instanceof Error ? (error as NodeJS.ErrnoException).code : undefined;
  if (code && HUMAN_STARTUP_ERROR_CODES.has(code)) {
    errorLogger.error(
      colors.red(
        `🚫 Startup bind error (${code}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      ),
    );
    process.exit(1);
  }
  if (server) {
    server.close(() => {
      errorLogger.error('UnhandleRejection Detected', error);
      process.exit(1);
    });
  } else {
    errorLogger.error('UnhandleRejection Detected (no server to close)', error);
    process.exit(1);
  }
});

let server: import('http').Server | undefined;

const MAX_CONNECT_ATTEMPTS = 5;
const CONNECT_BASE_DELAY_MS = 2000;

const isSRVUri = (uri: string): boolean => uri.trimStart().startsWith('mongodb+srv://');

const extractSRVHost = (uri: string): string | null => {
  const match = uri.match(/^mongodb\+srv:\/\/[^@]+@([^/?]+)/);
  return match ? match[1] : null;
};

const printSRVWorkaround = (uri: string) => {
  const srvHost = extractSRVHost(uri);
  const clusterPart = srvHost
    ? srvHost.split('.')[0] // e.g. "cluster0" from "cluster0.ndrhfpm.mongodb.net"
    : '<cluster>';
  errorLogger.error(
    '══════════════════════════════════════════════════════════════════════\n' +
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
    '══════════════════════════════════════════════════════════════════════',
  );
};

async function connectWithRetry(connectionUri: string) {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(connectionUri, {
        serverSelectionTimeoutMS: 15000,
        heartbeatFrequencyMS: 20000,
      });
      if (attempt > 1) {
        logger.info(
          `MongoDB connected on attempt ${attempt}/${MAX_CONNECT_ATTEMPTS}`,
        );
      }
      return;
    } catch (error) {
      lastErr = error;
      if (attempt < MAX_CONNECT_ATTEMPTS) {
        const delay = CONNECT_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        logger.warn
          ? logger.warn(
              `MongoDB connect attempt ${attempt}/${MAX_CONNECT_ATTEMPTS} failed, retrying in ${delay}ms: ${
                error instanceof Error ? error.message : String(error)
              }`,
            )
          : errorLogger.error(
              `MongoDB connect attempt ${attempt}/${MAX_CONNECT_ATTEMPTS} failed, retrying in ${delay}ms: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

async function main() {
  const databaseUrl = config.database_url as string;
  try {
    // Actually await the connection so the try/catch below works, with retry
    await connectWithRetry(databaseUrl);
    logger.info(colors.green('🚀 Database connected successfully'));

    // Mongoose emits errors on the connection after connect (e.g. DNS SRV polling
    // failures). Log them but do NOT kill the process — the driver will retry.
    mongoose.connection.on('error', (err) => {
      if (isTransientDbNetworkError(err)) {
        errorLogger.error(
          `Transient DB connection issue (driver will retry): ${
            err instanceof Error ? `${err.name}: ${err.message}` : String(err)
          }`,
        );
      } else {
        errorLogger.error('Mongoose connection error:', err);
      }
    });
    mongoose.connection.on('disconnected', () => {
      errorLogger.warn
        ? errorLogger.warn('Mongoose disconnected — driver will reconnect')
        : errorLogger.error('Mongoose disconnected — driver will reconnect');
    });

    //Seed Super Admin after database connection is successful
    await seedSuperAdmin();

    // config.port is now GUARANTEED to be a valid int 1-65535 by resolvePort().
    const port: number = config.port;
    const bindAddress: string = (config.ip_address as string) || '0.0.0.0';

    server = app.listen(port, bindAddress, () => {
      logger.info(
        colors.yellow(
          `♻️  Application listening on ${bindAddress}:${port}`,
        ),
      );
    });

    // Catch bind/listen errors BEFORE they bubble to uncaughtException and
    // print a clear, actionable message (e.g. EADDRINUSE tells you who to kill).
    server.once('error', (err) => {
      const code = (err as NodeJS.ErrnoException).code;
      const addr = `${bindAddress}:${port}`;
      if (code === 'EADDRINUSE') {
        errorLogger.error(
          colors.red(
            `🚫 Port ${port} is already in use at ${addr}. Another process is ` +
              `holding it — close that terminal first or run (PowerShell):\n` +
              `    Get-Process -Id (Get-NetTCPConnection -LocalPort ${port}).OwningProcess\n` +
              `    Stop-Process -Id <PID> -Force`,
          ),
        );
      } else if (code === 'EADDRNOTAVAIL') {
        errorLogger.error(
          colors.red(
            `🚫 Cannot bind to ${addr} — IP_ADDRESS="${bindAddress}" is not ` +
              `assigned to any local adapter. Set IP_ADDRESS=0.0.0.0 or your machine's ` +
              `real LAN IP in .env.`,
          ),
        );
      } else {
        errorLogger.error(
          colors.red(`🚫 Failed to start HTTP server on ${addr}: ${
            err instanceof Error ? `${err.name}: ${err.message}` : String(err)
          }`),
        );
      }
      process.exit(1);
    });

    //socket
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });
    socketHelper.socket(io);
    //@ts-expect-error
    global.io = io;
  } catch (error) {
    errorLogger.error(
      colors.red('🤢 Failed to connect / bootstrap Database'),
      error instanceof Error ? error : undefined,
    );

    // If the failure is SRV-related and the user has a mongodb+srv:// URI,
    // print the exact workaround (Atlas seed-list URI format) so they can fix it.
    if (
      databaseUrl &&
      isSRVUri(databaseUrl) &&
      isTransientDbNetworkError(error)
    ) {
      printSRVWorkaround(databaseUrl);
    }

    // fatal: could not even bootstrap — let process manager restart
    process.exit(1);
  }
}

main();

//SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVE');
  if (server) {
    server.close();
  }
});
