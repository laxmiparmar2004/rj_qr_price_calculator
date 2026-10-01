export type MetalRateRow = {
  GL995: number;
  GL999_24k: number;
  GL999_22k: number;
  GL999_20k: number;
  GL999_18k: number;
  SL_999: number;
  recorded_on: string;
};

export type RateKey = Exclude<keyof MetalRateRow, "recorded_on">;

export type RateChangePercent = Record<RateKey, number>;

export type MetalRatesResponse = {
  result: "Success";
  metalRates: MetalRateRow;
  rate_change_percent: RateChangePercent;
};