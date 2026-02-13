import { createClient } from "@/lib/supabase/server";
import { PipelineSettingsClient } from "@/components/deals/pipeline-settings";

export default async function PipelineSettingsPage() {
  const supabase = await createClient();

  const { data: stages } = await supabase
    .from("deal_stages")
    .select("*")
    .order("position", { ascending: true });

  return <PipelineSettingsClient initialStages={stages || []} />;
}
