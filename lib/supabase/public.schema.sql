create table public.households (
  id uuid not null,
  initial_template_name text not null,
  description text null,
  styling jsonb null default '{"colors": {"primary": "3d1e00"}, "icon_name": "house"}'::jsonb,
  constraint households_pkey primary key (id)
) TABLESPACE pg_default;

create table public.inventories (
  id uuid not null,
  name character varying(100) not null,
  description text null,
  household_id uuid null,
  category character varying(200) null,
  draft_status public.draft_status null default 'confirmed'::draft_status,
  is_template boolean null default false,
  styling jsonb null default '{"colors": {"primary": "3d1e00"}, "icon_name": "house"}'::jsonb,
  constraint productinventories_pkey primary key (id),
  constraint productinventories_household_id_fkey foreign KEY (household_id) references households (id) on delete set null
) TABLESPACE pg_default;

create table public.products (
  id uuid not null,
  product_name character varying(255) not null,
  description text null,
  inventory_id uuid null,
  vendor_id uuid null,
  auto_replenish boolean null default false,
  min_quantity integer null,
  max_quantity integer null,
  current_quantity numeric(10, 2) not null,
  quantity_unit public.unit_measurements null default 'pcs'::unit_measurements,
  current_quantity_status public.current_quantity_status null default 'unknown'::current_quantity_status,
  barcode character varying(255) null,
  qr_code character varying(255) null,
  last_scanned timestamp with time zone null,
  scan_history jsonb null,
  expiration_date date null,
  updated_dt timestamp with time zone null default CURRENT_TIMESTAMP,
  draft_status public.draft_status null default 'draft'::draft_status,
  is_template boolean null default false,
  product_category text null default ''::text,
  icon_name character varying(10) null,
  constraint productitems_pkey primary key (id),
  constraint productitems_inventory_id_fkey foreign KEY (inventory_id) references inventories (id) on delete CASCADE,
  constraint productitems_vendor_id_fkey foreign KEY (vendor_id) references suppliers (id) on delete set null
) TABLESPACE pg_default;

create table public.profiles (
  user_id uuid not null,
  email text not null,
  name text not null,
  preferences jsonb null default '{"theme": "system", "boldText": false, "fontSize": "medium", "language": "en", "dataUsage": "normal", "zoomLevel": 1, "fontFamily": "default", "highContrast": false, "reduceMotion": false, "soundEffects": true, "autoPlayVideos": false, "colorBlindMode": "none", "hapticFeedback": true, "textToSpeechRate": 1, "screenReaderEnabled": false, "notificationsEnabled": true}'::jsonb,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  city text null,
  state text null,
  country text null,
  postalcode character varying(20) null,
  phone_number text null,
  constraint userprofiles_pkey primary key (user_id),
  constraint userprofiles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint profiles_city_check check ((char_length(city) <= 100)),
  constraint profiles_country_check check ((char_length(country) <= 100)),
  constraint profiles_phone_number_check check ((char_length(phone_number) <= 15)),
  constraint profiles_state_check check ((char_length(state) <= 100))
) TABLESPACE pg_default;

create table public.related_suppliers (
  vendor_id uuid not null,
  related_vendor_id uuid not null,
  relation_description text null,
  constraint relatedvendors_pkey primary key (vendor_id, related_vendor_id),
  constraint relatedvendors_related_vendor_id_fkey foreign KEY (related_vendor_id) references suppliers (id) on delete CASCADE,
  constraint relatedvendors_vendor_id_fkey foreign KEY (vendor_id) references suppliers (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.suppliers (
  id uuid not null,
  name character varying(255) not null default ''::character varying,
  description text null,
  product_types text[] null,
  vendor_type text[] null,
  addresses text[] null,
  cities text[] null,
  regions text[] null,
  countries text[] null,
  is_retail_chain boolean null default true,
  draft_status public.draft_status null default 'draft'::draft_status,
  vendor_scale public.vendor_scale null default 'domestic'::vendor_scale,
  is_template boolean null default false,
  user_ranking smallint null,
  constraint productvendors_pkey primary key (id),
  constraint suppliers_user_ranking_key unique (user_ranking)
) TABLESPACE pg_default;

create table public.task_assignments (
  task_id uuid not null,
  user_profile_id uuid not null,
  assigned_by uuid null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint taskassignments_pkey primary key (user_profile_id, task_id),
  constraint taskassignments_assigned_by_fkey foreign KEY (assigned_by) references profiles (user_id),
  constraint taskassignments_task_id_fkey foreign KEY (task_id) references tasks (id) on delete CASCADE,
  constraint taskassignments_user_profile_id_fkey foreign KEY (user_profile_id) references profiles (user_id) on delete CASCADE
) TABLESPACE pg_default;

create table public.tasks (
  id uuid not null,
  task_name character varying(255) not null,
  description text null,
  user_id uuid null,
  product_id uuid null,
  due_date date not null,
  completion_status public.completion_status null default 'assigned'::completion_status,
  recurrence_interval interval null,
  recurrence_end_date date null,
  is_automated boolean null default false,
  automation_trigger character varying(255) null,
  created_by uuid not null,
  created_dt timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_dt timestamp with time zone null default CURRENT_TIMESTAMP,
  last_updated_by uuid null,
  draft_status public.draft_status null default 'draft'::draft_status,
  is_template boolean null default false,
  constraint tasks_pkey primary key (id),
  constraint tasks_created_by_fkey foreign KEY (created_by) references profiles (user_id),
  constraint tasks_last_updated_by_fkey foreign KEY (last_updated_by) references profiles (user_id),
  constraint tasks_product_id_fkey foreign KEY (product_id) references products (id) on delete set null,
  constraint tasks_user_id_fkey foreign KEY (user_id) references profiles (user_id) on delete set null
) TABLESPACE pg_default;

create table public.user_households (
  user_id integer not null,
  household_id integer not null,
  access_level public.role_access null default 'guest'::role_access,
  constraint user_households_pkey primary key (user_id, household_id)
) TABLESPACE pg_default;

create index IF not exists idx_userhouseholds_household on public.user_households using btree (household_id) TABLESPACE pg_default;

create index IF not exists idx_userhouseholds_user on public.user_households using btree (user_id) TABLESPACE pg_default;

create table public.task_assignments (
  task_id uuid not null,
  user_profile_id uuid not null,
  assigned_by uuid null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  constraint taskassignments_pkey primary key (user_profile_id, task_id),
  constraint taskassignments_assigned_by_fkey foreign KEY (assigned_by) references profiles (user_id),
  constraint taskassignments_task_id_fkey foreign KEY (task_id) references tasks (id) on delete CASCADE,
  constraint taskassignments_user_profile_id_fkey foreign KEY (user_profile_id) references profiles (user_id) on delete CASCADE
) TABLESPACE pg_default;