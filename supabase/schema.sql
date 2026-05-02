-- Bebou App — schema Supabase
-- À coller dans l'éditeur SQL de ton projet Supabase

create table if not exists transactions (
  id         text        primary key,
  user_id    uuid        references auth.users not null,
  ts         bigint      not null,
  label      text        not null,
  cat        text        not null,
  amount     numeric     not null,
  income     boolean     default false,
  recurrent  boolean     default false,
  created_at timestamptz default now()
);

create table if not exists recurrents (
  id         text        primary key,
  user_id    uuid        references auth.users not null,
  label      text        not null,
  amount     numeric     not null,
  day        integer     not null,
  emoji      text        not null,
  created_at timestamptz default now()
);

-- Row Level Security : chaque utilisateur voit uniquement ses données
alter table transactions enable row level security;
alter table recurrents   enable row level security;

create policy "transactions: own rows" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "recurrents: own rows" on recurrents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
