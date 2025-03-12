import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.EMAIL_FROM || ''

if (fromEmail === undefined) {
  console.error('fromEmail is undefined, verify your env keys.')
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset Your Tarevity Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Tarevity - Password Reset</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
          <p>To reset your password, click the button below:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>Best regards,<br>The Tarevity Team</p>
        </div>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send the password reset email')
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    throw error
  }
}
