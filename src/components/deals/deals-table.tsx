"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Trophy, XCircle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, getInitials, getAvatarColor } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DealWithRelations, DealStage } from "@/lib/types";

const stageColorMap: Record<string, string> = {
  lead: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-400/10 dark:text-slate-300 dark:border-slate-700",
  qualified: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-800",
  proposal: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-800",
  negotiation: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-800",
  won: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-800",
  lost: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-800",
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

interface DealsTableProps {
  deals: DealWithRelations[];
  stages: DealStage[];
  onDealClick: (deal: DealWithRelations) => void;
  onDeleteDeal: (deal: DealWithRelations) => void;
}

export function DealsTable({ deals, stages, onDealClick, onDeleteDeal }: DealsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<DealWithRelations>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <button
            className="text-left font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
            onClick={() => onDealClick(row.original)}
          >
            {row.original.title}
          </button>
        ),
      },
      {
        accessorKey: "value",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Value
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {formatCurrency(row.original.value)}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.stage?.name,
        id: "stage",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Stage
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const stage = row.original.stage;
          if (!stage) return null;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
                getStageBadgeColor(stage.name)
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {stage.name}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.company?.name,
        id: "company",
        header: "Company",
        cell: ({ row }) => (
          <span className="text-slate-600 dark:text-slate-400">
            {row.original.company?.name || "—"}
          </span>
        ),
      },
      {
        accessorFn: (row) =>
          row.contact ? `${row.contact.first_name} ${row.contact.last_name}` : "",
        id: "contact",
        header: "Contact",
        cell: ({ row }) => {
          const contact = row.original.contact;
          if (!contact) return <span className="text-slate-400">—</span>;
          const name = `${contact.first_name} ${contact.last_name}`;
          return (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                  getAvatarColor(name)
                )}
              >
                <span className="text-[10px] font-medium text-white">
                  {getInitials(name)}
                </span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "probability",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Prob.
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-slate-600 dark:text-slate-400">
            {row.original.probability != null ? `${row.original.probability}%` : "—"}
          </span>
        ),
      },
      {
        accessorKey: "expected_close_date",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Expected Close
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-slate-600 dark:text-slate-400">
            {formatDate(row.original.expected_close_date) || "—"}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDealClick(row.original)}>
                <Pencil className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteDeal(row.original)}
                className="text-rose-600 dark:text-rose-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onDealClick, onDeleteDeal]
  );

  const table = useReactTable({
    data: deals,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: { pageSize: 25 },
    },
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
        <Input
          placeholder="Search deals..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-9 w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="h-14 hover:bg-slate-50/50 transition-colors cursor-pointer dark:hover:bg-slate-800/50"
                onClick={() => onDealClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 text-sm"
                    onClick={(e) => {
                      if (cell.column.id === "actions") e.stopPropagation();
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            -
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} deals
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
