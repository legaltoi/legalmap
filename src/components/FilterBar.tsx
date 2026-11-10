"use client";

import React from "react";
import {
  Layers,
  GraduationCap,
  Droplet,
  Pill,
  HeartPulse,
  Scale,
  Toilet,
  type LucideIcon,
} from "lucide-react";
import { POICategory } from "@/types";

export type FilterCategoryId = "ALL" | "LYCEE" | POICategory;

export interface FilterItemConfig {
  id: FilterCategoryId;
  label: string;
  icon: LucideIcon;
  activeColor: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
}

export const FILTER_ITEMS: FilterItemConfig[] = [
  {
    id: "ALL",
    label: "Tous",
    icon: Layers,
    activeColor: {
      bg: "bg-zinc-100 text-zinc-950",
      text: "text-zinc-950",
      border: "border-white",
      dot: "bg-zinc-950",
    },
  },
  {
    id: "LYCEE",
    label: "Lycées",
    icon: GraduationCap,
    activeColor: {
      bg: "bg-amber-950/80 text-amber-200",
      text: "text-amber-300",
      border: "border-amber-500/40",
      dot: "bg-amber-400",
    },
  },
  {
    id: "WATER",
    label: "Eau",
    icon: Droplet,
    activeColor: {
      bg: "bg-cyan-950/80 text-cyan-200",
      text: "text-cyan-300",
      border: "border-cyan-500/40",
      dot: "bg-cyan-400",
    },
  },
  {
    id: "PHARMACY",
    label: "Pharmacie",
    icon: Pill,
    activeColor: {
      bg: "bg-emerald-950/80 text-emerald-200",
      text: "text-emerald-300",
      border: "border-emerald-500/40",
      dot: "bg-emerald-400",
    },
  },
  {
    id: "HOSPITAL",
    label: "Soins",
    icon: HeartPulse,
    activeColor: {
      bg: "bg-rose-950/80 text-rose-200",
      text: "text-rose-300",
      border: "border-rose-500/40",
      dot: "bg-rose-400",
    },
  },
  {
    id: "EMERGENCY",
    label: "Juridique",
    icon: Scale,
    activeColor: {
      bg: "bg-violet-950/80 text-violet-200",
      text: "text-violet-300",
      border: "border-violet-500/40",
      dot: "bg-violet-400",
    },
  },
  {
    id: "TOILET",
    label: "WC",
    icon: Toilet,
    activeColor: {
      bg: "bg-zinc-800/90 text-zinc-100",
      text: "text-zinc-200",
      border: "border-zinc-500/40",
      dot: "bg-zinc-300",
    },
  },
];

export interface FilterBarProps {
  selectedCategories: FilterCategoryId[];
  onToggleCategory: (category: FilterCategoryId) => void;
  counts: Record<FilterCategoryId, number>;
  activeBlocusCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * FilterBar - Barre de filtres POI moderne, minimaliste et accessible
 * - Hauteur ~32px, texte 13px, fond translucide, bordure ultra-fine
 * - Icônes monochromes fines Lucide (trait 1.5)
 * - Compteur affiché UNIQUEMENT sur la chip active
 * - Sélection multiple avec désactivation automatique de "Tous"
 * - Cibles tactiles étendues à >= 44px sans déformation visuelle
 * - Une seule ligne scrollable sur mobile, sans scrollbar
 */
export function FilterBar({
  selectedCategories,
  onToggleCategory,
  counts,
  activeBlocusCount = 0,
  className = "",
  style,
}: FilterBarProps) {
  const isAllActive =
    selectedCategories.length === 0 || selectedCategories.includes("ALL");

  return (
    <div
      className={`absolute left-0 right-0 z-20 pointer-events-none px-2 sm:px-4 ${className}`}
      style={
        style || {
          top: "calc(max(10px, env(safe-area-inset-top, 10px)) + 68px)",
        }
      }
      role="region"
      aria-label="Filtres des points d'intérêt"
    >
      <div className="pointer-events-auto max-w-5xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 touch-pan-x">
        {FILTER_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === "ALL" ? isAllActive : !isAllActive && selectedCategories.includes(item.id);
          const count = counts[item.id] ?? 0;

          // Libellé de compteur personnalisé pour Lycées avec blocus actif
          let countLabel: string | null = null;
          if (isActive) {
            if (item.id === "LYCEE" && activeBlocusCount > 0) {
              countLabel = `${activeBlocusCount} blocus`;
            } else if (count > 0) {
              countLabel = String(count);
            }
          }

          return (
            <div key={item.id} className="relative flex items-center shrink-0">
              <button
                type="button"
                onClick={() => onToggleCategory(item.id)}
                aria-pressed={isActive}
                aria-label={`Filtrer par ${item.label}${isActive && countLabel ? ` (${countLabel})` : ""}`}
                className={`group relative h-8 px-2.5 rounded-full text-[13px] tracking-tight transition-all duration-150 flex items-center gap-1.5 select-none touch-manipulation before:absolute before:-inset-y-1.5 before:-inset-x-0.5 before:content-[''] ${
                  isActive
                    ? `${item.activeColor.bg} ${item.activeColor.border} border shadow-sm font-semibold`
                    : "bg-zinc-950/75 text-zinc-300 border border-white/[0.08] hover:border-white/20 hover:text-white backdrop-blur-md font-medium"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 stroke-[1.5] transition-colors ${
                    isActive
                      ? item.id === "ALL"
                        ? "text-zinc-950"
                        : item.activeColor.text
                      : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>

                {/* Compteur UNIQUEMENT sur la chip active */}
                {isActive && countLabel && (
                  <span
                    className={`text-[11px] font-mono leading-none px-1 py-0.5 rounded-full ${
                      item.id === "ALL"
                        ? "bg-zinc-200/90 text-zinc-900 font-bold"
                        : "bg-black/40 text-current opacity-90 font-bold"
                    }`}
                  >
                    ({countLabel})
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
