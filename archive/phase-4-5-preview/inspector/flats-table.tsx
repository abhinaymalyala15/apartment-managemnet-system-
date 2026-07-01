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
import type { Flat, OccupancyStatus } from "@/types";

interface FlatsTableProps {
  blockId: string;
  blockCode: string;
}

export function FlatsTable({ blockId, blockCode }: FlatsTableProps) {
  const flats = getFlatsByBlock(blockId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return flats.filter((flat: Flat) => {
      const owner = getPrimaryOwner(flat.id);
      const matchesSearch =
        search === "" ||
        flat.flatNumber.toLowerCase().includes(search.toLowerCase()) ||
        owner?.fullName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || flat.occupancyStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [flats, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by flat number or owner..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Occupancy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="owner_occupied">Owner Occupied</SelectItem>
            <SelectItem value="tenant_occupied">Tenant Occupied</SelectItem>
            <SelectItem value="vacant">Vacant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flat</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No flats match your search
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((flat) => {
                const owner = getPrimaryOwner(flat.id);
                return (
                  <TableRow key={flat.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link
                        href={`/inspector/blocks/${blockId}/flats/${flat.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {flat.flatNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{flat.floor}</TableCell>
                    <TableCell>{flat.flatType}</TableCell>
                    <TableCell>{flat.areaSqft} sq.ft</TableCell>
                    <TableCell>{owner?.fullName ?? "—"}</TableCell>
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
        Showing {filtered.length} of {flats.length} flats in Tower {blockCode}
      </p>
    </div>
  );
}
