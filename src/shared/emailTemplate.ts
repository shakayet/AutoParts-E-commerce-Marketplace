import config from '../config';
import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const getProjectName = () => config.branding.projectName;

const getLogoUrl = () => config.branding.logoUrl || '';

const baseTemplate = (title: string, bodyContent: string) => {
  const projectName = getProjectName();
  const logoUrl = getLogoUrl();
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f5;
      }

      .wrapper {
        width: 100%;
        table-layout: fixed;
        background-color: #f4f4f5;
        padding: 24px 0;
      }

      .main {
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
        background-color: #050816;
        border-radius: 16px;
        border: 1px solid #111827;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        color: #e5e7eb;
      }

      .header {
        padding: 32px 24px 16px;
        text-align: center;
      }

      .brand-name {
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 0.04em;
      }

      .logo {
        display: block;
        margin: 0 auto 24px;
        max-width: 80px;
        height: auto;
        border-radius: 12px;
      }

      .content {
        padding: 8px 24px 24px;
        font-size: 14px;
        line-height: 1.6;
        text-align: center;
      }

      .content-title {
        font-size: 22px;
        font-weight: 600;
        margin: 0 0 12px;
        color: #f9fafb;
      }

      .otp-box {
        display: inline-block;
        margin: 24px 0 8px;
        padding: 14px 32px;
        border-radius: 9999px;
        background-color: #2563eb;
        color: #ffffff;
        font-size: 24px;
        font-weight: 600;
        letter-spacing: 0.25em;
      }

      .footer {
        padding: 16px 24px 24px;
        font-size: 12px;
        color: #9ca3af;
        text-align: center;
        border-top: 1px solid #111827;
      }

      @media screen and (max-width: 600px) {
        .main {
          max-width: 100%;
          border-radius: 0;
          border-left: none;
          border-right: none;
        }

        .content {
          padding: 8px 16px 24px;
        }
      }
    </style>
  </head>
  <body>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="wrapper">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="main">
            <tr>
              <td class="header">
                ${
                  logoUrl
                    ? `<img src="${logoUrl}" alt="${projectName} logo" class="logo" />`
                    : ''
                }
                <div class="brand-name">${projectName}</div>
              </td>
            </tr>
            <tr>
              <td class="content">
                <h1 class="content-title">${title}</h1>
                ${bodyContent}
              </td>
            </tr>
            <tr>
              <td class="footer">
                <div>You are receiving this email from ${projectName}.</div>
                <div>© ${year} ${projectName}. All rights reserved.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const createAccount = (values: ICreateAccount) => {
  const projectName = getProjectName();

  const bodyContent = `
    <p style="margin: 0 0 10px; color: #d1d5db;">
      Hey ${values.name}, use the one-time passcode below to complete verification of your ${projectName} account.
    </p>
    <div class="otp-box">${values.otp}</div>
    <p style="margin: 8px 0 4px; color: #9ca3af;">
      Code expires in 3 minutes.
    </p>
    <p style="margin: 16px 0 0; color: #6b7280;">
      If you did not request this, ignore this email.
    </p>
  `;

  const data = {
    to: values.email,
    subject: `Verify your ${projectName} account`,
    html: baseTemplate('Verify your account', bodyContent),
  };

  return data;
};

const resetPassword = (values: IResetPassword) => {
  const projectName = getProjectName();

  const bodyContent = `
    <p style="margin: 0 0 10px; color: #d1d5db;">
      Use the one-time passcode below to reset the password for your ${projectName} account.
    </p>
    <div class="otp-box">${values.otp}</div>
    <p style="margin: 8px 0 4px; color: #9ca3af;">
      Code expires in 3 minutes.
    </p>
    <p style="margin: 16px 0 0; color: #6b7280;">
      If you did not request this, ignore this email.
    </p>
  `;

  const data = {
    to: values.email,
    subject: `Reset your ${projectName} password`,
    html: baseTemplate('Reset your password', bodyContent),
  };

  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
};
