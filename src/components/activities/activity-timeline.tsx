"use client";

import { format, isToday, isYesterday, parseISO } from "date-fns";
import type { ActivityWithRelations } from "@/lib/types";
import { ActivityItem } from "./activity-item";

interface ActivityTimelineProps {
  activities: ActivityWithRelations[];
  onToggleComplete?: (id: string, completed: boolean) => void;
}

function groupByDate(activities: ActivityWithRelations[]) {
  const groups: { label: string; date: string; items: ActivityWithRelations[] }[] = [];
  const map = new Map<string, ActivityWithRelations[]>();

  for (const activity of activities) {
    const dateKey = activity.created_at.slice(0, 10);
    if (!map.has(dateKey)) {
      map.set(dateKey, []);
    }
    map.get(dateKey)!.push(activity);
  }

  for (const [dateKey, items] of map) {
    const parsed = parseISO(dateKey);
    let label: string;
    if (isToday(parsed)) {
      label = "Today";
    } else if (isYesterday(parsed)) {
      label = "Yesterday";
    } else {
      label = format(parsed, "MMM d, yyyy");
    }
    groups.push({ label, date: dateKey, items });
  }

  return groups;
}

export function ActivityTimeline({
  activities,
  onToggleComplete,
}: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">No activities yet</p>
      </div>
    );
  }

  const groups = groupByDate(activities);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.date}>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.items.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
