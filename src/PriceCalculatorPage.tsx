import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getMetalRates
} from "./supabase";

const CACHE_STORAGE_KEY = "rj_metal_rates_cache";

type MetalRates = {
  GL995: number; // gold 995, ₹ per 10g
  SL_999: number; // silver 999, ₹ per kg
  recorded_on: string;
};

type RateSource = "backend" | "cached" | "none";

const getCachedRates = (): MetalRates | null => {
  try {
    const cached = localStorage.getItem(CACHE_STORAGE_KEY);
    return cached ? JSON.parse(cached)?.metalRates ?? null : null;
  } catch {
    return null;
  }
};

const saveCachedRates = (metalRates: MetalRates) => {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify({ metalRates }));
  } catch {
    /* ignore */
  }
};

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatUpdated = (timestamp: string) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const PriceCalculatorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const d = searchParams.get("d");
  const i = searchParams.get("i");

  useEffect(() => {
    if (i && !d) {
      navigate("/item-detail/" + i);
    }
  }, [i, d, navigate]);

  const parsed = useMemo(() => {
    if (!d) return null;

    const parts = d.split("_");

    return {
      metalType: parts[0],
      weight: Number(parts[1]),
      makingChargeParam: Number(parts[2] || (parts[0] === "g" ? 15 : 0)),
      rateMultiplierParam: Number(parts[3] || 1),
      discountPercentParam: Number(parts[4] || 10),
      // true only when the QR explicitly carried a 4th segment
      hasExplicitMultiplier: parts[3] !== undefined && parts[3] !== "",
    };
  }, [d]);

  // ---------- Metal rate extraction ----------
  const [rates, setRates] = useState<MetalRates | null>(null);
  const [rateSource, setRateSource] = useState<RateSource>("none");
  const [rateLoading, setRateLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchRates = async () => {
    setRetrying(true);
    try {
      const response = await getMetalRates();
      if (!response || response.result !== "Success" || !response.metalRates) {
        throw new Error("Failed to fetch rates from Supabase");
      }
      const next: MetalRates = {
        GL995: response.metalRates.GL995,
        SL_999: response.metalRates.SL_999,
        recorded_on:
          response.metalRates.recorded_on || new Date().toISOString(),
      };
      setRates(next);
      setRateSource("backend");
      saveCachedRates(next);
    } catch (err) {
      console.error("Rate fetch failed", err);
      const cached = getCachedRates();
      if (cached) {
        setRates(cached);
        setRateSource("cached");
      }
    } finally {
      setRateLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchRates();

    
    return () => {
      
    };
  }, []);

  if (!parsed) return null;

  const isGold = parsed.metalType === "g";
  const isSilver = parsed.metalType === "s";
  const hasRate = isGold || isSilver;

  const metalName = isGold
    ? "Gold"
    : isSilver
      ? "Silver"
      : parsed.metalType.toUpperCase();

  // Gold defaults to 18K (0.75) unless the QR explicitly sets a multiplier
  const rateMultiplier =
    isGold && !parsed.hasExplicitMultiplier
      ? 0.75
      : parsed.rateMultiplierParam;

  const karat = isGold ? `24K` : "";

  // Gold: GL995 is ₹/10g -> per gram = /10. Silver: SL_999 is ₹/kg -> per gram = /1000
  const baseRatePerGram = rates
    ? isGold
      ? rates.GL995 / 10
      : isSilver
        ? rates.SL_999 / 1000
        : 0
    : 0;

  const appliedRatePerGram = baseRatePerGram;

  // Display units: gold per 10g, silver per kg (market convention)
  const displayRate = isGold
    ? appliedRatePerGram * 10
    : isSilver
      ? appliedRatePerGram * 1000
      : 0;
  const displayUnit = isGold ? "per 10 g" : "per kg";

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-stone-200/60 overflow-hidden border border-stone-100">
        {/* Header */}
        <div
          className={`px-6 py-6 ${
            isGold
              ? "bg-gradient-to-r from-[#8B6914] to-[#B8922E]"
              : "bg-gradient-to-r from-slate-600 to-slate-400"
          } text-white`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
            Scanned Item
          </p>

          <h1 className="text-2xl font-semibold mt-1">
            {metalName} Jewellery {karat && `· ${karat}`}
          </h1>
        </div>

        {/* Main Weight */}
        <div className="px-6 py-10 text-center">
          <p className="text-xs uppercase tracking-[0.15em] text-stone-400 mb-3">
            Item Weight
          </p>

          <div className="flex items-end justify-center gap-1">
            <span className="text-5xl font-bold tracking-tight text-stone-800">
              {parsed.weight}
            </span>

            <span className="text-lg font-medium text-stone-400 mb-1">g</span>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 pb-7">
          <div className="bg-[#FAF8F5] rounded-2xl px-5 py-1">
            <DetailRow label="Weight" value={`${parsed.weight} g`} />
            <DetailRow label="Metal" value={metalName} />
            {isGold && <DetailRow label="Purity" value={karat} />}

            {hasRate && (
              <DetailRow
                label={`Today's rate (${displayUnit})`}
                value={
                  rateLoading
                    ? "Fetching…"
                    : rates
                      ? formatINR(displayRate)
                      : "Unavailable"
                }
                last
              />
            )}

          </div>

          {/* Rate status */}
          {hasRate && !rateLoading && (
            <div className="mt-3 flex items-center justify-between px-1 text-xs text-stone-400">
              <span>
                {rates
                  ? `${rateSource === "cached" ? "Saved rate" : "Live rate"} · ${formatUpdated(rates.recorded_on)}`
                  : "Live rates could not be loaded"}
              </span>
              {rateSource !== "backend" && (
                <button
                  onClick={fetchRates}
                  disabled={retrying}
                  className="text-amber-700 hover:text-amber-800 underline underline-offset-2 disabled:opacity-50"
                >
                  {retrying ? "Retrying…" : "Retry"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => {
  return (
    <div
      className={`flex items-center justify-between py-4 ${
        !last ? "border-b border-stone-200" : ""
      }`}
    >
      <span className="text-sm text-stone-500">{label}</span>

      <span className="text-sm font-semibold text-stone-800">{value}</span>
    </div>
  );
};