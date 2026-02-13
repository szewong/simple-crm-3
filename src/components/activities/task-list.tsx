"use client";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import type { ActivityWithRelations } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { isPast, isToday, parseISO } from "date-fns";

interface TaskListProps {
  tasks: ActivityWithRelations[];
  onUpdate?: () => void;
}

function categorize(tasks: ActivityWithRelations[]) {
  const overdue: ActivityWithRelations[] = [];
  const today: ActivityWithRelations[] = [];
  const upcoming: ActivityWithRelations[] = [];
  const completed: ActivityWithRelations[] = [];

  for (const task of tasks) {
    if (task.is_completed) {
      completed.push(task);
      continue;
    }
    if (!task.due_date) {
      upcoming.push(task);
      continue;
    }
    const due = parseISO(task.due_date);
    if (isToday(due)) {
      today.push(task);
    } else if (isPast(due)) {
      overdue.push(task);
    } else {
      upcoming.push(task);
    }
  }

  return { overdue, today, upcoming, completed };
}

function TaskItem({
  task,
  onToggle,
}: {
  task: ActivityWithRelations;
  onToggle: (id: string, completed: boolean) => void;
}) {
  const [isCompleted, setIsCompleted] = useState(task.is_completed);

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
      .eq("id", task.id);
    onToggle(task.id, newVal);
  }

  const entityName =
    task.company?.name ||
    (task.contact
      ? `${task.contact.first_name} ${task.contact.last_name}`
      : null);

  const dueDateStatus = (() => {
    if (isCompleted) return "completed";
    if (!task.due_date) return "none";
    const due = parseISO(task.due_date);
    if (isPast(due) && !isToday(due)) return "overdue";
    if (isToday(due)) return "today";
    return "upcoming";
  })();

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-50">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggle}
        aria-label={`Mark "${task.title}" as ${isCompleted ? "incomplete" : "complete"}`}
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isCompleted && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        {entityName && (
          <p className="text-xs text-muted-foreground truncate">{entityName}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {task.due_date && (
          <span
            className={cn(
              "text-xs",
              dueDateStatus === "overdue" && "text-rose-600 font-medium",
              dueDateStatus === "today" && "text-amber-600 font-medium",
              dueDateStatus === "upcoming" && "text-muted-foreground",
              dueDateStatus === "completed" && "text-muted-foreground"
            )}
          >
            {formatDate(task.due_date)}
          </span>
        )}
        {dueDateStatus === "overdue" && (
          <Badge variant="destructive" className="text-xs">
            Overdue
          </Badge>
        )}
        {dueDateStatus === "today" && (
          <Badge className="bg-amber-100 text-amber-800 text-xs">Today</Badge>
        )}
      </div>
    </div>
  );
}

export function TaskList({ tasks, onUpdate }: TaskListProps) {
  const { overdue, today, upcoming, completed } = categorize(tasks);

  function handleToggle() {
    onUpdate?.();
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">No tasks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {overdue.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-rose-600 mb-3">
            Overdue
          </h3>
          <div className="space-y-2">
            {overdue.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </div>
        </div>
      )}

      {today.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-amber-600 mb-3">
            Today
          </h3>
          <div className="space-y-2">
            {today.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Upcoming
          </h3>
          <div className="space-y-2">
            {upcoming.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Completed
          </h3>
          <div className="space-y-2">
            {completed.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
