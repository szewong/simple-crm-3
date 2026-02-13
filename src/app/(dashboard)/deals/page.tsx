import { createClient } from "@/lib/supabase/server";
import { DealsPageClient } from "@/components/deals/deals-page-client";

export default async function DealsPage() {
  const supabase = await createClient();

  // Fetch all data in parallel
  const [dealsRes, stagesRes, contactsRes, companiesRes] = await Promise.all([
    supabase
      .from("deals")
      .select(
        `
        *,
        stage:deal_stages(*),
        contact:contacts(id, first_name, last_name, email, avatar_url),
        company:companies(id, name)
      `
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("deal_stages")
      .select("*")
      .order("position", { ascending: true }),
    supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .order("first_name", { ascending: true }),
    supabase
      .from("companies")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  const deals = (dealsRes.data || []).map((deal) => ({
    ...deal,
    stage: deal.stage || { id: deal.stage_id, name: "Unknown", color: "#94a3b8", position: 0, is_won: false, is_lost: false, created_at: "", user_id: "" },
    contact: deal.contact || null,
    company: deal.company || null,
    tags: [],
  }));

  return (
    <DealsPageClient
      deals={deals}
      stages={stagesRes.data || []}
      contacts={contactsRes.data || []}
      companies={companiesRes.data || []}
    />
  );
}
