"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ResidentTableRow } from "@/lib/data";
import { getOccupancyLabel, getOccupancyVariant } from "@/lib/occupancy-ui";

interface ResidentsTableProps {
  rows: ResidentTableRow[];
}

export function ResidentsTable({ rows }: ResidentsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        search === "" ||
        row.flatNumber.includes(search) ||
        row.residentName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || row.occupancyStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search flat number or resident name..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Occupancy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="owner_occupied">Owner occupied</SelectItem>
            <SelectItem value="tenant_occupied">Tenant occupied</SelectItem>
            <SelectItem value="vacant">Vacant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flat</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50">
                <TableCell>
                  <Link
                    href={`/inspector/flats/${row.id}`}
                    prefetch
                    className="font-medium text-primary hover:underline"
                  >
                    {row.flatNumber}
                  </Link>
                </TableCell>
                <TableCell>{row.floor}</TableCell>
                <TableCell className="max-w-[180px] truncate">
                  {row.residentName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.phone}
                </TableCell>
                <TableCell>
                  <Badge variant={getOccupancyVariant(row.occupancyStatus)}>
                    {getOccupancyLabel(row.occupancyStatus)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {rows.length} flats
      </p>
    </div>
  );
}
