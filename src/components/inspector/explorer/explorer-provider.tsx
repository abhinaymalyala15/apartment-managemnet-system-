"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ExplorerBlockMeta, ExplorerPath } from "@/lib/explorer-data";
import {
  getDefaultExpandedNodes,
  getExplorerPathForFlat,
  getExplorerPathForSearchResult,
} from "@/lib/explorer-data";
import type { AdminSearchResult } from "@/types";

const STORAGE_KEY = "apartmenterp-explorer-expanded";
const COLLAPSE_KEY = "apartmenterp-explorer-collapsed";

function nodeIdForPath(path: ExplorerPath): string[] {
  const ids: string[] = ["apt"];
  if (path.blockId) ids.push(`block:${path.blockId}`);
  if (path.blockId && path.floor != null) {
    ids.push(`floor:${path.blockId}:${path.floor}`);
  }
  return ids;
}

function pathFromPathname(pathname: string): ExplorerPath {
  const blockMatch = pathname.match(/\/admin\/blocks\/([^/]+)/);
  const floorMatch = pathname.match(
    /\/admin\/blocks\/([^/]+)\/floors\/(\d+)/
  );
  const flatMatch = pathname.match(/\/admin\/flats\/([^/]+)/);

  if (flatMatch) {
    return getExplorerPathForFlat(flatMatch[1]) ?? {};
  }
  if (floorMatch) {
    return {
      blockId: floorMatch[1],
      floor: Number(floorMatch[2]),
    };
  }
  if (blockMatch) {
    return { blockId: blockMatch[1] };
  }
  return {};
}

interface ExplorerContextValue {
  apartmentName: string;
  blocks: ExplorerBlockMeta[];
  totalFlats: number;
  expanded: Set<string>;
  toggleExpanded: (nodeId: string) => void;
  expandToPath: (path: ExplorerPath) => void;
  isExpanded: (nodeId: string) => boolean;
  selectedPath: ExplorerPath;
  isDesktopOpen: boolean;
  toggleDesktop: () => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  navigateFromSearch: (result: AdminSearchResult) => void;
  filterQuery: string;
  setFilterQuery: (q: string) => void;
}

const ExplorerContext = createContext<ExplorerContextValue | null>(null);

interface ExplorerProviderProps {
  apartmentName: string;
  blocks: ExplorerBlockMeta[];
  totalFlats: number;
  children: ReactNode;
}

export function ExplorerProvider({
  apartmentName,
  blocks = [],
  totalFlats,
  children,
}: ExplorerProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  const selectedPath = useMemo(() => pathFromPathname(pathname), [pathname]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const collapsed = localStorage.getItem(COLLAPSE_KEY);
      if (stored) {
        setExpanded(new Set(JSON.parse(stored) as string[]));
      } else {
        setExpanded(new Set(getDefaultExpandedNodes(totalFlats)));
      }
      if (collapsed != null) {
        setIsDesktopOpen(collapsed !== "true");
      }
    } catch {
      setExpanded(new Set(getDefaultExpandedNodes(totalFlats)));
    }
    setHydrated(true);
  }, [totalFlats]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]));
  }, [expanded, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(COLLAPSE_KEY, String(!isDesktopOpen));
  }, [isDesktopOpen, hydrated]);

  const expandToPath = useCallback((path: ExplorerPath) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const id of nodeIdForPath(path)) {
        next.add(id);
      }
      next.add("apt");
      return next;
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (selectedPath.blockId || selectedPath.flatId) {
      expandToPath(selectedPath);
    }
  }, [selectedPath, hydrated, expandToPath]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setIsDesktopOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleExpanded = useCallback((nodeId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (nodeId: string) => expanded.has(nodeId),
    [expanded]
  );

  const toggleDesktop = useCallback(() => {
    setIsDesktopOpen((v) => !v);
  }, []);

  const navigateFromSearch = useCallback(
    (result: AdminSearchResult) => {
      const path = getExplorerPathForSearchResult(
        result.kind,
        result.blockId,
        result.floor,
        result.flatId
      );
      if (path) expandToPath(path);

      setMobileOpen(false);

      if (result.flatId) {
        router.push(`/inspector/flats/${result.flatId}`);
        return;
      }
      if (result.kind === "floor" && result.blockId && result.floor != null) {
        router.push(
          `/inspector/blocks/${result.blockId}/floors/${result.floor}`
        );
        return;
      }
      if (result.blockId && result.kind === "block") {
        router.push(`/inspector/blocks/${result.blockId}`);
      }
    },
    [expandToPath, router]
  );

  const value = useMemo(
    () => ({
      apartmentName,
      blocks,
      totalFlats,
      expanded,
      toggleExpanded,
      expandToPath,
      isExpanded,
      selectedPath,
      isDesktopOpen,
      toggleDesktop,
      isMobileOpen,
      setMobileOpen,
      navigateFromSearch,
      filterQuery,
      setFilterQuery,
    }),
    [
      apartmentName,
      blocks,
      totalFlats,
      expanded,
      toggleExpanded,
      expandToPath,
      isExpanded,
      selectedPath,
      isDesktopOpen,
      toggleDesktop,
      isMobileOpen,
      navigateFromSearch,
      filterQuery,
    ]
  );

  return (
    <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>
  );
}

export function useExplorer() {
  const ctx = useContext(ExplorerContext);
  if (!ctx) {
    throw new Error("useExplorer must be used within ExplorerProvider");
  }
  return ctx;
}
