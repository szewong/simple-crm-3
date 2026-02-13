"use client";

import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/utils/format";
import type { ActivityWithRelations } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import {
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  StickyNote,
} from "lucide-react";
import Link from "next/link";

const typeConfig = {
  call: { icon: Phone, color: "text-blue-600 bg-blue-50" },
  email: { icon: Mail, color: "text-purple-600 bg-purple-50" },
  meeting: { icon: Calendar, color: "text-amber-600 bg-amber-50" },
  task: { icon: CheckSquare, color: "text-emerald-600 bg-emerald-50" },
  note: { icon: StickyNote, color: "text-slate-600 bg-slate-50" },
};

interface RecentActivityProps {
  activities: ActivityWithRelations[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
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
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const config = typeConfig[activity.type];
              const Icon = config.icon;
              const entityName =
                activity.company?.name ||
                (activity.contact
                  ? `${activity.contact.first_name} ${activity.contact.last_name}`
                  : null);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                      config.color
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entityName && <span>{entityName} &middot; </span>}
                      {formatRelativeDate(activity.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
