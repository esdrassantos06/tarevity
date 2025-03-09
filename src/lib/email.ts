import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.EMAIL_FROM || 'noreply@tarevity.com'

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Redefinir sua senha do Tarevity',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Tarevity - Redefinição de Senha</h2>
          <p>Olá,</p>
          <p>Recebemos uma solicitação para redefinir sua senha. Se você não fez esta solicitação, ignore este email.</p>
          <p>Para redefinir sua senha, clique no botão abaixo:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Redefinir Senha
            </a>
          </p>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>Este link expirará em 1 hora por motivos de segurança.</p>
          <p>Atenciosamente,<br>Equipe Tarevity</p>
        </div>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw new Error('Falha ao enviar o email de redefinição de senha')
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    throw error
  }
}
