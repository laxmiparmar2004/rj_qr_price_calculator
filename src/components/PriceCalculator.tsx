import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Info, ChevronDown, Settings } from "lucide-react";

// Fallback URL — move this to an external server later for rate updates without redeployment
const FALLBACK_RATES_URL = "/data/rates.json";
const CACHE_STORAGE_KEY = "rj_metal_rates_cache";

// Utility functions for localStorage cache
const getCachedRates = () => {
  try {
    const cached = localStorage.getItem(CACHE_STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error("Error reading cached rates:", e);
    return null;
  }
};

const saveCachedRates = (data: any) => {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving rates to cache:", e);
  }
};

const formatLastUpdated = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown";
  }
};

type PriceHistoryEntry = { date: string; price: number };

export const PriceCalculator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const d = searchParams.get("d");
  const i = searchParams.get("i");

  useEffect(() => {
    if (i && !d) {
      navigate("/item-detail/" + i);
    }
  });

  // Parse QR data
  const parsed = useMemo(() => {
    if (!d) return null;
    const parts = d.split("_");
    return {
      metalType: parts[0],
      weight: Number(parts[1]),
      makingChargeParam: Number(parts[2] || (parts[0] === "g" ? 15 : 0)),
      rateMultiplierParam: Number(parts[3] || 1),
      discountPercentParam: Number(parts[4] || 0),
    };
  }, [d]);

  const metalType = parsed?.metalType || "";
  const [weight, setWeight] = useState<number>(parsed?.weight || 0);
  const [makingChargePercent, setMakingChargePercent] = useState<number>(parsed?.makingChargeParam || 15);
  const [rateMultiplier, setRateMultiplier] = useState<number>(parsed?.rateMultiplierParam || 1);
  const discountPercent = parsed?.discountPercentParam || 0;

  // Metal rate fetching with standard fetch (fully portable)
  const [metalRateData, setMetalRateData] = useState<any>(null);
  const [metalRateLoading, setMetalRateLoading] = useState(true);
  const [metalRateError, setMetalRateError] = useState(false);
  const [rateSource, setRateSource] = useState<"backend" | "cached" | "manual" | "fallback">("fallback");
  const [rateTimestamp, setRateTimestamp] = useState<string>("");

  useEffect(() => {
    // Try backend first
    fetch("http://localhost:3000/metal/rate")
      .then(res => {
        if (!res.ok) throw new Error("API Error");
        return res.json();
      })
      .then(data => {
        setMetalRateData(data);
        setRateSource("backend");
        setRateTimestamp(new Date().toISOString());
        saveCachedRates(data); // Save to localStorage
        setMetalRateLoading(false);
      })
      .catch(err => {
        console.error("Live rates failed", err);
        
        // Try localStorage cache
        const cached = getCachedRates();
        if (cached?.metalRates) {
          setMetalRateData(cached);
          setRateSource("cached");
          setRateTimestamp(cached.recorded_on || new Date(localStorage.getItem(`${CACHE_STORAGE_KEY}_timestamp`) || Date.now()).toISOString());
          setMetalRateLoading(false);
          return;
        }

        // Fall back to JSON if cache also fails
        setMetalRateError(true);
        setMetalRateLoading(false);
      });
  }, []);

  const [fallbackRates, setFallbackRates] = useState<any>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // Manual rate entry state
  const [showManualRateForm, setShowManualRateForm] = useState(false);
  const [manualGoldRate, setManualGoldRate] = useState("");
  const [manualSilverRate, setManualSilverRate] = useState("");

  const handleManualRateEntry = () => {
    if (!manualGoldRate || !manualSilverRate) {
      alert("Please enter both gold and silver rates");
      return;
    }

    const manualData = {
      metalRates: {
        GL995: Number(manualGoldRate), // Convert from per 10g to total
        SL_999: Number(manualSilverRate), // Convert from per kg to total
        recorded_on: new Date().toISOString(),
      }
    };

    setMetalRateData(manualData);
    saveCachedRates(manualData);
    setRateSource("manual");
    setRateTimestamp(manualData.metalRates.recorded_on);
    setShowManualRateForm(false);
    setManualGoldRate("");
    setManualSilverRate("");
  };

  // Fetch fallback rates if API fails
  useEffect(() => {
    if (metalRateError && !fallbackRates) {
      fetch(FALLBACK_RATES_URL)
        .then((res) => res.json())
        .then((data) => {
          setFallbackRates(data);
          setUsingFallback(true);
          if (!metalRateData) {
            setMetalRateData(data);
            setRateSource("fallback");
            setRateTimestamp(data.recorded_on || new Date().toISOString());
          }
        })
        .catch((err) => console.error("Fallback rates also failed:", err));
    }
  }, [metalRateError, fallbackRates, metalRateData]);

  // Determine effective rates source
  const effectiveRateSource = useMemo(() => {
    if (metalRateData?.metalRates) return metalRateData.metalRates;
    if (fallbackRates?.metalRates) return fallbackRates.metalRates;
    return null;
  }, [metalRateData, fallbackRates]);

  // Compute metal rate per gram
  const metalRate = useMemo(() => {
    if (!effectiveRateSource) return 0;
    if (metalType === "g") {
      return effectiveRateSource.GL995 / 10;
    } else if (metalType === "s") {
      return effectiveRateSource.SL_999 / 1000;
    }
    return 0;
  }, [effectiveRateSource, metalType]);

  // Apply karat multiplier for gold
  useEffect(() => {
    if (metalType === "g" && parsed) {
      if (parsed.rateMultiplierParam === 1 && !(Number(d?.split("_")?.[3]) === 1)) {
        setRateMultiplier(75 / 100); // default 18K
      }
    }
  }, [metalType, parsed, d]);

  // Calculate prices
  const priceBreakdown = useMemo(() => {
    if (metalType === "g") {
      const metalCost = weight * metalRate * rateMultiplier;
      const makingCharges = metalCost * (makingChargePercent / 100);
      const total = metalCost + makingCharges;
      return { metalCost, makingCharges, total, valid: true };
    } else if (metalType === "s") {
      const metalCost = weight * metalRate * rateMultiplier;
      const makingCharges = weight * makingChargePercent; // per gram for silver
      const total = metalCost + makingCharges;
      return { metalCost, makingCharges, total, valid: true };
    } else if (metalType === "a") {
      return { metalCost: 0, makingCharges: 0, total: weight, valid: true };
    }
    return { metalCost: 0, makingCharges: 0, total: 0, valid: false };
  }, [metalType, weight, makingChargePercent, rateMultiplier, metalRate]);

  const originalMinTotal = useMemo(() => {
    if (!parsed) return 0;
    const origMaking = parsed.makingChargeParam;

    if (metalType === "g") {
      const metalCost = weight * metalRate * rateMultiplier;
      const makingCharges = metalCost * (origMaking / 100);
      return metalCost + makingCharges * (1 - discountPercent / 100);
    } else if (metalType === "s") {
      const metalCost = weight * metalRate * rateMultiplier;
      const makingCharges = weight * origMaking;
      return metalCost + makingCharges * (1 - discountPercent / 100);
    } else if (metalType === "a") {
      return weight;
    }
    return 0;
  }, [parsed, metalType, weight, metalRate, rateMultiplier, discountPercent]);

  const originalPrice = useMemo(() => {
    if (!parsed) return 0;
    const origMaking = parsed.makingChargeParam;

    if (metalType === "g") {
      const metalCost = weight * metalRate * rateMultiplier;
      const makingCharges = metalCost * (origMaking / 100);
      return metalCost + makingCharges;
    } else if (metalType === "s") {
      const metalCost = weight * metalRate * rateMultiplier;
      const makingCharges = weight * origMaking;
      return metalCost + makingCharges;
    } else if (metalType === "a") {
      return weight;
    }
    return 0;
  }, [parsed, metalType, weight, metalRate, rateMultiplier]);

  const [showMinPrice, setShowMinPrice] = useState(false);

  const handleRevealMinPrice = () => {
    setShowMinPrice(true);
    setTimeout(() => setShowMinPrice(false), 3000);
  };

  // --- Price History Logic (same pattern as ProductDetail) ---
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);

  useEffect(() => {
    if (!d || !priceBreakdown.valid || !priceBreakdown.total) return;

    try {
      const storageKey = "rj_pc_price_history";
      const stored = localStorage.getItem(storageKey);
      const historyData: Record<string, PriceHistoryEntry[]> = stored ? JSON.parse(stored) : {};
      const itemHistory = historyData[d] || [];
      const todayStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      const currentPrice = Math.round(priceBreakdown.total);

      if (itemHistory.length === 0) {
        const newEntry = { date: todayStr, price: currentPrice };
        historyData[d] = [newEntry];
        localStorage.setItem(storageKey, JSON.stringify(historyData));
        setPriceHistory([newEntry]);
      } else {
        const lastEntry = itemHistory[itemHistory.length - 1];
        const diff = currentPrice - lastEntry.price;
        const percentChange = Math.abs(diff / lastEntry.price);

        if (Math.abs(diff) >= 100 || percentChange >= 0.005) {
          if (lastEntry.date === todayStr) {
            lastEntry.price = currentPrice;
          } else {
            itemHistory.push({ date: todayStr, price: currentPrice });
          }
          historyData[d] = itemHistory;
          localStorage.setItem(storageKey, JSON.stringify(historyData));
        }
        setPriceHistory(historyData[d]);
      }
    } catch (e) {
      console.error("Error managing price history", e);
    }
  }, [d, priceBreakdown.total, priceBreakdown.valid]);

  const hasHistory = priceHistory.length > 1;
  const previousPrice = hasHistory ? priceHistory[priceHistory.length - 2].price : 0;
  const currentPrice = Math.round(priceBreakdown.total);
  const priceDiff = hasHistory ? currentPrice - previousPrice : 0;

  // Helpers
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const metalLabel = metalType === "g" ? "Gold" : metalType === "s" ? "Silver" : "Artificial";
  const metalIcon = metalType === "g" ? "🪙" : metalType === "s" ? "🥈" : "💎";
  const karatDisplay = metalType === "g" ? `${Math.round(rateMultiplier * 24)}K` : "";

  const [breakupOpen, setBreakupOpen] = useState(false);

  // ------- Render -------

  if (!d) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-6xl">📷</div>
          <h2 className="text-xl font-semibold text-gray-800">Scan a QR Code</h2>
          <p className="text-gray-500 text-sm">
            Scan the QR code on any jewellery item to see its live price breakdown.
          </p>
        </div>
      </div>
    );
  }

  if (metalRateLoading && !fallbackRates) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-amber-200" />
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-500 text-sm">Fetching latest rates…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 space-y-5">

      {/* Fallback/Cache/Manual Banner */}
      <div className="space-y-2">
        {usingFallback && !metalRateData && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Using cached rates. Live rates are temporarily unavailable.</span>
          </div>
        )}

        {metalRateData && (
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm ${
            rateSource === "backend"
              ? "bg-green-50 border border-green-200 text-green-800"
              : rateSource === "cached"
              ? "bg-blue-50 border border-blue-200 text-blue-800"
              : rateSource === "manual"
              ? "bg-purple-50 border border-purple-200 text-purple-800"
              : "bg-amber-50 border border-amber-200 text-amber-800"
          }`}>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <div>
                <span className="font-medium">Rate Source:</span>
                <span className="ml-1 capitalize">
                  {rateSource === "backend" ? "Live (Server)" : rateSource === "cached" ? "Cached" : rateSource === "manual" ? "Manual Entry" : "Fallback"}
                </span>
              </div>
            </div>
          </div>
        )}

        {metalRateData && rateTimestamp && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
            <span className="font-medium">Last Updated:</span>
            <span>{formatLastUpdated(rateTimestamp)}</span>
          </div>
        )}
      </div>

      {/* Metal Type Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{metalIcon}</span>
          <div>
            <span
              className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${metalType === "g"
                  ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800"
                  : metalType === "s"
                    ? "bg-gradient-to-r from-slate-100 to-gray-200 text-slate-700"
                    : "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800"
                }`}
            >
              {metalLabel} {karatDisplay}
            </span>
          </div>
        </div>
        {effectiveRateSource?.recorded_on && (
          <span className="text-xs text-gray-400">
            {new Date(effectiveRateSource.recorded_on).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Price Display Card */}
      <div
        className={`relative overflow-hidden rounded-2xl p-6 ${metalType === "g"
            ? "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/60"
            : metalType === "s"
              ? "bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 border border-slate-200/60"
              : "bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 border border-purple-200/60"
          }`}
      >
        {/* Decorative circle */}
        <div
          className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 ${metalType === "g" ? "bg-amber-400" : metalType === "s" ? "bg-slate-400" : "bg-purple-400"
            }`}
        />

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <span
              onClick={handleRevealMinPrice}
              className="text-xs text-gray-500 uppercase tracking-wider font-medium cursor-pointer"
            >
              Approx. Price
            </span>
            {showMinPrice && originalMinTotal > 0 && Math.round(originalMinTotal) < currentPrice && (
              <span className="text-[10px] font-bold text-red-500/80 animate-pulse select-none cursor-default bg-red-50 px-2 py-0.5 rounded-full">
                LIMIT: {formatCurrency(Math.round(originalMinTotal))}
              </span>
            )}
          </div>

          <div className="flex flex-col items-start mt-2">
            {/* Discount Strikethrough & Savings Badge */}
            <div
              className={`flex items-center gap-3 overflow-hidden transition-all duration-500 ease-out ${currentPrice < Math.round(originalPrice) ? "max-h-12 opacity-100 mb-1" : "max-h-0 opacity-0 mb-0"
                }`}
            >
              <span className="text-xl sm:text-2xl text-gray-400 font-medium line-through decoration-red-500/50 decoration-[2px]">
                {formatCurrency(Math.round(originalPrice))}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm shadow-green-500/30">
                Save {formatCurrency(Math.round(originalPrice) - currentPrice)}
              </span>
            </div>

            <div className="flex items-end gap-3">
              <span
                className={`text-4xl sm:text-5xl font-light tracking-tight transition-colors duration-500 ${currentPrice < Math.round(originalPrice)
                    ? "text-emerald-600 font-normal drop-shadow-sm"
                    : metalType === "g" ? "text-amber-900" : metalType === "s" ? "text-slate-800" : "text-purple-900"
                  }`}
              >
                {priceBreakdown.valid ? formatCurrency(currentPrice) : "—"}
              </span>

              {hasHistory && priceDiff !== 0 && (
                <span
                  className={`inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-lg mb-2 ${priceDiff > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
                    }`}
                >
                  {priceDiff > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {formatCurrency(Math.abs(priceDiff))}
                </span>
              )}
            </div>
          </div>

          {/* Rate Info */}
          {metalType !== "a" && (
            <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
              <Info className="w-3 h-3" />
              <span>
                {metalType === "g" ? "Gold 995" : "Silver 999"} Rate:{" "}
                <strong className="text-gray-700">
                  {effectiveRateSource
                    ? `₹${Number(metalType === "g" ? effectiveRateSource.GL995 : effectiveRateSource.SL_999).toLocaleString("en-IN")}`
                    : "—"}
                </strong>
                {metalType === "g" ? " / 10g" : " / kg"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50/70 border-l-4 border-amber-400 px-4 py-3 rounded-r-xl text-sm text-amber-900">
        <p className="font-medium text-xs">Disclaimer</p>
        <p className="opacity-80 text-xs mt-0.5">
          Rates are based on current market prices. Actual price may vary at the time of billing.
        </p>
      </div>

      {/* Editable Parameters */}
      {metalType !== "a" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1.5 shadow-sm">
            <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Weight</label>
            <div className="flex items-end gap-1">
              <input
                type="number"
                step="0.001"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="text-2xl font-light text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 focus:border-amber-400 focus:ring-0 w-full p-0 pb-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-sm text-gray-400 pb-1">g</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1.5 shadow-sm relative">
            <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              {metalType === "g" ? "Making %" : "Making ₹/g"}
            </label>
            <div className="flex items-end gap-1">
              <input
                type="number"
                step="0.1"
                value={makingChargePercent}
                onChange={(e) => setMakingChargePercent(Number(e.target.value))}
                className={`text-2xl font-light bg-transparent border-0 border-b-2 focus:ring-0 w-full p-0 pb-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${currentPrice < Math.round(originalMinTotal)
                    ? "text-red-600 border-red-300 focus:border-red-500"
                    : "text-gray-900 border-gray-200 focus:border-amber-400"
                  }`}
              />
              <span className="text-sm text-gray-400 pb-1">{metalType === "g" ? "%" : "₹/g"}</span>
            </div>
            {currentPrice < Math.round(originalMinTotal) && (
              <span className="absolute -bottom-5 right-2 text-[10px] text-red-500 font-medium">
                Below allowed limit
              </span>
            )}
          </div>
        </div>
      )}

      {/* Price Breakup Accordion */}
      {metalType !== "a" && priceBreakdown.valid && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setBreakupOpen(!breakupOpen)}
            className="flex items-center justify-between w-full px-5 py-4 text-left font-medium text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm">Price Breakup</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${breakupOpen ? "rotate-180" : ""}`}
            />
          </button>

          {breakupOpen && (
            <div className="px-5 pb-4 text-sm space-y-2.5 border-t border-gray-100 pt-3">
              {metalType === "g" && (
                <>
                  <div className="flex justify-between text-gray-500">
                    <span>Rate ({karatDisplay})</span>
                    <span>{formatCurrency(metalRate * rateMultiplier * 10)} / 10g</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Metal Cost ({weight}g × ₹{Math.round(metalRate * rateMultiplier)}/g)</span>
                    <span>{formatCurrency(priceBreakdown.metalCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Making Charges ({makingChargePercent}%)</span>
                    <span>{formatCurrency(priceBreakdown.makingCharges)}</span>
                  </div>
                </>
              )}
              {metalType === "s" && (
                <>
                  <div className="flex justify-between text-gray-500">
                    <span>Silver Rate</span>
                    <span>{formatCurrency(metalRate * 1000)} / kg</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Metal Cost ({weight}g)</span>
                    <span>{formatCurrency(priceBreakdown.metalCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Making Charges (₹{makingChargePercent}/g)</span>
                    <span>{formatCurrency(priceBreakdown.makingCharges)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>Approx. Total</span>
                <span>{formatCurrency(currentPrice)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price History Chart */}
      {hasHistory && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-800">Price History</h3>
            <span className="text-xs text-gray-400">{priceHistory.length} records</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  width={50}
                />
                <Tooltip
                  cursor={{ stroke: "#f3f4f6", strokeWidth: 2, fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "13px",
                  }}
                  formatter={(value) => {
                    const price = typeof value === "number" ? value : Number(value ?? 0)
                    return [`₹${price.toLocaleString("en-IN")}`, "Price"]
                  }}
                  labelStyle={{ color: "#374151", fontWeight: 600, marginBottom: "4px" }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={metalType === "g" ? "#d97706" : metalType === "s" ? "#64748b" : "#9333ea"}
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    fill: metalType === "g" ? "#d97706" : metalType === "s" ? "#64748b" : "#9333ea",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Manual Rate Entry Section */}
      <div className="border-t-2 border-gray-100 pt-4">
        <button
          onClick={() => setShowManualRateForm(!showManualRateForm)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-4 h-4" />
          {showManualRateForm ? "Hide" : "Manual Rate Entry"}
        </button>

        {showManualRateForm && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl space-y-3">
            <div>
              <label className="block text-xs text-gray-600 uppercase tracking-wider font-medium mb-2">
                Gold Rate (₹ per 10g)
              </label>
              <input
                type="number"
                value={manualGoldRate}
                onChange={(e) => setManualGoldRate(e.target.value)}
                placeholder="e.g., 7500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 uppercase tracking-wider font-medium mb-2">
                Silver Rate (₹ per kg)
              </label>
              <input
                type="number"
                value={manualSilverRate}
                onChange={(e) => setManualSilverRate(e.target.value)}
                placeholder="e.g., 75000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
              />
            </div>

            <button
              onClick={handleManualRateEntry}
              className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors text-sm"
            >
              Save Rates
            </button>

            <p className="text-xs text-gray-500 text-center">
              Rates will be saved locally and used when the server is unavailable. When the server comes back online, server rates will take priority.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center space-y-2 pt-2 pb-4">
        <p className="text-xs text-gray-400">
          Powered by <span className="font-semibold text-gray-600">Roopkamal Jewellers</span>
        </p>
        {i && (
          <button
            onClick={() => navigate(`/item-detail/${i}`)}
            className="text-xs text-amber-600 hover:text-amber-700 underline underline-offset-2 transition-colors"
          >
            View full product details →
          </button>
        )}
      </div>
    </div>
  );
};