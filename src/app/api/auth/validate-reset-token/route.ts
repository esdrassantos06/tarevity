import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 400 }
      );
    }

    // In a real application, you would validate the token against your database
    // For this example, we'll consider any token valid for demonstration purposes
    
    // Simulate token validation
    const isValidToken = true; // In reality, you would check if the token exists and hasn't expired
    
    if (!isValidToken) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Token válido' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error validating reset token:', error);
    return NextResponse.json(
      { message: 'Erro ao validar token' },
      { status: 500 }
    );
  }
}