"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CalendarIcon,
  ExternalLink,
  Phone,
  Mail,
  Trash2,
  Trophy,
  XCircle,
  Send,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getInitials,
  getAvatarColor,
} from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type {
  DealWithRelations,
  DealStage,
  Activity,
  Note,
} from "@/lib/types";

const stageColorMap: Record<string, string> = {
  lead: "bg-slate-100 text-slate-600 border-slate-200",
  qualified: "bg-blue-50 text-blue-700 border-blue-200",
  proposal: "bg-violet-50 text-violet-700 border-violet-200",
  negotiation: "bg-amber-50 text-amber-700 border-amber-200",
  won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-rose-50 text-rose-700 border-rose-200",
};

function getStageBadgeColor(stageName: string): string {
  const key = stageName.toLowerCase().replace(/\s+/g, "");
  if (key.includes("lead")) return stageColorMap.lead;
  if (key.includes("qualif")) return stageColorMap.qualified;
  if (key.includes("proposal")) return stageColorMap.proposal;
  if (key.includes("negoti")) return stageColorMap.negotiation;
  if (key.includes("won") || key.includes("closedwon")) return stageColorMap.won;
  if (key.includes("lost") || key.includes("closedlost")) return stageColorMap.lost;
  return stageColorMap.lead;
}

const activityIcons: Record<string, string> = {
  call: "📞",
  email: "📧",
  meeting: "🤝",
  task: "✅",
  note: "📝",
};

interface DealSlideOverProps {
  deal: DealWithRelations | null;
  stages: DealStage[];
  activities: Activity[];
  notes: Note[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export function DealSlideOver({
  deal,
  stages,
  activities,
  notes,
  open,
  onOpenChange,
  onDelete,
}: DealSlideOverProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeType, setCloseType] = useState<"won" | "lost">("won");
  const [closeReason, setCloseReason] = useState("");
  const [closing, setClosing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!deal) return null;

  const contactName = deal.contact
    ? `${deal.contact.first_name} ${deal.contact.last_name}`
    : null;

  async function handleStageChange(stageId: string) {
    if (!deal) return;
    const supabase = createClient();
    await supabase
      .from("deals")
      .update({ stage_id: stageId, updated_at: new Date().toISOString() })
      .eq("id", deal.id);
    router.refresh();
  }

  async function handleAddNote() {
    if (!newNote.trim() || !deal) return;
    setSavingNote(true);
    const supabase = createClient();
    await supabase.from("notes").insert({
      content: newNote.trim(),
      deal_id: deal.id,
      contact_id: deal.contact_id,
      company_id: deal.company_id,
    });
    setNewNote("");
    setSavingNote(false);
    router.refresh();
  }

  async function handleCloseDeal() {
    if (!deal) return;
    setClosing(true);
    const supabase = createClient();

    const wonStage = stages.find((s) => s.is_won);
    const lostStage = stages.find((s) => s.is_lost);
    const targetStage = closeType === "won" ? wonStage : lostStage;

    if (targetStage) {
      await supabase
        .from("deals")
        .update({
          stage_id: targetStage.id,
          closed_at: new Date().toISOString(),
          close_reason: closeType === "lost" ? closeReason : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deal.id);
    }

    setClosing(false);
    setCloseDialogOpen(false);
    setCloseReason("");
    router.refresh();
  }

  async function handleDelete() {
    if (!deal) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("deals").delete().eq("id", deal.id);
    setDeleting(false);
    setDeleteDialogOpen(false);
    onOpenChange(false);
    onDelete();
    router.refresh();
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-none sm:w-[60vw] min-w-[480px] max-w-[800px] overflow-y-auto"
        >
          <SheetHeader className="px-6 pt-6">
            <SheetTitle className="text-xl">{deal.title}</SheetTitle>
            <SheetDescription>
              {deal.company?.name && `${deal.company.name} · `}
              Created {formatDate(deal.created_at)}
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 pb-6 space-y-6">
            {/* Deal info */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Value
                </p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(deal.value)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Probability
                </p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {deal.probability != null ? `${deal.probability}%` : "—"}
                </p>
              </div>
            </div>

            {/* Stage selector */}
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Stage
              </p>
              <Select value={deal.stage_id} onValueChange={handleStageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expected close */}
            {deal.expected_close_date && (
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Expected Close Date
                </p>
                <p className="text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                  {formatDate(deal.expected_close_date)}
                </p>
              </div>
            )}

            {/* Description */}
            {deal.description && (
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Description
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {deal.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Contact & Company */}
            <div className="space-y-3">
              {deal.contact && (
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      getAvatarColor(contactName!)
                    )}
                  >
                    <span className="text-xs font-medium text-white">
                      {getInitials(contactName!)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/contacts/${deal.contact.id}`}
                      className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {contactName}
                    </Link>
                    {deal.contact.email && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {deal.contact.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {deal.company && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <Link
                    href={`/companies/${deal.company.id}`}
                    className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {deal.company.name}
                  </Link>
                </div>
              )}
            </div>

            <Separator />

            {/* Activity Timeline */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                Activity Timeline
              </h3>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="text-base mt-0.5 shrink-0">
                        {activityIcons[activity.type] || "📋"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-900 dark:text-slate-100 font-medium">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatRelativeDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No activities yet.
                </p>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                Notes
              </h3>
              {notes.length > 0 && (
                <div className="space-y-3 mb-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-gray-200 dark:border-slate-800 p-3"
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {formatRelativeDate(note.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add note form */}
              <div className="flex gap-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || savingNote}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Close Deal Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  setCloseType("won");
                  setCloseDialogOpen(true);
                }}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Mark as Won
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCloseType("lost");
                  setCloseDialogOpen(true);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark Lost
              </Button>
            </div>

            {/* Delete */}
            <Button
              variant="ghost"
              className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-400/10"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Deal
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Close Deal Dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Mark Deal as {closeType === "won" ? "Won" : "Lost"}
            </DialogTitle>
            <DialogDescription>
              {closeType === "won"
                ? `Are you sure you want to mark "${deal.title}" as Won?`
                : `Why was "${deal.title}" lost?`}
            </DialogDescription>
          </DialogHeader>

          {closeType === "lost" && (
            <div className="space-y-3">
              <Select value={closeReason} onValueChange={setCloseReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Budget constraints">Budget constraints</SelectItem>
                  <SelectItem value="Went with competitor">Went with competitor</SelectItem>
                  <SelectItem value="Timing not right">Timing not right</SelectItem>
                  <SelectItem value="No decision / no response">No decision / no response</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCloseDeal}
              disabled={closing}
              className={
                closeType === "won"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              }
            >
              {closing
                ? "Saving..."
                : closeType === "won"
                  ? "Confirm Won"
                  : "Confirm Lost"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deal.title}&rdquo;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
