"use client";

import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/utils/format";
import type { ActivityWithRelations } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  StickyNote,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const typeConfig = {
  call: { icon: Phone, color: "text-blue-600 bg-blue-50", label: "Call" },
  email: { icon: Mail, color: "text-purple-600 bg-purple-50", label: "Email" },
  meeting: { icon: Calendar, color: "text-amber-600 bg-amber-50", label: "Meeting" },
  task: { icon: CheckSquare, color: "text-emerald-600 bg-emerald-50", label: "Task" },
  note: { icon: StickyNote, color: "text-slate-600 bg-slate-50", label: "Note" },
};

interface ActivityItemProps {
  activity: ActivityWithRelations;
  onToggleComplete?: (id: string, completed: boolean) => void;
}

export function ActivityItem({ activity, onToggleComplete }: ActivityItemProps) {
  const [isCompleted, setIsCompleted] = useState(activity.is_completed);
  const config = typeConfig[activity.type];
  const Icon = config.icon;

  async function handleToggle() {
    const newVal = !isCompleted;
    setIsCompleted(newVal);
    const supabase = createClient();
    await supabase
      .from("activities")
      .update({
        is_completed: newVal,
        completed_at: newVal ? new Date().toISOString() : null,
      })
      .eq("id", activity.id);
    onToggleComplete?.(activity.id, newVal);
  }

  const entityName =
    activity.company?.name ||
    (activity.contact
      ? `${activity.contact.first_name} ${activity.contact.last_name}`
      : null);

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-50">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          config.color
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm font-medium truncate",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {activity.title}
          </p>
          {entityName && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {entityName}
            </Badge>
          )}
        </div>
        {activity.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {activity.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelativeDate(activity.created_at)}
        </span>
        {activity.type === "task" && (
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggle}
            aria-label={`Mark "${activity.title}" as ${isCompleted ? "incomplete" : "complete"}`}
          />
        )}
      </div>
    </div>
  );
}
