-- Applied to the cricbooking Supabase project on 2026-11-22.
-- Locks profile roles, makes profiles private, restricts owner applications,
-- and backfills missing profiles.

-- Only admins or the server (service role) may set or change a profile's role.
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_privileged boolean := coalesce(auth.role(), '') = 'service_role'
    or coalesce(public.get_user_role(auth.uid()), '') = 'admin';
begin
  if tg_op = 'INSERT' then
    if not is_privileged then new.role := 'user'; end if;
  elsif new.role is distinct from old.role and not is_privileged then
    raise exception 'Changing a profile role is not allowed' using errcode = '42501';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role before insert or update on public.profiles
  for each row execute function public.guard_profile_role();
revoke all on function public.guard_profile_role() from public, anon, authenticated;

-- Role helper only answers about the signed-in user (or the server).
create or replace function public.get_user_role(user_id uuid)
returns text language sql security definer stable set search_path = public as $$
  select role::text from profiles
  where id = user_id and (user_id = auth.uid() or coalesce(auth.role(), '') = 'service_role');
$$;
revoke all on function public.get_user_role(uuid) from public;
grant execute on function public.get_user_role(uuid) to anon, authenticated, service_role;

-- Owners may see customers who booked their venues.
create or replace function public.is_my_customer(customer_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from bookings b join venues v on v.id = b.venue_id
    where b.user_id = customer_id and v.owner_id = auth.uid()
  );
$$;
revoke all on function public.is_my_customer(uuid) from public, anon;
grant execute on function public.is_my_customer(uuid) to authenticated;

-- Profiles are private.
drop policy if exists "Profiles viewable by everyone" on public.profiles;
drop policy if exists "Users view own profile" on public.profiles;
drop policy if exists "Owners view their customers" on public.profiles;
create policy "Users view own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Owners view their customers" on public.profiles for select to authenticated using (public.is_my_customer(id));
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

-- Reviewer names only (no email or phone).
create or replace function public.get_profile_names(ids uuid[])
returns table (id uuid, full_name text) language sql security definer stable set search_path = public as $$
  select p.id, p.full_name from profiles p where p.id = any(ids) limit 200;
$$;
revoke all on function public.get_profile_names(uuid[]) from public;
grant execute on function public.get_profile_names(uuid[]) to anon, authenticated;

-- Owner applications only for your own account; the website submits through /api/owner-applications.
drop policy if exists "Users can submit applications" on public.owner_applications;
create policy "Users can submit applications" on public.owner_applications for insert to authenticated
  with check (user_id = auth.uid());

-- Sign-up trigger hardening and backfill.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email, new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

insert into public.profiles (id, full_name, email, phone)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', ''), u.email, u.phone
from auth.users u left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

alter function public.generate_daily_slots set search_path = public;
