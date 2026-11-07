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
<body style="margin: 0; padding: 0; background-color: #f6f5f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f6f5f1; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 36px 24px; border-bottom: 1px solid #f0ede9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #1c1917; font-family: Georgia, serif;">
                      Atten<span style="color: #2d6a4f;">-</span>Dance
                    </div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #78716c; margin-top: 4px; font-weight: 600;">
                      Attendance Strategizer
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #1c1917; font-family: Georgia, serif; line-height: 1.3;">
                Reset Your Password
              </h1>
              
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #44403c;">
                Hello${name ? ` <strong>${name}</strong>` : ''},
              </p>
              
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #44403c;">
                We received a request to reset your password for your <strong>Atten-Dance</strong> account. Click the button below to choose a new password:
              </p>

              <!-- Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #1b4332;">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.2px;">
                      Reset Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Note -->
              <div style="background-color: #f7fbf8; border: 1px solid #d8ebd9; border-radius: 6px; padding: 12px 16px; margin: 24px 0 20px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #2d6a4f;">
                  ⏱ <strong>Note:</strong> This password reset link expires in <strong>${expiresInMinutes} minutes</strong>.
                </p>
              </div>

              <!-- Fallback Plain URL -->
              <p style="margin: 20px 0 8px; font-size: 12px; line-height: 1.6; color: #78716c;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; font-size: 11px; line-height: 1.5; word-break: break-all; color: #2d6a4f;">
                <a href="${url}" target="_blank" style="color: #2d6a4f; text-decoration: underline;">
                  ${url}
                </a>
              </p>

              <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;" />

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a8a29e;">
                If you didn't request a password reset, you can safely ignore this email. Your password won't be changed until you access the link above and create a new one.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px 28px; background-color: #fafaf9; border-top: 1px solid #f0ede9; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #78716c;">
                Atten-Dance &bull; Local-first attendance strategizing with mathematical clarity
              </p>
              <p style="margin: 0; font-size: 10px; color: #a8a29e;">
                This is an automated notification. Please do not reply directly to this email.
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
  return `Atten-Dance Password Reset

Hello${name ? ` ${name}` : ''},

We received a request to reset your password for your Atten-Dance account.

Please visit the link below to choose a new password:
${url}

This link is valid for ${expiresInMinutes} minutes.

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

--
Atten-Dance Team`;
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

