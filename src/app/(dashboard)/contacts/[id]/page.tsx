"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  ContactWithCompany,
  Activity,
  Deal,
  DealWithStage,
  Note,
} from "@/lib/types";
import {
  formatDate,
  formatRelativeDate,
  formatPhoneNumber,
  formatCurrency,
  getInitials,
  getAvatarColor,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Building2,
  Mail,
  Pencil,
  Phone,
  Trash2,
  Calendar,
  MessageSquare,
  Briefcase,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const activityIcons: Record<string, string> = {
  call: "📞",
  email: "📧",
  meeting: "🤝",
  task: "✅",
  note: "📝",
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<ContactWithCompany | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deals, setDeals] = useState<DealWithStage[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const fetchContact = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("contacts")
      .select("*, company:companies(*)")
      .eq("id", contactId)
      .single();
    if (data) setContact(data as ContactWithCompany);
    setLoading(false);
  }, [contactId]);

  const fetchActivities = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("activities")
      .select("*")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false });
    if (data) setActivities(data);
  }, [contactId]);

  const fetchDeals = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("deals")
      .select("*, stage:deal_stages(*)")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false });
    if (data) setDeals(data as DealWithStage[]);
  }, [contactId]);

  const fetchNotes = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false });
    if (data) setNotes(data);
  }, [contactId]);

  useEffect(() => {
    fetchContact();
    fetchActivities();
    fetchDeals();
    fetchNotes();
  }, [fetchContact, fetchActivities, fetchDeals, fetchNotes]);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contactId);
      if (error) throw error;
      toast.success("Contact deleted");
      router.push("/contacts");
    } catch {
      toast.error("Failed to delete contact");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("notes").insert({
        content: newNote,
        contact_id: contactId,
        user_id: user.id,
      });
      if (error) throw error;
      toast.success("Note added");
      setNewNote("");
      fetchNotes();
    } catch {
      toast.error("Failed to add note");
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    if (error) {
      toast.error("Failed to delete note");
    } else {
      toast.success("Note deleted");
      fetchNotes();
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Contact not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/contacts")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Button>
      </div>
    );
  }

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const initials = getInitials(fullName);
  const color = getAvatarColor(fullName);

  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/contacts")}
      >
        <ArrowLeft className="h-4 w-4" />
        Contacts
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white",
                color
              )}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{fullName}</h1>
              {contact.position && (
                <p className="text-muted-foreground">{contact.position}</p>
              )}
              {contact.company && (
                <Link
                  href={`/companies/${contact.company.id}`}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {contact.company.name}
                </Link>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {contact.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {contact.email}
                  </span>
                )}
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {formatPhoneNumber(contact.phone)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {contact.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${contact.email}`}>
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
            )}
            {contact.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${contact.phone}`}>
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/contacts/${contactId}/edit`)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-rose-600 hover:text-rose-700"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Email" value={contact.email || "—"} />
                <InfoRow
                  label="Phone"
                  value={formatPhoneNumber(contact.phone) || "—"}
                />
                <InfoRow label="Position" value={contact.position || "—"} />
                <InfoRow
                  label="Company"
                  value={
                    contact.company ? (
                      <Link
                        href={`/companies/${contact.company.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {contact.company.name}
                      </Link>
                    ) : (
                      "—"
                    )
                  }
                />
                <InfoRow
                  label="Status"
                  value={
                    <Badge
                      variant={
                        contact.status === "active"
                          ? "default"
                          : contact.status === "inactive"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {contact.status}
                    </Badge>
                  }
                />
                <InfoRow
                  label="Created"
                  value={formatDate(contact.created_at)}
                />
                {contact.notes && (
                  <InfoRow label="Notes" value={contact.notes} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No activities yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <span className="text-lg">
                        {activityIcons[activity.type] || "📋"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeDate(activity.created_at)}
                        </p>
                      </div>
                      {activity.is_completed && (
                        <Badge variant="secondary">Completed</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Deals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No deals linked to this contact.
                </p>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/deals?deal=${deal.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{deal.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{deal.stage?.name}</Badge>
                          {deal.expected_close_date && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(deal.expected_close_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-indigo-600">
                          {formatCurrency(deal.value)}
                        </p>
                        {deal.probability != null && (
                          <p className="text-xs text-muted-foreground">
                            {deal.probability}%
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || savingNote}
                  className="self-end"
                >
                  {savingNote ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>

              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No notes yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border p-3 group"
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeDate(note.created_at)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:text-rose-600"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{fullName}&quot;? This will
              permanently remove the contact and all associated data. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  );
}
