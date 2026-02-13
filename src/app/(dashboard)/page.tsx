"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import type { ActivityWithRelations } from "@/lib/types";
import { StatCard } from "@/components/dashboard/stat-card";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { Users, Briefcase, DollarSign, Activity } from "lucide-react";
import { startOfWeek, endOfWeek } from "date-fns";

interface DashboardData {
  contactsCount: number;
  activeDealsCount: number;
  pipelineValue: number;
  activitiesThisWeek: number;
  pipelineData: { name: string; count: number; color: string }[];
  recentActivities: ActivityWithRelations[];
  upcomingTasks: ActivityWithRelations[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    const supabase = createClient();
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

    const [
      contactsRes,
      dealsRes,
      stagesRes,
      activitiesWeekRes,
      recentRes,
      tasksRes,
    ] = await Promise.all([
      supabase.from("contacts").select("id", { count: "exact", head: true }),
      supabase.from("deals").select("id, value, stage_id"),
      supabase.from("deal_stages").select("*").order("position"),
      supabase
        .from("activities")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekStart)
        .lte("created_at", weekEnd),
      supabase
        .from("activities")
        .select("*, contact:contacts(*), company:companies(*), deal:deals(*)")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("activities")
        .select("*, contact:contacts(*), company:companies(*), deal:deals(*)")
        .eq("type", "task")
        .eq("is_completed", false)
        .order("due_date", { ascending: true })
        .limit(5),
    ]);

    const deals = dealsRes.data || [];
    const stages = stagesRes.data || [];
    const wonStage = stages.find((s) => s.is_won);
    const lostStage = stages.find((s) => s.is_lost);
    const activeDeals = deals.filter(
      (d) => d.stage_id !== wonStage?.id && d.stage_id !== lostStage?.id
    );
    const pipelineValue = activeDeals.reduce(
      (sum, d) => sum + (d.value || 0),
      0
    );

    const stageCounts = stages
      .filter((s) => !s.is_won && !s.is_lost)
      .map((stage) => ({
        name: stage.name,
        count: deals.filter((d) => d.stage_id === stage.id).length,
        color: stage.color || "#4F46E5",
      }));

    setData({
      contactsCount: contactsRes.count || 0,
      activeDealsCount: activeDeals.length,
      pipelineValue,
      activitiesThisWeek: activitiesWeekRes.count || 0,
      pipelineData: stageCounts,
      recentActivities: (recentRes.data as ActivityWithRelations[]) || [],
      upcomingTasks: (tasksRes.data as ActivityWithRelations[]) || [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-[320px] rounded-xl bg-muted animate-pulse" />
          <div className="h-[320px] rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Contacts"
          value={data.contactsCount.toString()}
          icon={Users}
        />
        <StatCard
          label="Active Deals"
          value={data.activeDealsCount.toString()}
          icon={Briefcase}
        />
        <StatCard
          label="Pipeline Value"
          value={formatCurrency(data.pipelineValue)}
          icon={DollarSign}
        />
        <StatCard
          label="Activities This Week"
          value={data.activitiesThisWeek.toString()}
          icon={Activity}
        />
      </div>

      {/* Pipeline Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PipelineChart data={data.pipelineData} />
        <PipelineChart data={data.pipelineData} />
      </div>

      {/* Activity & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivity activities={data.recentActivities} />
        <UpcomingTasks tasks={data.upcomingTasks} onUpdate={fetchDashboard} />
      </div>
    </div>
  );
}
