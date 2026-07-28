"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailHelper = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const config_1 = __importDefault(require("../config"));
const logger_1 = require("../shared/logger");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email) => {
    return EMAIL_REGEX.test(email);
};
const htmlToText = (html) => {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li[^>]*>/gi, '  • ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n\s*\n+/g, '\n\n')
        .trim();
};
const isTransientError = (err) => {
    if (err instanceof client_ses_1.MessageRejected) {
        return false;
    }
    if (err instanceof Error) {
        const retryableCodes = [
            'Throttling',
            'ThrottlingException',
            'LimitExceededException',
            'RequestLimitExceeded',
            'ServiceUnavailable',
            'InternalError',
            'InternalFailure',
            'ECONNRESET',
            'ETIMEDOUT',
            'ECONNREFUSED',
            'TimeoutError',
            'SocketError',
            'NetworkingError',
            'TooManyRequestsException',
        ];
        const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
        const e = err;
        const name = e.name || '';
        const code = e.code || '';
        const statusCode = e.$metadata?.httpStatusCode;
        const nameOrCodeMatch = retryableCodes.some((c) => name.includes(c) || code.includes(c));
        const statusMatch = typeof statusCode === 'number' && retryableStatusCodes.includes(statusCode);
        return nameOrCodeMatch || statusMatch;
    }
    return false;
};
const createSESClient = () => {
    return new client_ses_1.SESClient({
        region: config_1.default.aws.region,
        maxAttempts: 0,
        credentials: config_1.default.aws.accessKeyId && config_1.default.aws.secretAccessKey
            ? {
                accessKeyId: config_1.default.aws.accessKeyId,
                secretAccessKey: config_1.default.aws.secretAccessKey,
            }
            : undefined,
    });
};
let sesClient = null;
const getSESClient = () => {
    if (!sesClient) {
        sesClient = createSESClient();
    }
    return sesClient;
};
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const sendEmail = async (values) => {
    if (!values.to || !isValidEmail(values.to)) {
        logger_1.errorLogger.error(`Email send aborted: invalid or missing recipient email "${values.to}"`);
        return;
    }
    if (!config_1.default.email.from || !isValidEmail(config_1.default.email.from)) {
        logger_1.errorLogger.error(`Email send aborted: invalid or missing sender email EMAIL_FROM="${config_1.default.email.from}"`);
        return;
    }
    const client = getSESClient();
    const fromAddress = config_1.default.email.fromName
        ? `"${config_1.default.email.fromName}" <${config_1.default.email.from}>`
        : config_1.default.email.from;
    const textBody = htmlToText(values.html);
    const params = {
        Source: fromAddress,
        Destination: {
            ToAddresses: [values.to],
        },
        ReplyToAddresses: [config_1.default.email.from],
        Message: {
            Subject: {
                Data: values.subject,
                Charset: 'UTF-8',
            },
            Body: {
                Html: {
                    Data: values.html,
                    Charset: 'UTF-8',
                },
                Text: {
                    Data: textBody,
                    Charset: 'UTF-8',
                },
            },
        },
    };
    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const command = new client_ses_1.SendEmailCommand(params);
            const result = await client.send(command);
            logger_1.logger.info(`Email sent successfully to ${values.to} (attempt ${attempt}/${MAX_RETRIES}), MessageId: ${result.MessageId}`);
            return;
        }
        catch (error) {
            lastError = error;
            if (attempt < MAX_RETRIES && isTransientError(error)) {
                const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
                logger_1.logger.warn(`Email send transient failure to ${values.to} (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delayMs}ms: ${error instanceof Error ? error.message : String(error)}`);
                await sleep(delayMs);
            }
            else {
                break;
            }
        }
    }
    logger_1.errorLogger.error(`Email send failed to ${values.to} after ${MAX_RETRIES} attempts: ${lastError instanceof Error
        ? `${lastError.name}: ${lastError.message}`
        : String(lastError)}`);
};
exports.emailHelper = {
    sendEmail,
};
//# sourceMappingURL=emailHelper.js.map