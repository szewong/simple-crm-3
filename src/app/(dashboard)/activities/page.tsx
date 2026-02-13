"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityWithRelations } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { TaskList } from "@/components/activities/task-list";
import { ActivityForm } from "@/components/activities/activity-form";
import { Plus } from "lucide-react";

const activityTypes = ["all", "call", "email", "meeting", "task", "note"] as const;

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityWithRelations[]>([]);
  const [tasks, setTasks] = useState<ActivityWithRelations[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("activities")
      .select("*, contact:contacts(*), company:companies(*), deal:deals(*)")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("type", filter);
    }

    const { data } = await query;
    setActivities((data as ActivityWithRelations[]) || []);
    setLoading(false);
  }, [filter]);

  const fetchTasks = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("activities")
      .select("*, contact:contacts(*), company:companies(*), deal:deals(*)")
      .eq("type", "task")
      .order("due_date", { ascending: true });

    setTasks((data as ActivityWithRelations[]) || []);
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchTasks();
  }, [fetchActivities, fetchTasks]);

  function handleSuccess() {
    fetchActivities();
    fetchTasks();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Activities</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Activity
        </Button>
      </div>

      <Tabs defaultValue="all-activities">
        <TabsList>
          <TabsTrigger value="all-activities">All Activities</TabsTrigger>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="all-activities" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {activityTypes.map((type) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilter(type);
                  setLoading(true);
                }}
                className="capitalize"
              >
                {type === "all" ? "All" : type}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <ActivityTimeline
              activities={activities}
              onToggleComplete={handleSuccess}
            />
          )}
        </TabsContent>

        <TabsContent value="my-tasks">
          <TaskList tasks={tasks} onUpdate={fetchTasks} />
        </TabsContent>
      </Tabs>

      <ActivityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
