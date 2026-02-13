import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const userData = {
    full_name: profile?.full_name || "",
    email: user.email || "",
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar user={userData} />
      <div className="flex-1 ml-64">
        <main>{children}</main>
      </div>
    </div>
  );
}
