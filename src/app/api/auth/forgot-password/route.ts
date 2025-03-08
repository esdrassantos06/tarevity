import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
      const { email } = await req.json();
  
      // Validate input
      if (!email || typeof email !== 'string') {
        return NextResponse.json(
          { message: 'Email é obrigatório' },
          { status: 400 }
        );
      }
  
      // Check if user exists
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
  
      // We don't want to reveal if a user exists or not for security reasons
      // So we'll return a success response even if the user doesn't exist
      if (userError || !user) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        // Return success even though we didn't actually send an email
        return NextResponse.json(
          { message: 'Se o endereço de email estiver cadastrado, você receberá as instruções de recuperação' },
          { status: 200 }
        );
      }
  
      // Generate a reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
  
      // Set token expiration (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
  
      // Store reset token in database
      // In a real application, you would have a password_reset_tokens table
      // For now, we'll just simulate this part
      console.log(`Password reset token generated for user ${user.id}: ${resetToken}`);
      console.log(`This token would be stored in the database and would expire at ${expiresAt}`);
  
      // In a real application, you would send an email with a link to reset the password
      // The link would contain the reset token and would point to the password reset page
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
      console.log(`Reset URL (would be sent via email): ${resetUrl}`);
  
      // For development purposes, we'll just log the reset token
      // In production, you would integrate with an email service like SendGrid, Mailgun, etc.
      console.log(`Email would be sent to: ${email}`);
      console.log(`Email content would include the reset URL: ${resetUrl}`);
  
      return NextResponse.json(
        { message: 'Instruções de recuperação enviadas para seu email' },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error in forgot password API:', error);
      return NextResponse.json(
        { message: 'Ocorreu um erro ao processar sua solicitação' },
        { status: 500 }
      );
    }
  }