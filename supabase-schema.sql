-- BudgetNest Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  address text,
  status text default 'active' not null,
  currency text default 'MYR' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Budget items table
create table budget_items (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  type text,
  item_name text not null,
  estimate_amount numeric(12,2) default 0,
  actual_amount numeric(12,2) default 0,
  priority integer default 3 not null check (priority between 1 and 3),
  sort_order integer default 0 not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Suppliers table (BEFORE comparison_items because it references suppliers)
create table suppliers (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  website text,
  products text,
  pricing text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Comparisons table
create table comparisons (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text,
  item_type text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Comparison items table
create table comparison_items (
  id uuid default uuid_generate_v4() primary key,
  comparison_id uuid references comparisons(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_name text not null,
  price numeric(12,2) default 0,
  quantity integer default 1,
  transport_cost numeric(12,2) default 0,
  total_cost numeric(12,2) default 0,
  link text,
  supplier_id uuid references suppliers(id) on delete set null,
  remark text,
  is_selected boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Checklist items table
create table checklist_items (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  sort_order integer default 0 not null,
  title text not null,
  due_date timestamptz,
  status text default 'not_started' not null check (status in ('not_started', 'in_progress', 'done')),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Wiring plans table
create table wiring_plans (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  location text not null,
  machine text,
  plug_location text,
  plug_type text,
  wiring_type text,
  quantity integer default 1,
  price_per_unit numeric(12,2) default 0,
  installation_price numeric(12,2) default 0,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Gallery images table
create table gallery_images (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  room text,
  title text,
  description text,
  coohom_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Budget category orders table
create table budget_category_orders (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null,
  unique(project_id, user_id, category)
);

-- Images table (polymorphic)
create table images (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  entity_type text not null,
  entity_id uuid not null,
  storage_path text not null,
  public_url text,
  file_name text,
  file_size integer,
  mime_type text,
  sort_order integer default 0,
  created_at timestamptz default now() not null
);

-- RLS Policies
alter table projects enable row level security;
alter table budget_items enable row level security;
alter table comparisons enable row level security;
alter table comparison_items enable row level security;
alter table suppliers enable row level security;
alter table checklist_items enable row level security;
alter table wiring_plans enable row level security;
alter table gallery_images enable row level security;
alter table budget_category_orders enable row level security;
alter table images enable row level security;

-- Projects policies
create policy "Users can view own projects" on projects for select using (auth.uid() = user_id);
create policy "Users can create own projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on projects for delete using (auth.uid() = user_id);

-- Budget items policies
create policy "Users can view own budget_items" on budget_items for select using (auth.uid() = user_id);
create policy "Users can create own budget_items" on budget_items for insert with check (auth.uid() = user_id);
create policy "Users can update own budget_items" on budget_items for update using (auth.uid() = user_id);
create policy "Users can delete own budget_items" on budget_items for delete using (auth.uid() = user_id);

-- Suppliers policies
create policy "Users can view own suppliers" on suppliers for select using (auth.uid() = user_id);
create policy "Users can create own suppliers" on suppliers for insert with check (auth.uid() = user_id);
create policy "Users can update own suppliers" on suppliers for update using (auth.uid() = user_id);
create policy "Users can delete own suppliers" on suppliers for delete using (auth.uid() = user_id);

-- Comparisons policies
create policy "Users can view own comparisons" on comparisons for select using (auth.uid() = user_id);
create policy "Users can create own comparisons" on comparisons for insert with check (auth.uid() = user_id);
create policy "Users can update own comparisons" on comparisons for update using (auth.uid() = user_id);
create policy "Users can delete own comparisons" on comparisons for delete using (auth.uid() = user_id);

-- Comparison items policies
create policy "Users can view own comparison_items" on comparison_items for select using (auth.uid() = user_id);
create policy "Users can create own comparison_items" on comparison_items for insert with check (auth.uid() = user_id);
create policy "Users can update own comparison_items" on comparison_items for update using (auth.uid() = user_id);
create policy "Users can delete own comparison_items" on comparison_items for delete using (auth.uid() = user_id);

-- Checklist items policies
create policy "Users can view own checklist_items" on checklist_items for select using (auth.uid() = user_id);
create policy "Users can create own checklist_items" on checklist_items for insert with check (auth.uid() = user_id);
create policy "Users can update own checklist_items" on checklist_items for update using (auth.uid() = user_id);
create policy "Users can delete own checklist_items" on checklist_items for delete using (auth.uid() = user_id);

-- Wiring plans policies
create policy "Users can view own wiring_plans" on wiring_plans for select using (auth.uid() = user_id);
create policy "Users can create own wiring_plans" on wiring_plans for insert with check (auth.uid() = user_id);
create policy "Users can update own wiring_plans" on wiring_plans for update using (auth.uid() = user_id);
create policy "Users can delete own wiring_plans" on wiring_plans for delete using (auth.uid() = user_id);

-- Gallery images policies
create policy "Users can view own gallery_images" on gallery_images for select using (auth.uid() = user_id);
create policy "Users can create own gallery_images" on gallery_images for insert with check (auth.uid() = user_id);
create policy "Users can update own gallery_images" on gallery_images for update using (auth.uid() = user_id);
create policy "Users can delete own gallery_images" on gallery_images for delete using (auth.uid() = user_id);

-- Budget category orders policies
create policy "Users can view own budget_category_orders" on budget_category_orders for select using (auth.uid() = user_id);
create policy "Users can create own budget_category_orders" on budget_category_orders for insert with check (auth.uid() = user_id);
create policy "Users can update own budget_category_orders" on budget_category_orders for update using (auth.uid() = user_id);
create policy "Users can delete own budget_category_orders" on budget_category_orders for delete using (auth.uid() = user_id);

-- Images policies
create policy "Users can view own images" on images for select using (auth.uid() = user_id);
create policy "Users can create own images" on images for insert with check (auth.uid() = user_id);
create policy "Users can update own images" on images for update using (auth.uid() = user_id);
create policy "Users can delete own images" on images for delete using (auth.uid() = user_id);

-- Storage bucket for uploads
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true);

-- Storage policies
create policy "Users can upload files" on storage.objects for insert with check (auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can view own files" on storage.objects for select using (auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete own files" on storage.objects for delete using (auth.uid()::text = (storage.foldername(name))[1]);
