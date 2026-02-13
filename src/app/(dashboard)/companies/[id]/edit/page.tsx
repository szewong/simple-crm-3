"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Company } from "@/lib/types";
import { CompanyForm } from "@/components/companies/company-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();
      if (data) setCompany(data);
      setLoading(false);
    }

    fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Company not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/companies")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Companies
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/companies/${companyId}`)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Company
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Edit {company.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm
            company={company}
            onSuccess={() => router.push(`/companies/${companyId}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
