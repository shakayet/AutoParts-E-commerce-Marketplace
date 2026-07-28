"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
const os_1 = __importDefault(require("os"));
// Compute paths at the top so they're stable even if cwd changes.
const ENV_PATH = path_1.default.join(process_1.default.cwd(), '.env');
const CONFIG_SRC_PATH = path_1.default.join(process_1.default.cwd(), 'src', 'config', 'index.ts');
// If ts-node-dev / ts-node / node kept a cached compiled version of this file
// from a previous run with different .env content, then a respawn might reuse
// the cached module.exports and skip dotenv.config() entirely — meaning your
// newly saved PORT=5000 in .env would be ignored and old PORT=5001 used.
//
// We force a fresh dotenv reload on EVERY evaluation by (a) explicitly
// reading .env's mtime to detect change, and (b) invalidating any cached
// compiled copy of our OWN module so the whole file re-evaluates if needed.
const ENV_MTIME_KEY = '__autoparts_env_mtime_ms__';
try {
    const envStat = fs_1.default.statSync(ENV_PATH);
    const last = globalThis[ENV_MTIME_KEY];
    if (!last || last !== envStat.mtimeMs) {
        // .env changed (or is first load) → drop any ts-node-dev cached copy of
        // src/config/index.{ts,js} so the module's top-level dotenv.config() runs.
        const dropKeys = [__filename, CONFIG_SRC_PATH];
        for (const k of Object.keys(require.cache)) {
            if (dropKeys.includes(k) ||
                k === CONFIG_SRC_PATH ||
                k.endsWith('src/config/index.ts') ||
                k.endsWith('dist/config/index.js')) {
                delete require.cache[k];
            }
        }
        globalThis[ENV_MTIME_KEY] =
            envStat.mtimeMs;
    }
}
catch {
    /* noop if .env missing on disk */
}
// override: true guarantees the .env file ALWAYS wins over any stray PORT / env var
// that might already be set in the user's shell / Windows user/system environment.
// (Requires dotenv >= 16; this project ships dotenv ^16.)
const dotenvResult = dotenv_1.default.config({
    path: ENV_PATH,
    override: true,
});
if (dotenvResult.error) {
    // eslint-disable-next-line no-console
    console.warn(`[config] dotenv failed to load .env file — running on pure process.env only. ${dotenvResult.error.message}`);
}
if (dotenvResult.parsed && Object.prototype.hasOwnProperty.call(dotenvResult.parsed, 'PORT')) {
    process_1.default.env.PORT = dotenvResult.parsed.PORT;
}
if (dotenvResult.parsed && Object.prototype.hasOwnProperty.call(dotenvResult.parsed, 'IP_ADDRESS')) {
    process_1.default.env.IP_ADDRESS = dotenvResult.parsed.IP_ADDRESS;
}
function resolvePort(requested, fallback = 5001) {
    if (requested === undefined || requested === null || requested === '') {
        return fallback;
    }
    const n = typeof requested === 'number' ? requested : parseInt(requested, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 65535)
        return n;
    // eslint-disable-next-line no-console
    console.warn(`[config] PORT=${String(requested)} is invalid (expected integer 1-65535). Falling back to ${fallback}.`);
    return fallback;
}
function resolveListenAddress(requested) {
    const clean = (requested || '').toString().trim();
    if (!clean)
        return '0.0.0.0';
    if (clean === '0.0.0.0' || clean === 'localhost' || clean === '127.0.0.1') {
        return clean;
    }
    // Collect all local IPv4 addresses on this machine
    const localIps = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::']);
    Object.values(os_1.default.networkInterfaces()).forEach((nis) => {
        nis?.forEach((n) => {
            if (!n.internal && n.family === 'IPv4')
                localIps.add(n.address);
        });
    });
    if (localIps.has(clean))
        return clean;
    // Requested IP is NOT assigned to any local adapter — fall back gracefully.
    // eslint-disable-next-line no-console
    console.warn(`[config] IP_ADDRESS=${clean} is not assigned to any local adapter (have: ${[
        ...localIps,
    ]
        .filter((x) => x !== '0.0.0.0' && x !== '::')
        .join(', ')}). Falling back to 0.0.0.0 (listen on all interfaces).`);
    return '0.0.0.0';
}
// IMPORTANT: use getters for `ip_address` and `port` (the bindings that depend on
// .env / process.env) so that ts-node-dev respawns OR cached compiled
// config/index.js copies from earlier runs NEVER serve a stale value. The
// trade-off is one extra os.networkInterfaces() + parseInt() call per access,
// which is totally negligible (<1 ms) because config.port/ip_address are
// read once at HTTP listen startup and never in a hot path.
//
// Other values (jwt, aws, branding, etc.) are fine as eager properties because
// if they change you MUST restart anyway (some are security-sensitive and we
// intentionally do NOT want them to change mid-process).
const config = {
    get ip_address() {
        return resolveListenAddress(process_1.default.env.IP_ADDRESS);
    },
    database_url: process_1.default.env.DATABASE_URL,
    node_env: process_1.default.env.NODE_ENV,
    get port() {
        return resolvePort(process_1.default.env.PORT, 5001);
    },
    bcrypt_salt_rounds: process_1.default.env.BCRYPT_SALT_ROUNDS,
    jwt: {
        jwt_secret: process_1.default.env.JWT_SECRET,
        jwt_expire_in: process_1.default.env.JWT_EXPIRE_IN,
        refresh_secret: process_1.default.env.JWT_REFRESH_SECRET || process_1.default.env.JWT_SECRET,
        refresh_expire_in: process_1.default.env.JWT_REFRESH_EXPIRE_IN || process_1.default.env.JWT_EXPIRE_IN,
    },
    email: {
        from: process_1.default.env.EMAIL_FROM,
        fromName: process_1.default.env.EMAIL_FROM_NAME || 'Jbay',
    },
    aws: {
        region: process_1.default.env.AWS_REGION || 'us-east-1',
        accessKeyId: process_1.default.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process_1.default.env.AWS_SECRET_ACCESS_KEY,
        bucket: process_1.default.env.AWS_BUCKET,
        cloudFrontDomain: process_1.default.env.CLOUDFRONT_DOMAIN,
    },
    branding: {
        logoUrl: process_1.default.env.BRAND_LOGO_URL,
        projectName: process_1.default.env.PROJECT_NAME || 'JBAY',
    },
    super_admin: {
        email: process_1.default.env.SUPER_ADMIN_EMAIL,
        password: process_1.default.env.SUPER_ADMIN_PASSWORD,
    },
    rateLimit: {
        windowMs: parseInt(process_1.default.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        max: parseInt(process_1.default.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
        message: process_1.default.env.RATE_LIMIT_MESSAGE || 'Too many requests from this IP, please try again later.',
    },
};
exports.default = config;
//# sourceMappingURL=index.js.map