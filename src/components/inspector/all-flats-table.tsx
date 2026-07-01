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
import type { FlatTableRow } from "@/lib/data";
import {
  getOccupancyVariant,
  getResidentTypeLabel,
} from "@/lib/occupancy-ui";

interface AllFlatsTableProps {
  rows: FlatTableRow[];
}

export function AllFlatsTable({ rows }: AllFlatsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");

  const floors = useMemo(
    () => [...new Set(rows.map((r) => r.floor))].sort((a, b) => a - b),
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        search === "" ||
        row.flatNumber.includes(search) ||
        row.residentName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || row.occupancyStatus === statusFilter;
      const matchesFloor =
        floorFilter === "all" || String(row.floor) === floorFilter;
      return matchesSearch && matchesStatus && matchesFloor;
    });
  }, [rows, search, statusFilter, floorFilter]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Tap a row to open flat details — resident, family, and pending bills.
      </p>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search flat number or name..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={floorFilter}
          onValueChange={(v) => setFloorFilter(v ?? "all")}
        >
          <SelectTrigger className="w-full lg:w-[140px]">
            <SelectValue placeholder="Floor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All floors</SelectItem>
            {floors.map((f) => (
              <SelectItem key={f} value={String(f)}>
                Floor {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="owner_occupied">Owner</SelectItem>
            <SelectItem value="tenant_occupied">Tenant</SelectItem>
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
              <TableHead>Type</TableHead>
              <TableHead>Family</TableHead>
              <TableHead>Pending bills</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No flats match your filters
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow
                  key={row.id}
                  className="relative hover:bg-muted/50"
                >
                  <Link
                    href={`/inspector/flats/${row.id}`}
                    prefetch
                    className="absolute inset-0 z-10 rounded-none"
                    aria-label={`Open flat ${row.flatNumber}`}
                  />
                  <TableCell className="font-medium text-primary">
                    {row.flatNumber}
                  </TableCell>
                  <TableCell>{row.floor}</TableCell>
                  <TableCell className="max-w-[160px] truncate">
                    {row.residentName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getOccupancyVariant(row.occupancyStatus)}>
                      {getResidentTypeLabel(row.occupancyStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.familyCount > 0 ? (
                      <span className="text-sm">{row.familyCount}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.pendingBillCount > 0 ? (
                      <Badge variant="destructive">{row.pendingBillCount}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {rows.length} flats
      </p>
    </div>
  );
}
