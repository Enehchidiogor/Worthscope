create table if not exists public.koko_roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career text,
  roadmap_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, career)
);

grant select, insert, update, delete on public.koko_roadmaps to authenticated;
grant all on public.koko_roadmaps to service_role;

alter table public.koko_roadmaps enable row level security;

create policy "Users read own roadmaps" on public.koko_roadmaps for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own roadmaps" on public.koko_roadmaps for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own roadmaps" on public.koko_roadmaps for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own roadmaps" on public.koko_roadmaps for delete to authenticated using (auth.uid() = user_id);

create trigger koko_roadmaps_updated_at before update on public.koko_roadmaps for each row execute function public.update_updated_at_column();