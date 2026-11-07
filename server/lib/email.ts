import { Resend } from 'resend';

// Initialize Resend lazily so missing key doesn't crash server boot in development
let resendClient: Resend | null = null;
function getResendClient(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'Atten-Dance <onboarding@resend.dev>';

interface SendResetEmailParams {
  to: string;
  name?: string;
  url: string;
  expiresInMinutes?: number;
}

export function generateResetPasswordEmailHtml({
  name,
  url,
  expiresInMinutes = 60,
}: {
  name: string;
  url: string;
  expiresInMinutes?: number;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Atten-Dance Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f5f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f6f5f1; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          
          <!-- Editorial Brand Header -->
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #f0ede9; background-color: #fcfbf9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <!-- Brand Icon Box -->
                        <td style="vertical-align: middle; padding-right: 14px;">
                          <div style="width: 38px; height: 38px; border-radius: 10px; background-color: #1b4332; border: 1px solid #143527; text-align: center; line-height: 38px; color: #ffffff; font-family: Georgia, serif; font-size: 16px; font-weight: 700;">
                            A
                          </div>
                        </td>
                        <!-- Brand Title & Tagline -->
                        <td style="vertical-align: middle;">
                          <div style="font-size: 21px; font-weight: 700; letter-spacing: -0.4px; color: #1c1917; font-family: Georgia, serif; line-height: 1.2;">
                            Atten<span style="color: #2d6a4f;">-</span>Dance
                          </div>
                          <div style="font-size: 12px; color: #78716c; margin-top: 3px; font-style: italic; font-family: Georgia, serif; line-height: 1.3;">
                            Because colleges make you dance for attendance.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 40px 40px 32px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #1c1917; font-family: Georgia, serif; line-height: 1.25; letter-spacing: -0.3px;">
                Reset your password
              </h1>
              
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #44403c;">
                Hi${name ? ` <strong>${name}</strong>` : ''},
              </p>
              
              <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.65; color: #44403c;">
                We received a request to reset your password for your <strong>Atten-Dance</strong> account. Click the button below to choose a new password and regain access to your attendance tracking:
              </p>

              <!-- Prominent Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 30px;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #1b4332; box-shadow: 0 2px 6px rgba(27, 67, 50, 0.25);">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.2px;">
                      Reset My Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security & Expiration Card -->
              <div style="background-color: #f7fbf8; border: 1px solid #d4ebd7; border-radius: 10px; padding: 14px 18px; margin: 0 0 26px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="vertical-align: top; padding-right: 10px; font-size: 15px;">
                      ⏱
                    </td>
                    <td style="font-size: 12px; line-height: 1.55; color: #205c3b;">
                      <strong>Security Notice:</strong> This reset link is single-use and will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not make this request, you can safely disregard this email—your account remains secure.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Fallback Plain-Text Link -->
              <p style="margin: 0 0 8px; font-size: 12px; line-height: 1.6; color: #78716c;">
                Button not working? Copy and paste this URL into your browser:
              </p>
              <div style="background-color: #fafaf9; border: 1px solid #f0ede9; border-radius: 8px; padding: 12px 14px; margin: 0 0 24px; word-break: break-all;">
                <a href="${url}" target="_blank" style="font-size: 11px; line-height: 1.5; color: #2d6a4f; text-decoration: underline; font-family: monospace;">
                  ${url}
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #f0ede9; margin: 28px 0 20px;" />

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a8a29e;">
                This link was requested from the Atten-Dance web application. If you have any questions, feel free to reply to this message.
              </p>
            </td>
          </tr>

          <!-- Branded Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; background-color: #fafaf9; border-top: 1px solid #f0ede9; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; font-weight: 600; color: #44403c; font-family: Georgia, serif;">
                Atten-Dance
              </p>
              <p style="margin: 0 0 8px; font-size: 11px; color: #78716c; font-style: italic;">
                Because colleges make you dance for attendance.
              </p>
              <p style="margin: 0; font-size: 10px; color: #a8a29e; line-height: 1.5;">
                Local-first attendance strategizing with mathematical clarity.<br />
                Automated security transmission &bull; Please do not share this link with anyone.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateResetPasswordEmailText({
  name,
  url,
  expiresInMinutes = 60,
}: {
  name: string;
  url: string;
  expiresInMinutes?: number;
}) {
  return `Atten-Dance
Because colleges make you dance for attendance.
--------------------------------------------------

Hello${name ? ` ${name}` : ''},

We received a request to reset your password for your Atten-Dance account.

Click or paste the link below into your browser to choose a new password:
${url}

⏱ For your security, this password reset link will expire in ${expiresInMinutes} minutes.

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

--
Atten-Dance
Stop guessing, know exactly how many lectures you can skip.`;
}

export async function sendPasswordResetEmail({
  to,
  name,
  url,
  expiresInMinutes = 60,
}: SendResetEmailParams): Promise<{ success: boolean; error?: string }> {
  const displayName = name || to.split('@')[0];
  const resend = getResendClient();

  if (!resend) {
    console.warn('\n' + '═'.repeat(64));
    console.warn('⚠️  [DEV MODE] RESEND_API_KEY is not set in environment.');
    console.warn(`📩  Password reset requested for: ${to}`);
    console.warn(`🔗  Direct reset link:\n    ${url}`);
    console.warn('═'.repeat(64) + '\n');
    return { success: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset your Atten-Dance password',
      html: generateResetPasswordEmailHtml({
        name: displayName,
        url,
        expiresInMinutes,
      }),
      text: generateResetPasswordEmailText({
        name: displayName,
        url,
        expiresInMinutes,
      }),
    });

    if (error) {
      console.error('❌ Failed to send password reset email via Resend:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Password reset email sent via Resend (ID: ${data?.id}) to: ${to}`);
    return { success: true };
  } catch (err: any) {
    console.error('❌ Unexpected error sending password reset email:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

