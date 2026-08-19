-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT throughout.

-- 1. Content table: one row for the live "published" site, one row for the
--    admin's in-progress "draft". The app never writes anywhere else.
create table if not exists site_content (
  state text primary key check (state in ('draft', 'published')),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table site_content enable row level security;
alter table admin_users enable row level security;

-- Only explicitly allowlisted Supabase Auth users are administrators.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_set_updated_at on site_content;
create trigger site_content_set_updated_at
  before update on site_content
  for each row execute function public.set_updated_at();

drop policy if exists "public can read published content" on site_content;
drop policy if exists "authenticated can read all content" on site_content;
drop policy if exists "authenticated can insert content" on site_content;
drop policy if exists "authenticated can update content" on site_content;
drop policy if exists "Public can read published content" on site_content;
drop policy if exists "Admins can insert content" on site_content;
drop policy if exists "Admins can update content" on site_content;
drop policy if exists "Admins can delete content" on site_content;

create policy "Public can read published content"
  on site_content for select
  to anon, authenticated
  using (state = 'published' or public.is_admin());

create policy "Admins can insert content"
  on site_content for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update content"
  on site_content for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete content"
  on site_content for delete
  to authenticated
  using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on site_content to anon, authenticated;
grant insert, update, delete on site_content to authenticated;
revoke all on admin_users from anon, authenticated;

-- 2. Public storage bucket. Public URLs can serve images, while only
-- allowlisted administrators may upload, replace, or delete objects.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public can read gallery images" on storage.objects;
drop policy if exists "authenticated can upload gallery images" on storage.objects;
drop policy if exists "authenticated can update gallery images" on storage.objects;
drop policy if exists "authenticated can delete gallery images" on storage.objects;
drop policy if exists "Public can view site images" on storage.objects;
drop policy if exists "Admins can upload site images" on storage.objects;
drop policy if exists "Admins can update site images" on storage.objects;
drop policy if exists "Admins can delete site images" on storage.objects;

create policy "Admins can upload site images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images' and public.is_admin());

create policy "Admins can update site images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images' and public.is_admin())
  with check (bucket_id = 'site-images' and public.is_admin());

create policy "Admins can delete site images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-images' and public.is_admin());

-- 3. Seed both rows with the site's current content (identical to what was
--    previously hardcoded in lib/content.ts). Safe to re-run.
insert into site_content (state, data)
values
  ('published', $seed${"images":{"heroMain":{"src":"/assets/slots/hero-main.jpg","artist":"Sofia Feucht","title":"","year":"2026","shortText":"","hidden":false,"size":"large","alt":"Konstverk av Sofia Feucht"},"heroC1":{"src":"/assets/slots/hero-collage-1.jpg","artist":"Daniela Eriksson","title":"","year":"2026","shortText":"","hidden":false,"size":"medium","alt":"Konstverk av Daniela Eriksson"},"heroC2":{"src":"/assets/slots/hero-collage-2.jpg","artist":"Ulrika W","title":"","year":"2026","shortText":"","hidden":false,"size":"medium","alt":"Konstverk av Ulrika W"},"heroSide":{"src":"/assets/slots/hero-side.jpg","artist":"Rebekka RvK","title":"","year":"2027","shortText":"","hidden":false,"size":"medium","alt":"Konstverk av Rebekka RvK"},"heroSideExtra":{"src":"/assets/slots/hero-side-extra.jpg","artist":"Sofia Feucht","title":"","year":"2026","shortText":"","hidden":false,"size":"medium","alt":"Konstverk av Sofia Feucht"},"heroWide":{"src":"/assets/slots/hero-wide.jpg","artist":"Sofia Feucht","title":"","year":"2026","shortText":"","hidden":false,"size":"large","alt":"Utställningsvy, Galleri 86"},"curImg":{"src":"/assets/slots/current-exhibition.jpg","artist":"Sofia Feucht","title":"Dissonans","year":"2026","shortText":"En serie målningar som rör sig mellan det figurativa och det upplösta.","hidden":false,"size":"large","alt":"Verk från aktuell utställning: Sofia Feucht, Dissonans"},"curPopupImg":{"src":"/assets/slots/current-exhibition.jpg","artist":"Sofia Feucht","title":"Dissonans","year":"2026","shortText":"En serie målningar som rör sig mellan det figurativa och det upplösta.","hidden":false,"size":"large","alt":"Verk från aktuell utställning: Sofia Feucht, Dissonans"},"spaceImg":{"src":"/assets/slots/gallery-space.jpg","artist":"","title":"","year":"","shortText":"Interiör, Skånegatan 86","hidden":false,"size":"large","alt":"Interiörbild av Galleri 86, Skånegatan 86"}},"artists":[{"key":"artist-daniela","name":"Daniela Eriksson","date":"Vår 2026","src":"/assets/slots/artist-daniela.jpg","artist":"Daniela Eriksson","title":"","year":"Vår 2026","shortText":"","hidden":false,"size":"medium","alt":"Verk av Daniela Eriksson"},{"key":"artist-sofia","name":"Sofia Feucht","date":"Höst 2026","src":"/assets/slots/artist-sofia.jpg","artist":"Sofia Feucht","title":"","year":"Höst 2026","shortText":"","hidden":false,"size":"medium","alt":"Verk av Sofia Feucht"},{"key":"artist-ulrika","name":"Ulrika W","date":"Vinter 2026","src":"/assets/slots/artist-ulrika.jpg","artist":"Ulrika W","title":"","year":"Vinter 2026","shortText":"","hidden":false,"size":"medium","alt":"Verk av Ulrika W"},{"key":"artist-rebekka","name":"Rebekka RvK","date":"Vår 2027","src":"/assets/slots/artist-rebekka.jpg","artist":"Rebekka RvK","title":"","year":"Vår 2027","shortText":"","hidden":false,"size":"medium","alt":"Verk av Rebekka RvK"}],"collage":[{"key":"collage-1","kind":"wide","src":"/assets/slots/collage-1.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-2","kind":"small","src":"/assets/slots/collage-2.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-3","kind":"small","src":"/assets/slots/collage-3.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-4","kind":"small","src":"/assets/slots/collage-4.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-5","kind":"wide","src":"/assets/slots/collage-5.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-6","kind":"small","src":"/assets/slots/collage-6.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-7","kind":"small","src":"/assets/slots/collage-7.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-8","kind":"small","src":"/assets/slots/collage-8.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-9","kind":"small","src":"/assets/slots/collage-9.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-10","kind":"small","src":"/assets/slots/collage-10.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-11","kind":"wide","src":"/assets/slots/collage-11.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-12","kind":"small","src":"/assets/slots/collage-12.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-13","kind":"small","src":"/assets/slots/collage-13.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"}],"texts":{"intro":"Nära Nytorget på Södermalm vill vi skapa en plats där konstnärer får möta sin publik i en nära, avslappnad miljö. Galleriet drivs med ett stort intresse för konst, människor och möten — med ambitionen att varje utställning ska få kännas personlig.","curTitle":"Sofia Feucht","curSub":"Dissonans","curDesc":"En serie målningar som rör sig mellan det figurativa och det upplösta — ytor som söker sin form och sedan lämnar den igen.","curLongDesc":"I Dissonans arbetar Sofia Feucht i gränslandet mellan det figurativa och det upplösta. Motiven anas snarare än fastställs — en kontur, en rörelse, ett ljus som glider över ytan innan det försvinner igen.\n\nMålningarna byggs upp i lager där form och färg får söka sin egen väg. Vissa partier stannar kvar som tydliga fragment, andra löses upp i stämning och atmosfär. Resultatet är en serie verk som balanserar mellan igenkänning och abstraktion — en dissonans som aldrig riktigt löses upp, utan får finnas kvar som en öppen fråga.","spaceH":"Ett litet galleri mitt på Södermalm","spaceP":"Vad roligt att du är intresserad av att visa din konst hos oss!\n\nGalleri 86 Stockholm är ett konstnärsdrivet galleri, där du själv ansvarar för den största delen av utställningen, vilket innebär att du har stora möjligheter och frihet att skapa den utställning du själv önskar – självklart med råd och stöd av oss.\n\nGalleriet ligger på Skånegatan 86, ett stenkast från Nytorget, mitt på Södermalm och folktäta SoFo i Stockholm. Skånegatan har gott om butiker, vintage shopping, restauranger, caféer och många människor som både bor och rör sig i området."},"schedule":[{"day":"monday","label":"MÅN","description":"Stängt för publik","closed":true,"opensAt":null,"closesAt":null},{"day":"tuesday","label":"TIS","description":"Uppbyggnad av utställning","closed":true,"opensAt":null,"closesAt":null},{"day":"wednesday","label":"ONS","description":"Visning: Sofia Feucht","closed":false,"opensAt":"12:00","closesAt":"18:00"},{"day":"thursday","label":"TOR","description":"Artist talk kl 17","closed":false,"opensAt":"12:00","closesAt":"18:00"},{"day":"friday","label":"FRE","description":"Öppet hus","closed":false,"opensAt":"12:00","closesAt":"18:00"},{"day":"saturday","label":"LÖR","description":"Guidad rundvandring kl 13","closed":false,"opensAt":"12:00","closesAt":"16:00"},{"day":"sunday","label":"SÖN","description":"Familjevisning","closed":false,"opensAt":"12:00","closesAt":"16:00"}]}
$seed$::jsonb),
  ('draft', $seed${"images":{"heroMain":{"src":"/assets/slots/hero-main.jpg","artist":"Sofia Feucht","title":"","year":"2026","shortText":"","hidden":false,"size":"large","alt":"Konstverk av Sofia Feucht"},"heroC1":{"src":"/assets/slots/hero-collage-1.jpg","artist":"Daniela Eriksson","title":"","year":"2026","shortText":"","hidden":false,"size":"medium","alt":"Konstverk av Daniela Eriksson"},"heroC2":{"src":"/assets/slots/hero-collage-2.jpg","artist":"Ulrika W","title":"","year":"2026","shortText":"","hidden":false,"size":"medium","alt":"Konstverk av Ulrika W"},"heroSide":{"src":"/assets/slots/hero-side.jpg","artist":"Rebekka RvK","title":"","year":"2027","shortText":"","hidden":false,"size":"medium","alt":"Konstverk av Rebekka RvK"},"heroSideExtra":{"src":"/assets/slots/hero-side-extra.jpg","artist":"Sofia Feucht","title":"","year":"2026","shortText":"","hidden":false,"size":"medium","alt":"Konstverk av Sofia Feucht"},"heroWide":{"src":"/assets/slots/hero-wide.jpg","artist":"Sofia Feucht","title":"","year":"2026","shortText":"","hidden":false,"size":"large","alt":"Utställningsvy, Galleri 86"},"curImg":{"src":"/assets/slots/current-exhibition.jpg","artist":"Sofia Feucht","title":"Dissonans","year":"2026","shortText":"En serie målningar som rör sig mellan det figurativa och det upplösta.","hidden":false,"size":"large","alt":"Verk från aktuell utställning: Sofia Feucht, Dissonans"},"curPopupImg":{"src":"/assets/slots/current-exhibition.jpg","artist":"Sofia Feucht","title":"Dissonans","year":"2026","shortText":"En serie målningar som rör sig mellan det figurativa och det upplösta.","hidden":false,"size":"large","alt":"Verk från aktuell utställning: Sofia Feucht, Dissonans"},"spaceImg":{"src":"/assets/slots/gallery-space.jpg","artist":"","title":"","year":"","shortText":"Interiör, Skånegatan 86","hidden":false,"size":"large","alt":"Interiörbild av Galleri 86, Skånegatan 86"}},"artists":[{"key":"artist-daniela","name":"Daniela Eriksson","date":"Vår 2026","src":"/assets/slots/artist-daniela.jpg","artist":"Daniela Eriksson","title":"","year":"Vår 2026","shortText":"","hidden":false,"size":"medium","alt":"Verk av Daniela Eriksson"},{"key":"artist-sofia","name":"Sofia Feucht","date":"Höst 2026","src":"/assets/slots/artist-sofia.jpg","artist":"Sofia Feucht","title":"","year":"Höst 2026","shortText":"","hidden":false,"size":"medium","alt":"Verk av Sofia Feucht"},{"key":"artist-ulrika","name":"Ulrika W","date":"Vinter 2026","src":"/assets/slots/artist-ulrika.jpg","artist":"Ulrika W","title":"","year":"Vinter 2026","shortText":"","hidden":false,"size":"medium","alt":"Verk av Ulrika W"},{"key":"artist-rebekka","name":"Rebekka RvK","date":"Vår 2027","src":"/assets/slots/artist-rebekka.jpg","artist":"Rebekka RvK","title":"","year":"Vår 2027","shortText":"","hidden":false,"size":"medium","alt":"Verk av Rebekka RvK"}],"collage":[{"key":"collage-1","kind":"wide","src":"/assets/slots/collage-1.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-2","kind":"small","src":"/assets/slots/collage-2.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-3","kind":"small","src":"/assets/slots/collage-3.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-4","kind":"small","src":"/assets/slots/collage-4.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-5","kind":"wide","src":"/assets/slots/collage-5.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-6","kind":"small","src":"/assets/slots/collage-6.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-7","kind":"small","src":"/assets/slots/collage-7.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-8","kind":"small","src":"/assets/slots/collage-8.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-9","kind":"small","src":"/assets/slots/collage-9.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-10","kind":"small","src":"/assets/slots/collage-10.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-11","kind":"wide","src":"/assets/slots/collage-11.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-12","kind":"small","src":"/assets/slots/collage-12.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"},{"key":"collage-13","kind":"small","src":"/assets/slots/collage-13.jpg","artist":"","title":"","year":"","shortText":"","hidden":false,"size":"small","alt":"Galleribild"}],"texts":{"intro":"Nära Nytorget på Södermalm vill vi skapa en plats där konstnärer får möta sin publik i en nära, avslappnad miljö. Galleriet drivs med ett stort intresse för konst, människor och möten — med ambitionen att varje utställning ska få kännas personlig.","curTitle":"Sofia Feucht","curSub":"Dissonans","curDesc":"En serie målningar som rör sig mellan det figurativa och det upplösta — ytor som söker sin form och sedan lämnar den igen.","curLongDesc":"I Dissonans arbetar Sofia Feucht i gränslandet mellan det figurativa och det upplösta. Motiven anas snarare än fastställs — en kontur, en rörelse, ett ljus som glider över ytan innan det försvinner igen.\n\nMålningarna byggs upp i lager där form och färg får söka sin egen väg. Vissa partier stannar kvar som tydliga fragment, andra löses upp i stämning och atmosfär. Resultatet är en serie verk som balanserar mellan igenkänning och abstraktion — en dissonans som aldrig riktigt löses upp, utan får finnas kvar som en öppen fråga.","spaceH":"Ett litet galleri mitt på Södermalm","spaceP":"Vad roligt att du är intresserad av att visa din konst hos oss!\n\nGalleri 86 Stockholm är ett konstnärsdrivet galleri, där du själv ansvarar för den största delen av utställningen, vilket innebär att du har stora möjligheter och frihet att skapa den utställning du själv önskar – självklart med råd och stöd av oss.\n\nGalleriet ligger på Skånegatan 86, ett stenkast från Nytorget, mitt på Södermalm och folktäta SoFo i Stockholm. Skånegatan har gott om butiker, vintage shopping, restauranger, caféer och många människor som både bor och rör sig i området."},"schedule":[{"day":"monday","label":"MÅN","description":"Stängt för publik","closed":true,"opensAt":null,"closesAt":null},{"day":"tuesday","label":"TIS","description":"Uppbyggnad av utställning","closed":true,"opensAt":null,"closesAt":null},{"day":"wednesday","label":"ONS","description":"Visning: Sofia Feucht","closed":false,"opensAt":"12:00","closesAt":"18:00"},{"day":"thursday","label":"TOR","description":"Artist talk kl 17","closed":false,"opensAt":"12:00","closesAt":"18:00"},{"day":"friday","label":"FRE","description":"Öppet hus","closed":false,"opensAt":"12:00","closesAt":"18:00"},{"day":"saturday","label":"LÖR","description":"Guidad rundvandring kl 13","closed":false,"opensAt":"12:00","closesAt":"16:00"},{"day":"sunday","label":"SÖN","description":"Familjevisning","closed":false,"opensAt":"12:00","closesAt":"16:00"}]}
$seed$::jsonb)
on conflict (state) do nothing;
