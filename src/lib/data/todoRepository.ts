import { redis } from '../redis';
import { supabaseAdmin } from '../supabaseAdmin';

interface Todo {
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  id?: string;
  created_at?: string;
}

export async function getUserTodos(userId: string): Promise<Todo[]> {
  const cacheKey = `todos:user:${userId}`;
  
  try {
    const cachedTodos = await redis.get(cacheKey);
    if (cachedTodos) {
      console.log('Cache hit: User todos');
      // Handle the case where Redis might return an object or string
      if (typeof cachedTodos === 'string') {
        return JSON.parse(cachedTodos);
      } else if (Array.isArray(cachedTodos)) {
        // If it's already an array, return it directly
        return cachedTodos as Todo[];
      }
    }
  } catch (err) {
    console.error(`Error retrieving or parsing cached todos for ${userId}:`, err);
    // Continue to fetch from database on error
  }
  
  // Fetch from database if not in cache or on error
  const { data, error } = await supabaseAdmin
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  // Always stringify before storing in Redis
  await redis.set(cacheKey, JSON.stringify(data), { ex: 300 });
  
  return data;
}

export async function createTodo(todo: Todo): Promise<Todo> {
  const { data, error } = await supabaseAdmin
    .from('todos')
    .insert([todo])
    .select()
    .single();
    
  if (error) throw error;
  
  await redis.del(`todos:user:${todo.user_id}`);
  await redis.del(`stats:user:${todo.user_id}`);
  
  return data;
}

export async function getTodoById(todoId: string): Promise<Todo | null> {
  const cacheKey = `todo:${todoId}`;
  
  try {
    const cachedTodo = await redis.get(cacheKey);
    if (cachedTodo) {
      // Handle the case where Redis might return an object or string
      if (typeof cachedTodo === 'string') {
        return JSON.parse(cachedTodo);
      } else if (typeof cachedTodo === 'object' && cachedTodo !== null) {
        // If it's already an object, return it directly
        return cachedTodo as Todo;
      }
    }
  } catch (err) {
    console.error(`Error retrieving or parsing cached todo ${todoId}:`, err);
    // Continue to fetch from database on error
  }

  const { data, error } = await supabaseAdmin
    .from('todos')
    .select('*')
    .eq('id', todoId)
    .single();
    
  if (error) return null;
  
  // Always stringify before storing in Redis
  await redis.set(cacheKey, JSON.stringify(data), { ex: 300 });
  
  return data;
}

export async function updateTodoWithCache(todoId: string, updates: Partial<Todo>): Promise<Todo | null> {
  const { data, error } = await supabaseAdmin
    .from('todos')
    .update(updates)
    .eq('id', todoId)
    .select()
    .single();
    
  if (error) return null;
  
  const todoKey = `todo:${todoId}`;
  await redis.set(todoKey, JSON.stringify(data), { ex: 300 });
  
  await redis.del(`todos:user:${data.user_id}`);
  
  return data;
}