"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PipelineBoard } from "./pipeline-board";
import { DealsTable } from "./deals-table";
import { DealForm } from "./deal-form";
import { DealSlideOver } from "./deal-slide-over";
import type {
  DealWithRelations,
  DealStage,
  Contact,
  Company,
  Activity,
  Note,
} from "@/lib/types";

interface DealsPageClientProps {
  deals: DealWithRelations[];
  stages: DealStage[];
  contacts: Pick<Contact, "id" | "first_name" | "last_name">[];
  companies: Pick<Company, "id" | "name">[];
}

export function DealsPageClient({
  deals,
  stages,
  contacts,
  companies,
}: DealsPageClientProps) {
  const router = useRouter();
  const [view, setView] = useState<"board" | "list">("board");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DealWithRelations | null>(null);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [dealActivities, setDealActivities] = useState<Activity[]>([]);
  const [dealNotes, setDealNotes] = useState<Note[]>([]);

  const fetchDealDetails = useCallback(async (dealId: string) => {
    const supabase = createClient();

    const [activitiesRes, notesRes] = await Promise.all([
      supabase
        .from("activities")
        .select("*")
        .eq("deal_id", dealId)
        .order("created_at", { ascending: false }),
      supabase
        .from("notes")
        .select("*")
        .eq("deal_id", dealId)
        .order("created_at", { ascending: false }),
    ]);

    setDealActivities(activitiesRes.data || []);
    setDealNotes(notesRes.data || []);
  }, []);

  function handleDealClick(deal: DealWithRelations) {
    setSelectedDeal(deal);
    setSlideOverOpen(true);
    fetchDealDetails(deal.id);
  }

  function handleDeleteDeal() {
    setSelectedDeal(null);
    setSlideOverOpen(false);
  }

  // Refetch details when slide-over is open and data changes
  useEffect(() => {
    if (selectedDeal && slideOverOpen) {
      // Update selected deal from latest deals data
      const updated = deals.find((d) => d.id === selectedDeal.id);
      if (updated) {
        setSelectedDeal(updated);
        fetchDealDetails(updated.id);
      }
    }
  }, [deals, selectedDeal?.id, slideOverOpen, fetchDealDetails]);

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Deals
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your sales pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5">
            <button
              onClick={() => setView("board")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                view === "board"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                view === "list"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              )}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>

          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === "board" ? (
        <PipelineBoard
          deals={deals}
          stages={stages}
          onDealClick={handleDealClick}
        />
      ) : (
        <DealsTable
          deals={deals}
          stages={stages}
          onDealClick={handleDealClick}
          onDeleteDeal={(deal) => {
            setSelectedDeal(deal);
            handleDealClick(deal);
          }}
        />
      )}

      {/* Add/Edit Deal Form */}
      <DealForm
        open={formOpen}
        onOpenChange={setFormOpen}
        stages={stages}
        contacts={contacts}
        companies={companies}
      />

      {/* Deal Slide-Over */}
      <DealSlideOver
        deal={selectedDeal}
        stages={stages}
        activities={dealActivities}
        notes={dealNotes}
        open={slideOverOpen}
        onOpenChange={setSlideOverOpen}
        onDelete={handleDeleteDeal}
      />
    </div>
  );
}
