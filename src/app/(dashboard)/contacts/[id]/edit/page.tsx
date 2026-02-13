"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Contact, Company } from "@/lib/types";
import { ContactForm } from "@/components/contacts/contact-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [contactResult, companiesResult] = await Promise.all([
        supabase.from("contacts").select("*").eq("id", contactId).single(),
        supabase.from("companies").select("*").order("name"),
      ]);

      if (contactResult.data) setContact(contactResult.data);
      if (companiesResult.data) setCompanies(companiesResult.data);
      setLoading(false);
    }

    fetchData();
  }, [contactId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Contact not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/contacts")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/contacts/${contactId}`)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Contact
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            Edit {contact.first_name} {contact.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm
            contact={contact}
            companies={companies}
            onSuccess={() => router.push(`/contacts/${contactId}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
