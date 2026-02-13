"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, getInitials, getAvatarColor } from "@/lib/utils/format";
import type { DealWithRelations } from "@/lib/types";

interface DealCardProps {
  deal: DealWithRelations;
  onClick: (deal: DealWithRelations) => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contactName = deal.contact
    ? `${deal.contact.first_name} ${deal.contact.last_name}`
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm cursor-grab",
        "hover:shadow-md hover:border-gray-300",
        "active:cursor-grabbing",
        "transition-all duration-200",
        "dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700",
        isDragging && "shadow-xl rotate-[2deg] opacity-90 z-50"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick(deal);
      }}
    >
      {/* Drag handle indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg opacity-0 group-hover:opacity-100 bg-slate-300 dark:bg-slate-600 transition-opacity" />

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            {deal.title}
          </h4>
          {deal.company && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {deal.company.name}
            </p>
          )}
        </div>

        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {formatCurrency(deal.value)}
        </p>

        <div className="flex items-center justify-between">
          {contactName ? (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center",
                  getAvatarColor(contactName)
                )}
              >
                <span className="text-[10px] font-medium text-white">
                  {getInitials(contactName)}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                {contactName}
              </span>
            </div>
          ) : (
            <div />
          )}

          {deal.expected_close_date && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {formatDate(deal.expected_close_date)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
