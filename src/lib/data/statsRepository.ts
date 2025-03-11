import { redis } from '../redis';
import { supabaseAdmin } from '../supabaseAdmin';

export async function getUserStatsByPriority(userId: string) {
  const cacheKey = `stats:priority:${userId}`;
  

  const cachedStats = await redis.get(cacheKey);
  if (cachedStats) {
    return JSON.parse(cachedStats as string);
  }
  

  const { data, error } = await supabaseAdmin.rpc('get_todos_stats_by_priority', { 
    user_id: userId 
  });
  
  if (error) throw error;
  
  await redis.set(cacheKey, JSON.stringify(data), { ex: 900 });
  
  return data;
}