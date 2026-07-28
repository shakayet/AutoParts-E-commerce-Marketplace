"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailHelper = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const config_1 = __importDefault(require("../config"));
const logger_1 = require("../shared/logger");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
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
        ];
        const name = err.name || '';
        const code = err.code || '';
        return retryableCodes.some((c) => name.includes(c) || code.includes(c));
    }
    return false;
};
const createSESClient = () => {
    return new client_ses_1.SESClient({
        region: config_1.default.aws.region,
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
const sendEmail = (values) => __awaiter(void 0, void 0, void 0, function* () {
    const client = getSESClient();
    const fromAddress = config_1.default.email.fromName
        ? `"${config_1.default.email.fromName}" ${config_1.default.email.from}`
        : config_1.default.email.from;
    const params = {
        Source: fromAddress,
        Destination: {
            ToAddresses: [values.to],
        },
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
            },
        },
    };
    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const command = new client_ses_1.SendEmailCommand(params);
            const result = yield client.send(command);
            logger_1.logger.info(`Email sent successfully to ${values.to} (attempt ${attempt}/${MAX_RETRIES}), MessageId: ${result.MessageId}`);
            return;
        }
        catch (error) {
            lastError = error;
            if (attempt < MAX_RETRIES && isTransientError(error)) {
                const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
                logger_1.logger.warn(`Email send transient failure to ${values.to} (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delayMs}ms: ${error instanceof Error ? error.message : String(error)}`);
                yield sleep(delayMs);
            }
            else {
                break;
            }
        }
    }
    logger_1.errorLogger.error(`Email send failed to ${values.to} after ${MAX_RETRIES} attempts: ${lastError instanceof Error
        ? `${lastError.name}: ${lastError.message}`
        : String(lastError)}`);
});
exports.emailHelper = {
    sendEmail,
};
