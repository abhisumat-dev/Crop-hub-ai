-- ============================================================================
-- CropHub AI — Supabase (PostgreSQL) Schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================================

create extension if not exists "pgcrypto";

drop table if exists crops_master cascade;

create table crops_master (
  id                          uuid primary key default gen_random_uuid(),
  crop_id                     text not null unique,        -- stable slug used by the frontend, e.g. 'soybean'
  crop_name                   text not null unique,
  category                    text not null,                -- Oilseed | Cash Crop | Pulse | Cereal | Vegetable | Spice
  preferred_soil_types        text[] not null default '{}',
  ideal_ph_min                decimal(3,1) not null,
  ideal_ph_max                decimal(3,1) not null,
  ideal_nitrogen              text not null,                 -- Low | Medium | High
  ideal_phosphorus            text not null,
  ideal_potassium             text not null,
  water_demand                text not null,                 -- Low | Medium | High | Very High
  water_requirement_mm        int not null,
  growth_cycle_days           int not null,
  base_cost_per_acre          int not null,
  avg_yield_quintals_per_acre decimal(6,2) not null,
  modal_price_per_qtl         int not null,
  trend_7d                    decimal(4,1) not null default 0,
  last_updated                timestamptz not null default now()
);

-- Keep last_updated fresh on every UPDATE (e.g. an APMC admin price edit)
create or replace function set_last_updated()
returns trigger as $$
begin
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_crops_master_last_updated
before update on crops_master
for each row execute function set_last_updated();

-- ----------------------------------------------------------------------------
-- Seed: 10 crops with ICAR-aligned agronomic baselines (Maharashtra Kharif/Rabi
-- context) and modal APMC prices.
-- Original 5: Soybean, Cotton, Tur Dal, Sugarcane, Wheat
-- New 5: Chickpea (Gram), Onion, Groundnut, Jowar (Sorghum), Bajra (Pearl Millet)
-- ----------------------------------------------------------------------------
insert into crops_master (
  crop_id, crop_name, category, preferred_soil_types,
  ideal_ph_min, ideal_ph_max, ideal_nitrogen, ideal_phosphorus, ideal_potassium,
  water_demand, water_requirement_mm, growth_cycle_days,
  base_cost_per_acre, avg_yield_quintals_per_acre, modal_price_per_qtl, trend_7d
) values
  -- ── Original 5 ─────────────────────────────────────────────────────────────
  (
    'soybean', 'Soybean', 'Oilseed',
    array['Black Cotton Soil', 'Alluvial'],
    6.0, 7.5, 'Medium', 'High', 'Medium',
    'Medium', 450, 95,
    18000, 12.0, 4800, 5.2
  ),
  (
    'cotton', 'Cotton', 'Cash Crop',
    array['Black Cotton Soil'],
    6.0, 8.0, 'High', 'Medium', 'Medium',
    'High', 700, 170,
    32000, 10.0, 6500, -2.1
  ),
  (
    'turdal', 'Tur Dal', 'Pulse',
    array['Black Cotton Soil', 'Red Loamy'],
    6.5, 7.5, 'Low', 'Medium', 'Low',
    'Medium', 400, 160,
    16000, 8.0, 7200, 3.4
  ),
  (
    'sugarcane', 'Sugarcane', 'Cash Crop',
    array['Black Cotton Soil', 'Alluvial'],
    6.0, 7.5, 'High', 'High', 'High',
    'Very High', 1800, 365,
    60000, 400.0, 320, 1.2
  ),
  (
    'wheat', 'Wheat', 'Cereal',
    array['Black Cotton Soil', 'Alluvial', 'Red Loamy'],
    6.0, 7.5, 'Medium', 'Medium', 'Low',
    'Medium', 450, 120,
    15000, 18.0, 2400, -0.8
  ),
  -- ── New 5 ──────────────────────────────────────────────────────────────────
  (
    'chickpea', 'Chickpea (Gram)', 'Pulse',
    array['Black Cotton Soil', 'Red Loamy', 'Alluvial'],
    6.0, 8.0, 'Low', 'Medium', 'Low',
    'Low', 300, 110,
    12000, 7.0, 5500, 4.1
  ),
  (
    'onion', 'Onion', 'Vegetable',
    array['Sandy', 'Alluvial', 'Red Loamy'],
    6.0, 7.5, 'Medium', 'Medium', 'High',
    'Medium', 400, 100,
    25000, 120.0, 800, 8.5
  ),
  (
    'groundnut', 'Groundnut', 'Oilseed',
    array['Sandy', 'Red Loamy'],
    6.0, 8.0, 'Low', 'High', 'Medium',
    'Medium', 500, 120,
    20000, 15.0, 5200, 2.7
  ),
  (
    'jowar', 'Jowar (Sorghum)', 'Cereal',
    array['Black Cotton Soil', 'Red Loamy', 'Sandy'],
    6.0, 8.5, 'Low', 'Low', 'Low',
    'Low', 350, 110,
    10000, 14.0, 2200, -1.3
  ),
  (
    'bajra', 'Bajra (Pearl Millet)', 'Cereal',
    array['Sandy', 'Red Loamy'],
    6.0, 8.0, 'Low', 'Low', 'Medium',
    'Low', 250, 90,
    8000, 12.0, 1900, 0.6
  );

-- ----------------------------------------------------------------------------
-- Row Level Security: public read (demo), writes only via service role
-- (the Next.js API routes use the service-role key server-side, never
-- exposed to the browser).
-- ----------------------------------------------------------------------------
alter table crops_master enable row level security;

create policy "Public can read crops"
  on crops_master for select
  using (true);

-- No insert/update/delete policy for the anon/public role is created on
-- purpose — all writes must go through the service-role key used by
-- /api/admin/update-price on the server.
