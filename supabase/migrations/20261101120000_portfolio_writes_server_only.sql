-- Published portfolios are written only by the server (/api/publish-portfolio, service role), which checks the
-- plan's site limit, the content shape and the 1 MB size cap. Signed-in users could otherwise insert or edit
-- rows straight through Supabase's REST API and skip all three. Reading (public links) and deleting own rows stay.
drop policy if exists "published_portfolios_insert_own" on public.published_portfolios;
drop policy if exists "published_portfolios_update_own" on public.published_portfolios;
revoke insert, update on public.published_portfolios from anon, authenticated;
