import { createClient } from '@supabase/supabase-js';
import { HistoryItem } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co');

// We use placeholders if missing to prevent the client from throwing an immediate error on import
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co', 
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);

export const saveHistory = async (item: Omit<HistoryItem, 'id' | 'created_at'>) => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('history')
    .insert([item])
    .select()
    .single();
  
  if (error) {
    console.error('Error saving history:', error);
    return null;
  }
  return data;
};
