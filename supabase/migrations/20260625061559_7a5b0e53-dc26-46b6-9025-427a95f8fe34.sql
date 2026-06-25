
REVOKE EXECUTE ON FUNCTION public.schedule_trend_ingestion(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.schedule_trend_enrichment(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.schedule_trend_ingestion(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.schedule_trend_enrichment(TEXT, TEXT) TO service_role;
