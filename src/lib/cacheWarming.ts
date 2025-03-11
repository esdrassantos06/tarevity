import { getUserProfile } from '@/lib/data/userRepository';
import { getUserTodos } from '@/lib/data/todoRepository';
import { getUserStatsByPriority } from '@/lib/data/statsRepository';

export async function warmUserCache(userId: string) {
  console.log(`Warming cache for user ${userId}`);
  
  try {
    await Promise.all([
      getUserProfile(userId).catch(err => console.error('Failed to warm profile cache:', err)),
      getUserTodos(userId).catch(err => console.error('Failed to warm todos cache:', err)),
      getUserStatsByPriority(userId).catch(err => console.error('Failed to warm stats cache:', err))
    ]);
    
    console.log(`Cache warming completed for user ${userId}`);
  } catch (error) {
    console.error('Cache warming failed:', error);
  }
}