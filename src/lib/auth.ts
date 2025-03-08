import { compare, hash } from 'bcryptjs';
import { supabase } from './supabase';

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function createUser(name: string, email: string, password: string) {
  const hashedPassword = await hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        name,
        email,
        password: hashedPassword,
        provider: 'email'
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}