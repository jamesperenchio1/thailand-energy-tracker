-- Thailand Energy Price Tracker - Database Schema
-- Run this in Supabase SQL Editor

-- Companies table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- Seed companies
INSERT INTO companies (name_en, name_th, slug) VALUES
  ('PTT', 'ปตท', 'ptt'),
  ('Bangchak', 'บางจาก', 'bangchak'),
  ('Shell', 'เชลล์', 'shell'),
  ('Esso', 'เอสโซ่', 'esso'),
  ('Chevron', 'เชฟรอน', 'chevron'),
  ('IRPC', 'ไออาร์พีซี', 'irpc'),
  ('PTG Energy', 'พีทีจี เอ็นเนอยี', 'ptg-energy'),
  ('Susco', 'ซัสโก้', 'susco'),
  ('Pure', 'เพียว', 'pure'),
  ('SUSCO Dealers', 'ซัสโก้ ดีลเลอร์', 'susco-dealers');

-- Fuel types table
CREATE TABLE fuel_types (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('gasohol', 'benzene', 'diesel'))
);

-- Seed fuel types
INSERT INTO fuel_types (name_en, name_th, category) VALUES
  ('Gasohol 95-E10', 'แก๊สโซฮอล์ ออกเทน 95', 'gasohol'),
  ('Gasohol 95-E20', 'แก๊สโซฮอล์ E20', 'gasohol'),
  ('Gasohol 95-E85', 'แก๊สโซฮอล์ E85', 'gasohol'),
  ('Gasohol 91-E10', 'แก๊สโซฮอล์ ออกเทน 91', 'gasohol'),
  ('Gasohol 95 Premium', 'แก๊สโซฮอล์ ออกเทน 95 พรีเมียม', 'gasohol'),
  ('ULG 95 RON', 'เบนซิน ออกเทน 95', 'benzene'),
  ('Benzene 95 Premium', 'เบนซิน ออกเทน 95 พรีเมียม', 'benzene'),
  ('Diesel B7', 'ดีเซลหมุนเร็ว บี7', 'diesel'),
  ('Diesel B10', 'ดีเซลหมุนเร็ว บี10', 'diesel'),
  ('Diesel B20', 'ดีเซลหมุนเร็ว บี20', 'diesel'),
  ('Premium Diesel', 'ดีเซลหมุนเร็ว พรีเมียม', 'diesel');

-- Oil prices table
CREATE TABLE oil_prices (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  fuel_type_id INTEGER NOT NULL REFERENCES fuel_types(id),
  price DECIMAL(6,2),
  effective_at TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, company_id, fuel_type_id)
);

-- Indexes for common queries
CREATE INDEX idx_oil_prices_date ON oil_prices(date DESC);
CREATE INDEX idx_oil_prices_company ON oil_prices(company_id);
CREATE INDEX idx_oil_prices_fuel_type ON oil_prices(fuel_type_id);
CREATE INDEX idx_oil_prices_date_fuel ON oil_prices(date, fuel_type_id);

-- Electricity rates table
CREATE TABLE electricity_rates (
  id SERIAL PRIMARY KEY,
  effective_date DATE NOT NULL,
  end_date DATE,
  provider TEXT NOT NULL CHECK (provider IN ('PEA', 'MEA', 'both')),
  ft_rate DECIMAL(6,4) NOT NULL,
  base_rate DECIMAL(6,4),
  total_rate DECIMAL(6,4),
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_electricity_rates_date ON electricity_rates(effective_date DESC);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE oil_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE electricity_rates ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access" ON companies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON fuel_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON oil_prices FOR SELECT USING (true);
CREATE POLICY "Public read access" ON electricity_rates FOR SELECT USING (true);

-- Service role write access (for scraper)
CREATE POLICY "Service role write" ON oil_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role update" ON oil_prices FOR UPDATE USING (true);
CREATE POLICY "Service role write" ON electricity_rates FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role update" ON electricity_rates FOR UPDATE USING (true);
