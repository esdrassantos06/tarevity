import { redis } from '../redis';
import { supabaseAdmin } from '../supabaseAdmin';

interface User {
  id: string;
  name: string;
  email: string;
  provider: string;
  image?: string;
}

type UserProfileUpdate = Omit<Partial<User>, 'id'>;

export async function getUserProfile(userId: string): Promise<User> {
  const cacheKey = `user:profile:${userId}`;
  
  try {
    const cachedProfile = await redis.get(cacheKey);
    if (cachedProfile) {
      // Handle the case where Redis might return an object or string
      if (typeof cachedProfile === 'string') {
        return JSON.parse(cachedProfile);
      } else if (typeof cachedProfile === 'object' && cachedProfile !== null) {
        // If it's already an object, return it directly
        return cachedProfile as User;
      }
    }
  } catch (err) {
    console.error(`Error retrieving or parsing cached profile for ${userId}:`, err);
    // Continue to fetch from database on error
  }
  
  // Fetch from database if not in cache or on error
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, image, provider')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  
  // Always stringify before storing in Redis
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



