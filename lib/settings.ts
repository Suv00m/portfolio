import { supabaseAdmin } from './supabase';

export async function getCronHour(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'cron_hour')
    .single();

  if (error || !data) {
    return 8; // default to 8 AM UTC
  }

  const hour = parseInt(data.value, 10);
  return isNaN(hour) ? 8 : hour;
}

export async function setCronHour(hour: number): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert({ key: 'cron_hour', value: String(hour) }, { onConflict: 'key' });

  if (error) {
    console.error('Error setting cron hour:', error);
    return false;
  }

  return true;
}
