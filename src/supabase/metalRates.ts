import { isSupabaseConfigured, supabase } from "./client";
import type {
  MetalRateRow,
  MetalRatesResponse,
  RateChangePercent,
  RateKey,
} from "./types";

const RATE_KEYS: RateKey[] = [
  "GL995",
  "GL999_24k",
  "GL999_22k",
  "GL999_20k",
  "GL999_18k",
  "SL_999",
];

const FETCH_TIMEOUT_MS = 3000;

const calcChangePercent = (
  latest: MetalRateRow,
  previous?: MetalRateRow
): RateChangePercent => {
  const result = Object.fromEntries(
    RATE_KEYS.map((key) => [key, 0])
  ) as RateChangePercent;

  if (!previous) return result;

  for (const key of RATE_KEYS) {
    const now = Number(latest[key]);
    const before = Number(previous[key]);
    if (before && !isNaN(now) && !isNaN(before)) {
      result[key] = Number((((now - before) / before) * 100).toFixed(2));
    }
  }
  return result;
};

export function subscribeToMetalRateUpdates(
  onUpdate: (updatedRates: Record<string, unknown>) => void,
  onError?: (error: Error) => void,
) {
  if (!isSupabaseConfigured) {
    onError?.(new Error("Supabase is not configured"));
    return () => undefined;
  }

  const channel = supabase.channel("metal_rates_realtime");

  channel.on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "metal_rates" },
    (payload) => {
      const next = payload.new as Record<string, unknown>;
      onUpdate(next);
    }
  );

  channel.subscribe((status) => {
    if (status === "CHANNEL_ERROR" && onError) {
      onError(new Error("Realtime channel failed"));
    }
  });

  return () => {
    void channel.unsubscribe();
  };
}

export async function getMetalRates(): Promise<MetalRatesResponse | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const { data, error } = await supabase
      .from("metal_rates")
      .select(RATE_KEYS.concat("recorded_on" as RateKey).join(", "))
      .order("recorded_on", { ascending: false })
      .limit(2)
      .abortSignal(controller.signal)
      .returns<MetalRateRow[]>();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No metal rates found");

    return {
      result: "Success",
      metalRates: data[0],
      rate_change_percent: calcChangePercent(data[0], data[1]),
    };
  } catch (err) {
    console.error("getMetalRates failed:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}