-- SECURITY DEFINER function so anon clients can resolve username → email
-- without exposing any other user data. Called during login to support
-- username-based sign-in while Supabase Auth uses email internally.
create or replace function public.get_email_by_username(p_username text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  select au.email into v_email
  from public.users pu
  join auth.users au on pu.id = au.id
  where lower(pu.username) = lower(p_username);
  return v_email;
end;
$$;

grant execute on function public.get_email_by_username(text) to anon;
