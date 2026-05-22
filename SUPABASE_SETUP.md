# Supabase Integration Setup Guide

This app now fetches metal rates from Supabase instead of the local tunnel system. Follow these steps to set it up:

## 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Sign in or create an account
3. Create a new project
4. Note your **Project URL** and **Anon Key** (you'll need these)

## 2. Create metal_rates Table

In your Supabase project:

1. Go to **SQL Editor**
2. Create a new query and run this SQL:

```sql
CREATE TABLE metal_rates (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  GL995 NUMERIC NOT NULL,
  GL999_24k NUMERIC,
  GL999_22k NUMERIC,
  GL999_20k NUMERIC,
  GL999_18k NUMERIC,
  SL_999 NUMERIC NOT NULL,
  recorded_on TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create a trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metal_rates_updated_at BEFORE UPDATE ON metal_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data (you can update these values)
INSERT INTO metal_rates (GL995, SL_999) VALUES (7500, 75000);
```

## 3. Enable Realtime Updates (Optional)

For real-time rate updates:

1. Go to **Replication** section in Supabase
2. Enable replication on the `metal_rates` table
3. The app will automatically subscribe to changes

## 4. Configure Environment Variables

1. Create a `.env.local` file in the project root:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

2. Replace with your actual credentials from Supabase project settings

## 5. Install Dependencies

```bash
npm install
```

This will install `@supabase/supabase-js` automatically.

## 6. How It Works

- **Initial Load**: Fetches rates from Supabase when app loads
- **Real-time Updates**: Subscribes to changes in the `metal_rates` table
- **Fallback Cache**: Uses localStorage cache if Supabase is unavailable
- **Manual Entry**: Employees can manually enter rates if needed

## 7. Update Rates

To update metal rates in Supabase:

1. Go to **Data Editor** in Supabase
2. Open the `metal_rates` table
3. Edit the GL995 and SL_999 values
4. Save (the app will receive real-time updates if subscribed)

Or use SQL:

```sql
UPDATE metal_rates SET GL995 = 7600, SL_999 = 75500 WHERE id = 1;
```

## 8. Troubleshooting

- **No credentials error**: Check `.env.local` file and restart dev server
- **Rates not updating**: Verify table name and column names match exactly
- **No real-time updates**: Check if replication is enabled in Supabase
- **Check console**: Browser console will show detailed error messages

## Notes

- Use **Anon Key** for frontend (never expose RLS policies)
- Employees with OTP can see rate errors, customers only see the rate
- All rate changes are automatically cached locally
