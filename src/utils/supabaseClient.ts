import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Fetch metal rates from Supabase with rate change calculation
export async function getMetalRates() {
  try {
    // Create a timeout promise (3 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Metal rates fetch timeout (3s)')), 3000)
    );

    // Race between the fetch and timeout
    const response = await Promise.race([
      supabase
        .from('metal_rates')
        .select('GL995, GL999_24k, GL999_22k, GL999_20k, GL999_18k, SL_999, recorded_on')
        .order('recorded_on', { ascending: false })
        .limit(2),
      timeoutPromise as Promise<any>,
    ]);

    const { data, error } = response;

    if (error) {
      console.error('Error fetching metal rates:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.error('No metal rates found in database');
      return null;
    }

    // Calculate rate change percentages
    const rate_change_percent = {
      GL995: 0,
      GL999_24k: 0,
      GL999_22k: 0,
      GL999_20k: 0,
      GL999_18k: 0,
      SL_999: 0,
    };

    const latestMetalRate = data[0];

    // If we have previous rate, calculate percentage change
    if (data.length >= 2) {
      const previousMetalRate = data[1];

      Object.keys(rate_change_percent).forEach((key) => {
        const latest = Number(latestMetalRate[key as keyof typeof latestMetalRate]);
        const previous = Number(previousMetalRate[key as keyof typeof previousMetalRate]);

        if (previous && !isNaN(latest) && !isNaN(previous)) {
          rate_change_percent[key as keyof typeof rate_change_percent] = Number(
            (((latest - previous) / previous) * 100).toFixed(2)
          );
        }
      });

      console.log('Rate change calculated:', rate_change_percent);
    }

    console.log('Metal rates fetched:', latestMetalRate);

    return {
      result: 'Success',
      metalRates: latestMetalRate,
      rate_change_percent,
    };
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}

// Subscribe to real-time metal rate updates
export function subscribeToMetalRateUpdates(
  onUpdate: (data: any) => void,
  onError: (error: any) => void
) {
  const channel = supabase
    .channel('metal_rates_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'metal_rates',
      },
      (payload) => {
        console.log('Metal rates updated in real-time:', payload.new);
        onUpdate(payload.new);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to metal_rates updates');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Channel error while subscribing to metal rates');
        onError(new Error('Real-time subscription failed'));
      }
    });

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
