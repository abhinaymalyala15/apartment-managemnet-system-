"use client";

import Link from "next/link";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Home,
  Layers,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useExplorer } from "@/components/inspector/explorer/explorer-provider";
import { FlatStatusDot } from "@/components/inspector/explorer/flat-status-dot";
import {
  getExplorerFlatsForFloor,
  getExplorerFloorsForBlock,
  type ExplorerFlatNode,
} from "@/lib/explorer-data";
import { cn } from "@/lib/utils";

export function CommunityExplorer() {
  const {
    apartmentName,
    blocks,
    filterQuery,
    setFilterQuery,
    isExpanded,
    toggleExpanded,
    selectedPath,
  } = useExplorer();

  const q = filterQuery.trim().toLowerCase();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <p className="truncate text-sm font-semibold leading-tight">
            {apartmentName}
          </p>
        </div>
        <div className="relative mt-2.5">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter tree…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-2 py-2"
        aria-label="Community explorer"
      >
        <ul className="space-y-0.5">
          {(blocks ?? []).map((block) => (
            <BlockBranch
              key={block.id}
              block={block}
              filter={q}
              isExpanded={isExpanded}
              toggleExpanded={toggleExpanded}
              selectedPath={selectedPath}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}

function BlockBranch({
  block,
  filter,
  isExpanded,
  toggleExpanded,
  selectedPath,
}: {
  block: { id: string; name: string; flatCount: number; overdueCount: number };
  filter: string;
  isExpanded: (id: string) => boolean;
  toggleExpanded: (id: string) => void;
  selectedPath: { blockId?: string; floor?: number; flatId?: string };
}) {
  const blockNodeId = `block:${block.id}`;
  const expanded = isExpanded(blockNodeId);
  const isSelected = selectedPath.blockId === block.id && !selectedPath.floor;

  const floors = expanded ? getExplorerFloorsForBlock(block.id) : [];

  return (
    <li>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => toggleExpanded(blockNodeId)}
          className="flex h-8 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse block" : "Expand block"}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
        <Link
          href={`/inspector/blocks/${block.id}`}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/70",
            isSelected && "bg-primary/10 font-medium text-primary"
          )}
        >
          <Building2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <span className="truncate">{block.name}</span>
          {block.overdueCount > 0 && (
            <span className="ml-auto text-[10px] font-medium text-destructive">
              {block.overdueCount}
            </span>
          )}
        </Link>
      </div>

      {expanded && (
        <ul className="ml-3 border-l border-border/60 pl-1">
          {floors.map((floorMeta) => (
            <FloorBranch
              key={`${block.id}-${floorMeta.floor}`}
              floorMeta={floorMeta}
              filter={filter}
              isExpanded={isExpanded}
              toggleExpanded={toggleExpanded}
              selectedPath={selectedPath}
            />
          ))}
          {block.flatCount === 0 && (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              No flats yet
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

function FloorBranch({
  floorMeta,
  filter,
  isExpanded,
  toggleExpanded,
  selectedPath,
}: {
  floorMeta: {
    blockId: string;
    floor: number;
    flatCount: number;
    overdueCount: number;
  };
  filter: string;
  isExpanded: (id: string) => boolean;
  toggleExpanded: (id: string) => void;
  selectedPath: { blockId?: string; floor?: number; flatId?: string };
}) {
  const floorNodeId = `floor:${floorMeta.blockId}:${floorMeta.floor}`;
  const expanded = isExpanded(floorNodeId);
  const isSelected =
    selectedPath.blockId === floorMeta.blockId &&
    selectedPath.floor === floorMeta.floor &&
    !selectedPath.flatId;

  const floorLabel = `Floor ${floorMeta.floor}`;
  const floorMatches =
    !filter ||
    floorLabel.toLowerCase().includes(filter) ||
    `f${floorMeta.floor}`.includes(filter);

  const flats = expanded
    ? getExplorerFlatsForFloor(floorMeta.blockId, floorMeta.floor)
    : [];

  const visibleFlats = filter
    ? flats.filter(
        (f) =>
          f.flatNumber.toLowerCase().includes(filter) ||
          f.residentName.toLowerCase().includes(filter)
      )
    : flats;

  if (filter && !floorMatches && visibleFlats.length === 0) {
    return null;
  }

  return (
    <li>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => toggleExpanded(floorNodeId)}
          className="flex h-8 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          aria-expanded={expanded}
          disabled={floorMeta.flatCount === 0}
        >
          {floorMeta.flatCount > 0 ? (
            expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )
          ) : (
            <span className="w-3.5" />
          )}
        </button>
        <Link
          href={`/inspector/blocks/${floorMeta.blockId}/floors/${floorMeta.floor}`}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/70",
            isSelected && "bg-primary/10 font-medium text-primary"
          )}
        >
          <Layers className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <span className="truncate">{floorLabel}</span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {floorMeta.flatCount}
          </span>
        </Link>
      </div>

      {expanded && visibleFlats.length > 0 && (
        <ul className="ml-3 border-l border-border/60 pl-1 animate-in fade-in duration-150">
          {visibleFlats.map((flat) => (
            <FlatLeaf
              key={flat.id}
              flat={flat}
              isSelected={selectedPath.flatId === flat.id}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function FlatLeaf({
  flat,
  isSelected,
}: {
  flat: ExplorerFlatNode;
  isSelected: boolean;
}) {
  return (
    <li>
      <Link
        href={`/inspector/flats/${flat.id}`}
        className={cn(
          "flex items-center gap-2 rounded-lg py-1.5 pl-7 pr-2 text-sm transition-colors hover:bg-muted/70",
          isSelected && "bg-primary/10 font-medium text-primary"
        )}
      >
        <Home className="h-3.5 w-3.5 shrink-0 opacity-70" />
        <span className="min-w-[2rem] font-medium tabular-nums">
          {flat.flatNumber}
        </span>
        <FlatStatusDot status={flat.billStatus} />
        <span className="ml-auto truncate text-[10px] text-muted-foreground">
          {flat.occupancyLabel}
        </span>
      </Link>
    </li>
  );
}
