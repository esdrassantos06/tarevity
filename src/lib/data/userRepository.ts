import { redis } from '../redis';
import { supabaseAdmin } from '../supabaseAdmin';

interface User {
    id: string;
    name: string;
    email: string;
    provider: string;
  }

  type UserProfileUpdate = Omit<Partial<User>, 'id'>;

export async function getUserProfile(userId: string): Promise<User> {
  const cacheKey = `user:profile:${userId}`;
  
  const cachedProfile = await redis.get(cacheKey);
  if (cachedProfile) {
    return JSON.parse(cachedProfile as string);
  }
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, image, provider')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  

  await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });
  
  return data;
}

export async function updateUserProfile(userId: string, profileData: UserProfileUpdate): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  
  await redis.del(`user:profile:${userId}`);
  
  return data;
}