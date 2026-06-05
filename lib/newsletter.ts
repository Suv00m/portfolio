import { supabaseAdmin } from './supabase';

export async function subscribe(email: string): Promise<{ success: boolean; error?: string }> {
  const normalized = email.toLowerCase().trim();

  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { success: false, error: 'Invalid email address' };
  }

  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .insert({ email: normalized });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Already subscribed' };
    }
    console.error('Error subscribing:', error);
    return { success: false, error: 'Failed to subscribe' };
  }

  return { success: true };
}
