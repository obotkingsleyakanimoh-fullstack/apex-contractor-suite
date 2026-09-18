import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "./useSupabaseData";
import type { SiteContent } from "@/types/db";

/** Reads the whole site_content key/value store (small table, cached per page). */
export function useSiteContent() {
  const { data, loading, error, refetch } = useSupabaseData<SiteContent[]>(
    () => supabase.from("site_content").select("*"),
    [],
  );

  const map = useMemo(() => {
    const out: Record<string, unknown> = {};
    for (const row of data ?? []) out[row.key] = row.value;
    return out;
  }, [data]);

  function get<T>(key: string, fallback: T): T {
    const value = map[key];
    return (value ?? fallback) as T;
  }

  return { get, loading, error, refetch, rows: data ?? [] };
}
