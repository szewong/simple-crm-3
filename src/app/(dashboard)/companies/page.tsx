"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Company } from "@/lib/types";
import { CompaniesTable } from "@/components/companies/companies-table";
import { CompanyForm } from "@/components/companies/company-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCompanies = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (debouncedSearch) {
      query = query.or(
        `name.ilike.%${debouncedSearch}%,industry.ilike.%${debouncedSearch}%`
      );
    }

    const { data } = await query;
    setCompanies((data as Company[]) || []);
    setLoading(false);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Companies
        </h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : companies.length === 0 && !debouncedSearch ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <Building2 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            No companies yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first company to get started.
          </p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Company
          </Button>
        </div>
      ) : (
        <CompaniesTable companies={companies} onRefresh={fetchCompanies} />
      )}

      <CompanyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}
