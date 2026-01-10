import { Resend } from 'resend';
import { logger } from './logger';

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
    logger.warn('RESEND_API_KEY is not configured. Cannot send email.', {
      to,
      subject,
    });
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
      logger.error('Failed to send email via Resend', error, {
        to,
        subject,
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } catch (error) {
    logger.error(
      'Error sending email',
      error instanceof Error ? error : new Error(String(error)),
      {
        to,
        subject,
      },
    );
    throw error;
  }
}
