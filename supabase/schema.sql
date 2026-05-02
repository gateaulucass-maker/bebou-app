-- Bebou App — schema Supabase (sans auth, accès PIN local)

drop table if exists transactions cascade;
drop table if exists recurrents cascade;

create table transactions (
  id         text        primary key,
  ts         bigint      not null,
  label      text        not null,
  cat        text        not null,
  amount     numeric     not null,
  income     boolean     default false,
  recurrent  boolean     default false,
  created_at timestamptz default now()
);

create table recurrents (
  id         text        primary key,
  label      text        not null,
  amount     numeric     not null,
  day        integer     not null,
  emoji      text        not null,
  created_at timestamptz default now()
);

-- RLS activé mais accès libre pour la clé anon (app personnelle)
alter table transactions enable row level security;
alter table recurrents   enable row level security;

create policy "transactions: open" on transactions for all to anon using (true) with check (true);
create policy "recurrents: open"   on recurrents   for all to anon using (true) with check (true);
