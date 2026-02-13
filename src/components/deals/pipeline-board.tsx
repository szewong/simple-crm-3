"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { DealCard } from "./deal-card";
import type { DealWithRelations, DealStage } from "@/lib/types";

const stageAccentColors: Record<string, string> = {
  lead: "bg-slate-400",
  qualified: "bg-blue-500",
  proposal: "bg-violet-500",
  negotiation: "bg-amber-500",
  won: "bg-emerald-500",
  lost: "bg-rose-500",
};

function getAccentColor(stageName: string, stageColor: string): string {
  const key = stageName.toLowerCase().replace(/\s+/g, "");
  if (key.includes("lead")) return stageAccentColors.lead;
  if (key.includes("qualif")) return stageAccentColors.qualified;
  if (key.includes("proposal")) return stageAccentColors.proposal;
  if (key.includes("negoti")) return stageAccentColors.negotiation;
  if (key.includes("won") || key.includes("closed won")) return stageAccentColors.won;
  if (key.includes("lost") || key.includes("closed lost")) return stageAccentColors.lost;
  return stageColor ? `bg-[${stageColor}]` : "bg-slate-400";
}

interface StageColumnProps {
  stage: DealStage;
  deals: DealWithRelations[];
  isOver: boolean;
  onDealClick: (deal: DealWithRelations) => void;
}

function StageColumn({ stage, deals, isOver, onDealClick }: StageColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage.id });

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const accentColor = getAccentColor(stage.name, stage.color);

  return (
    <div className="flex flex-col w-80 min-w-[320px] shrink-0">
      {/* Column header */}
      <div className="mb-3">
        <div className={cn("h-[3px] rounded-full mb-3", accentColor)} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {stage.name}
            </h3>
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {deals.length}
            </span>
          </div>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Cards container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 flex-1 min-h-[200px] p-1 -m-1 rounded-lg transition-colors",
          isOver && "border-2 border-dashed border-indigo-300 bg-indigo-50/50 dark:border-indigo-500/50 dark:bg-indigo-500/5"
        )}
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onClick={onDealClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

interface PipelineBoardProps {
  deals: DealWithRelations[];
  stages: DealStage[];
  onDealClick: (deal: DealWithRelations) => void;
}

export function PipelineBoard({ deals, stages, onDealClick }: PipelineBoardProps) {
  const router = useRouter();
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [overStageId, setOverStageId] = useState<string | null>(null);
  const [localDeals, setLocalDeals] = useState<DealWithRelations[]>(deals);

  // Update local deals when props change
  if (deals !== localDeals && !activeDealId) {
    setLocalDeals(deals);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const dealsByStage = useCallback(
    (stageId: string) => localDeals.filter((d) => d.stage_id === stageId),
    [localDeals]
  );

  function findStageForDeal(dealId: string): string | undefined {
    const deal = localDeals.find((d) => d.id === dealId);
    return deal?.stage_id;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDealId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverStageId(null);
      return;
    }

    // Check if over a stage column directly
    const isStage = stages.some((s) => s.id === over.id);
    if (isStage) {
      setOverStageId(over.id as string);
    } else {
      // Over a deal card - find its stage
      const stageId = findStageForDeal(over.id as string);
      setOverStageId(stageId || null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDealId(null);
    setOverStageId(null);

    if (!over) return;

    const dealId = active.id as string;

    // Determine target stage
    let targetStageId: string;
    const isStage = stages.some((s) => s.id === over.id);
    if (isStage) {
      targetStageId = over.id as string;
    } else {
      const stageId = findStageForDeal(over.id as string);
      if (!stageId) return;
      targetStageId = stageId;
    }

    const currentStageId = findStageForDeal(dealId);
    if (currentStageId === targetStageId) return;

    // Optimistic update
    setLocalDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? { ...d, stage_id: targetStageId, stage: stages.find((s) => s.id === targetStageId)! }
          : d
      )
    );

    // Persist to Supabase
    const supabase = createClient();
    const { error } = await supabase
      .from("deals")
      .update({ stage_id: targetStageId, updated_at: new Date().toISOString() })
      .eq("id", dealId);

    if (error) {
      // Revert on error
      setLocalDeals((prev) =>
        prev.map((d) =>
          d.id === dealId
            ? { ...d, stage_id: currentStageId!, stage: stages.find((s) => s.id === currentStageId)! }
            : d
        )
      );
    } else {
      router.refresh();
    }
  }

  const activeDeal = activeDealId
    ? localDeals.find((d) => d.id === activeDealId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 px-1">
        {stages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage(stage.id)}
            isOver={overStageId === stage.id}
            onDealClick={onDealClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xl rotate-[2deg] opacity-90 dark:bg-slate-900 dark:border-slate-800 w-80">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {activeDeal.title}
                </h4>
                {activeDeal.company && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {activeDeal.company.name}
                  </p>
                )}
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(activeDeal.value)}
              </p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
