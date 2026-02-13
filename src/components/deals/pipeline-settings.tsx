"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { DealStage } from "@/lib/types";

const presetColors = [
  { name: "Slate", value: "#94a3b8", class: "bg-slate-400" },
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Violet", value: "#8b5cf6", class: "bg-violet-500" },
  { name: "Amber", value: "#f59e0b", class: "bg-amber-500" },
  { name: "Emerald", value: "#10b981", class: "bg-emerald-500" },
  { name: "Rose", value: "#f43f5e", class: "bg-rose-500" },
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Teal", value: "#14b8a6", class: "bg-teal-500" },
];

interface SortableStageItemProps {
  stage: DealStage;
  editingId: string | null;
  editName: string;
  editColor: string;
  onStartEdit: (stage: DealStage) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditNameChange: (name: string) => void;
  onEditColorChange: (color: string) => void;
  onDelete: (stage: DealStage) => void;
}

function SortableStageItem({
  stage,
  editingId,
  editName,
  editColor,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditNameChange,
  onEditColorChange,
  onDelete,
}: SortableStageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isEditing = editingId === stage.id;

  const colorClass =
    presetColors.find((c) => c.value === stage.color)?.class || "bg-slate-400";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900",
        isDragging && "shadow-lg opacity-80 z-50"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {isEditing ? (
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Input
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="flex-1 h-8"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Color:</span>
            {presetColors.map((color) => (
              <button
                key={color.value}
                onClick={() => onEditColorChange(color.value)}
                className={cn(
                  "h-6 w-6 rounded-full transition-all",
                  color.class,
                  editColor === color.value
                    ? "ring-2 ring-offset-2 ring-indigo-500"
                    : "hover:scale-110"
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onSaveEdit} className="h-7">
              <Check className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEdit} className="h-7">
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Color dot */}
          <div className={cn("h-3 w-3 rounded-full shrink-0", colorClass)} />

          {/* Stage name */}
          <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">
            {stage.name}
          </span>

          {/* Won/Lost indicator */}
          {stage.is_won && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300">
              Won
            </span>
          )}
          {stage.is_lost && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-400/10 dark:text-rose-300">
              Lost
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onStartEdit(stage)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(stage)}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-400/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface PipelineSettingsClientProps {
  initialStages: DealStage[];
}

export function PipelineSettingsClient({ initialStages }: PipelineSettingsClientProps) {
  const router = useRouter();
  const [stages, setStages] = useState<DealStage[]>(initialStages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(presetColors[0].value);
  const [deleteTarget, setDeleteTarget] = useState<DealStage | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stages.findIndex((s) => s.id === active.id);
    const newIndex = stages.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(stages, oldIndex, newIndex);

    // Update positions
    const updated = reordered.map((s, i) => ({ ...s, position: i }));
    setStages(updated);

    // Persist
    const supabase = createClient();
    await Promise.all(
      updated.map((s) =>
        supabase.from("deal_stages").update({ position: s.position }).eq("id", s.id)
      )
    );
    router.refresh();
  }

  function handleStartEdit(stage: DealStage) {
    setEditingId(stage.id);
    setEditName(stage.name);
    setEditColor(stage.color);
  }

  async function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;
    const supabase = createClient();
    await supabase
      .from("deal_stages")
      .update({ name: editName.trim(), color: editColor })
      .eq("id", editingId);

    setStages((prev) =>
      prev.map((s) =>
        s.id === editingId ? { ...s, name: editName.trim(), color: editColor } : s
      )
    );
    setEditingId(null);
    router.refresh();
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  }

  async function handleAddStage() {
    if (!newName.trim()) return;
    const supabase = createClient();
    const maxPosition = stages.length > 0 ? Math.max(...stages.map((s) => s.position)) + 1 : 0;

    const { data, error } = await supabase
      .from("deal_stages")
      .insert({
        name: newName.trim(),
        color: newColor,
        position: maxPosition,
        is_won: false,
        is_lost: false,
      })
      .select()
      .single();

    if (data) {
      setStages((prev) => [...prev, data]);
      setNewName("");
      setNewColor(presetColors[0].value);
      setAddingNew(false);
      router.refresh();
    }
  }

  async function handleDeleteStage() {
    if (!deleteTarget) return;

    // Check if any deals are in this stage
    const supabase = createClient();
    const { count } = await supabase
      .from("deals")
      .select("*", { count: "exact", head: true })
      .eq("stage_id", deleteTarget.id);

    if (count && count > 0) {
      setDeleteError(
        `Cannot delete "${deleteTarget.name}" — it has ${count} deal${count > 1 ? "s" : ""}. Move or delete those deals first.`
      );
      return;
    }

    await supabase.from("deal_stages").delete().eq("id", deleteTarget.id);
    setStages((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleteError("");
    router.refresh();
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Pipeline Stages
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Drag to reorder stages. These stages appear on your deals board.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stages.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {stages.map((stage) => (
              <SortableStageItem
                key={stage.id}
                stage={stage}
                editingId={editingId}
                editName={editName}
                editColor={editColor}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onEditNameChange={setEditName}
                onEditColorChange={setEditColor}
                onDelete={(s) => {
                  setDeleteTarget(s);
                  setDeleteError("");
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add new stage */}
      {addingNew ? (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Stage name"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Color:</span>
            {presetColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setNewColor(color.value)}
                className={cn(
                  "h-6 w-6 rounded-full transition-all",
                  color.class,
                  newColor === color.value
                    ? "ring-2 ring-offset-2 ring-indigo-500"
                    : "hover:scale-110"
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddStage} disabled={!newName.trim()}>
              Add Stage
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAddingNew(false);
                setNewName("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setAddingNew(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Stage
        </Button>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Stage</DialogTitle>
            <DialogDescription>
              {deleteError || (
                <>
                  Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;?
                  This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError("");
              }}
            >
              {deleteError ? "Close" : "Cancel"}
            </Button>
            {!deleteError && (
              <Button variant="destructive" onClick={handleDeleteStage}>
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
