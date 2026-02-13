"use client";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import type { ActivityWithRelations } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { isPast, isToday, parseISO } from "date-fns";
import Link from "next/link";

interface UpcomingTasksProps {
  tasks: ActivityWithRelations[];
  onUpdate?: () => void;
}

export function UpcomingTasks({ tasks, onUpdate }: UpcomingTasksProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  async function handleToggle(id: string) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    const supabase = createClient();
    await supabase
      .from("activities")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);
    onUpdate?.();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
        <CardAction>
          <Link
            href="/activities"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No upcoming tasks
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isDone = completedIds.has(task.id);
              const entityName =
                task.company?.name ||
                (task.contact
                  ? `${task.contact.first_name} ${task.contact.last_name}`
                  : null);

              const dueDateStatus = (() => {
                if (!task.due_date) return "none";
                const due = parseISO(task.due_date);
                if (isPast(due) && !isToday(due)) return "overdue";
                if (isToday(due)) return "today";
                return "upcoming";
              })();

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3"
                >
                  <Checkbox
                    checked={isDone}
                    onCheckedChange={() => handleToggle(task.id)}
                    aria-label={`Complete "${task.title}"`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        isDone && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </p>
                    {entityName && (
                      <p className="text-xs text-muted-foreground truncate">
                        {entityName}
                      </p>
                    )}
                  </div>
                  {task.due_date && (
                    <span
                      className={cn(
                        "text-xs shrink-0",
                        dueDateStatus === "overdue" && "text-rose-600 font-medium",
                        dueDateStatus === "today" && "text-amber-600 font-medium",
                        dueDateStatus === "upcoming" && "text-muted-foreground"
                      )}
                    >
                      {formatDate(task.due_date)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
