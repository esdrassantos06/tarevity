import { redis } from '../redis';
import { supabaseAdmin } from '../supabaseAdmin';

interface Todo {
    user_id: string;
    title: string;
    description?: string;
    completed: boolean;

  }


export async function getUserTodos(userId: string): Promise<Todo[]> {
  const cacheKey = `todos:user:${userId}`;
  

  const cachedTodos = await redis.get(cacheKey);
  if (cachedTodos) {
    console.log('Cache hit: User todos');
    return JSON.parse(cachedTodos as string);
  }
  

  const { data, error } = await supabaseAdmin
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  // Armazenar no cache por 5 minutos
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
    

    const cachedTodo = await redis.get(cacheKey);
    if (cachedTodo) {
      return JSON.parse(cachedTodo as string);
    }

    const { data, error } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('id', todoId)
      .single();
      
    if (error) return null;
    
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