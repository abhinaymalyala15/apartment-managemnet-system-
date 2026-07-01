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
import {
  getFlatsByBlock,
  getOccupancyLabel,
  getOccupancyVariant,
  getPrimaryOwner,
} from "@/lib/data";
import type { Flat } from "@/types";

interface FlatsTableProps {
  blockId: string;
}

export function FlatsTable({ blockId }: FlatsTableProps) {
  const flats = getFlatsByBlock(blockId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");

  const floors = useMemo(
    () => [...new Set(flats.map((f) => f.floor))].sort((a, b) => a - b),
    [flats]
  );

  const filtered = useMemo(() => {
    return flats.filter((flat: Flat) => {
      const owner = getPrimaryOwner(flat.id);
      const matchesSearch =
        search === "" ||
        flat.flatNumber.includes(search) ||
        owner?.fullName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || flat.occupancyStatus === statusFilter;
      const matchesFloor =
        floorFilter === "all" || String(flat.floor) === floorFilter;
      return matchesSearch && matchesStatus && matchesFloor;
    });
  }, [flats, search, statusFilter, floorFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search flat number or owner..."
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
              <TableHead>Type</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No flats match your filters
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((flat) => {
                const owner = getPrimaryOwner(flat.id);
                return (
                  <TableRow key={flat.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Link
                        href={`/inspector/flats/${flat.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {flat.flatNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{flat.floor}</TableCell>
                    <TableCell>{flat.flatType}</TableCell>
                    <TableCell className="max-w-[160px] truncate">
                      {owner?.fullName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getOccupancyVariant(flat.occupancyStatus)}>
                        {getOccupancyLabel(flat.occupancyStatus)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {flats.length} flats
      </p>
    </div>
  );
}
