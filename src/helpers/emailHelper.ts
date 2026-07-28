import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
  MessageRejected,
  ServiceOutputTypes,
} from '@aws-sdk/client-ses';
import config from '../config';
import { errorLogger, logger } from '../shared/logger';
import { ISendEmail } from '../types/email';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

const htmlToText = (html: string): string => {
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

type ErrorWithMeta = Error & {
  name: string;
  code?: string;
  $metadata?: ServiceOutputTypes['$metadata'];
};

const isTransientError = (err: unknown): boolean => {
  if (err instanceof MessageRejected) {
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
    const e = err as ErrorWithMeta;
    const name = e.name || '';
    const code = e.code || '';
    const statusCode = e.$metadata?.httpStatusCode;
    const nameOrCodeMatch = retryableCodes.some(
      (c) => name.includes(c) || code.includes(c),
    );
    const statusMatch =
      typeof statusCode === 'number' && retryableStatusCodes.includes(statusCode);
    return nameOrCodeMatch || statusMatch;
  }
  return false;
};

const createSESClient = (): SESClient => {
  return new SESClient({
    region: config.aws.region,
    maxAttempts: 0,
    credentials:
      config.aws.accessKeyId && config.aws.secretAccessKey
        ? {
            accessKeyId: config.aws.accessKeyId,
            secretAccessKey: config.aws.secretAccessKey,
          }
        : undefined,
  });
};

let sesClient: SESClient | null = null;

const getSESClient = (): SESClient => {
  if (!sesClient) {
    sesClient = createSESClient();
  }
  return sesClient;
};

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const sendEmail = async (values: ISendEmail): Promise<void> => {
  if (!values.to || !isValidEmail(values.to)) {
    errorLogger.error(
      `Email send aborted: invalid or missing recipient email "${values.to}"`,
    );
    return;
  }

  if (!config.email.from || !isValidEmail(config.email.from)) {
    errorLogger.error(
      `Email send aborted: invalid or missing sender email EMAIL_FROM="${config.email.from}"`,
    );
    return;
  }

  const client = getSESClient();
  const fromAddress = config.email.fromName
    ? `"${config.email.fromName}" <${config.email.from}>`
    : config.email.from;

  const textBody = htmlToText(values.html);

  const params: SendEmailCommandInput = {
    Source: fromAddress,
    Destination: {
      ToAddresses: [values.to],
    },
    ReplyToAddresses: [config.email.from],
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

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const command = new SendEmailCommand(params);
      const result = await client.send(command);
      logger.info(
        `Email sent successfully to ${values.to} (attempt ${attempt}/${MAX_RETRIES}), MessageId: ${result.MessageId}`,
      );
      return;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES && isTransientError(error)) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        logger.warn(
          `Email send transient failure to ${values.to} (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delayMs}ms: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        await sleep(delayMs);
      } else {
        break;
      }
    }
  }

  errorLogger.error(
    `Email send failed to ${values.to} after ${MAX_RETRIES} attempts: ${
      lastError instanceof Error
        ? `${lastError.name}: ${lastError.message}`
        : String(lastError)
    }`,
  );
};

export const emailHelper = {
  sendEmail,
};
