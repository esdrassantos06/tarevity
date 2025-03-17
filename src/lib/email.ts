import axios from 'axios'

const brevoApiKey = process.env.BREVO_API_KEY
const fromEmail = process.env.EMAIL_FROM || 'noreply@tarevity.com'

export async function sendPasswordResetEmail(email: string, token: string) {
 const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

 // Development mode: just log the reset link
 if (process.env.NODE_ENV === 'development') {
   console.log('=============================================')
   console.log('🔑 PASSWORD RESET LINK (DEV MODE)')
   console.log('=============================================')
   console.log(`To: ${email}`)
   console.log(`URL: ${resetUrl}`)
   console.log('=============================================')
   
   // Simulate success without sending email
   return { success: true, messageId: 'dev-mode-no-email-sent' }
 }

 // Check if API key is configured
 if (!brevoApiKey) {
   console.error('BREVO_API_KEY not found in environment variables')
   throw new Error('Email service configuration error')
 }

 try {
   const response = await axios.post(
     'https://api.brevo.com/v3/smtp/email',
     {
       sender: {
         name: 'Tarevity',
         email: fromEmail
       },
       to: [
         {
           email: email
         }
       ],
       subject: 'Reset Your Tarevity Password',
       htmlContent: `
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
       `
     },
     {
       headers: {
         'accept': 'application/json',
         'api-key': brevoApiKey,
         'content-type': 'application/json'
       }
     }
   )

   return { success: true, messageId: response.data.messageId }
 } catch (error) {
   console.error('Error sending email:', error)
   
   if (axios.isAxiosError(error) && error.response) {
     console.error('Brevo API error:', error.response.data)
   }
   
   throw new Error('Failed to send the password reset email')
 }
}