"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { activitySchema, type ActivityFormValues } from "@/lib/validations/activity";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { Contact, Company, Deal } from "@/lib/types";
import { useEffect, useState } from "react";

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultValues?: Partial<ActivityFormValues>;
}

export function ActivityForm({
  open,
  onOpenChange,
  onSuccess,
  defaultValues,
}: ActivityFormProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "call",
      title: "",
      description: "",
      contact_id: "",
      company_id: "",
      deal_id: "",
      due_date: "",
      is_completed: false,
      ...defaultValues,
    },
  });

  const activityType = watch("type");
  const isCompletedValue = watch("is_completed");

  useEffect(() => {
    if (open) {
      const supabase = createClient();
      Promise.all([
        supabase.from("contacts").select("id, first_name, last_name").order("first_name"),
        supabase.from("companies").select("id, name").order("name"),
        supabase.from("deals").select("id, title").order("title"),
      ]).then(([contactsRes, companiesRes, dealsRes]) => {
        setContacts((contactsRes.data as Contact[]) || []);
        setCompanies((companiesRes.data as Company[]) || []);
        setDeals((dealsRes.data as Deal[]) || []);
      });
    }
  }, [open]);

  async function onSubmit(data: ActivityFormValues) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      type: data.type,
      title: data.title,
      description: data.description || null,
      contact_id: data.contact_id || null,
      company_id: data.company_id || null,
      deal_id: data.deal_id || null,
      due_date: data.due_date || null,
      is_completed: data.is_completed,
      completed_at: data.is_completed ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("activities").insert(payload);
    if (error) {
      toast.error("Failed to create activity");
      return;
    }

    toast.success("Activity created successfully");
    reset();
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={activityType}
              onValueChange={(val) =>
                setValue("type", val as ActivityFormValues["type"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="Activity title" />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select
                value={watch("contact_id") || ""}
                onValueChange={(val) => setValue("contact_id", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Company</Label>
              <Select
                value={watch("company_id") || ""}
                onValueChange={(val) => setValue("company_id", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deal</Label>
            <Select
              value={watch("deal_id") || ""}
              onValueChange={(val) => setValue("deal_id", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select deal" />
              </SelectTrigger>
              <SelectContent>
                {deals.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activityType === "task" && (
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" {...register("due_date")} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isCompletedValue}
              onCheckedChange={(checked) =>
                setValue("is_completed", checked === true)
              }
            />
            <Label className="text-sm font-normal">Mark as completed</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
