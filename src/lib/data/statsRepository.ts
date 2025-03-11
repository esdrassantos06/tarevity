import { redis } from '../redis';
import { supabaseAdmin } from '../supabaseAdmin';

export async function getUserStatsByPriority(userId: string) {
  const cacheKey = `stats:priority:${userId}`;
  
  try {
    const cachedStats = await redis.get(cacheKey);
    if (cachedStats) {
      // Handle the case where Redis might return an object or string
      if (typeof cachedStats === 'string') {
        return JSON.parse(cachedStats);
      } else if (typeof cachedStats === 'object' && cachedStats !== null) {
        // If it's already an object, return it directly
        return cachedStats;
      }
    }
  } catch (err) {
    console.error(`Error retrieving or parsing cached stats for ${userId}:`, err);
    // Continue to fetch from database on error
  }
  
  try {
    const { data, error } = await supabaseAdmin.rpc('get_todos_stats_by_priority', { 
      user_id: userId 
    });
    
    if (error) throw error;
    
    // Always stringify before storing in Redis
    await redis.set(cacheKey, JSON.stringify(data), { ex: 900 });
    
    return data;
  } catch (err) {
    console.error(`Error fetching stats for ${userId}:`, err);
    throw err;
  }
}