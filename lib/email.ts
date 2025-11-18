import { Resend } from 'resend';

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

let resendClient: Resend | null = null;

if (resendApiKey) {
  resendClient = new Resend(resendApiKey);
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailParams): Promise<void> {
  if (!resendClient) {
    console.error('RESEND_API_KEY is not configured. Cannot send email.');
    return;
  }

  try {
    const { error } = await resendClient.emails.send({
      from: resendFromEmail,
      to,
      subject,
      text,
      html: html || text,
    });

    if (error) {
      console.error('Failed to send email via Resend:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
