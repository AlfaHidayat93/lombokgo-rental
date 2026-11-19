create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- first registered account becomes admin
create or replace function public.assign_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.assign_first_admin();

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  access_token uuid not null default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  item_type text not null,
  item_name text not null,
  start_date date not null,
  quantity int not null default 1,
  unit_label text not null,
  unit_price bigint not null,
  delivery_area text,
  delivery_fee bigint not null default 0,
  total bigint not null,
  payment_method text not null,
  status text not null default 'menunggu_pembayaran',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "admin read orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  access_token uuid not null default gen_random_uuid(),
  guest_name text,
  mode text not null default 'ai',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender text not null,
  content text not null,
  created_at timestamptz not null default now()
);
grant select, update on public.chat_conversations to authenticated;
grant select, insert on public.chat_messages to authenticated;
grant all on public.chat_conversations to service_role;
grant all on public.chat_messages to service_role;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
create policy "admin read convos" on public.chat_conversations for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin update convos" on public.chat_conversations for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin read msgs" on public.chat_messages for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin insert msgs" on public.chat_messages for insert to authenticated with check (public.has_role(auth.uid(), 'admin') and sender = 'admin');
create index on public.chat_messages (conversation_id, created_at);
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.chat_conversations;