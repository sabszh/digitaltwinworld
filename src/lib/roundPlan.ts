import { selectDilemmaExamples } from "@/data/dilemmaExamples";
import type { SelectedDilemmaExamples } from "@/data/dilemmaExamples";
import { developmentIsSuitableForRole, futureDevelopments } from "@/data/futureDevelopments";
import { locations } from "@/data/locations";
import type { CompletedDilemma, FutureDevelopment, FutureTheme, LocationNode, UserRole } from "@/types/world2046";

export type DilemmaSeed = {
  round: number;
  development: FutureDevelopment;
  location: LocationNode;
  examples: SelectedDilemmaExamples;
  severity: "low" | "medium";
};

type Picker = (max: number) => number;
const randomPick: Picker = (max) => Math.floor(Math.random() * max);

function pickOne<T>(items: T[], pick: Picker): T {
  if (items.length === 0) throw new Error("Cannot select from an empty seed pool");
  return items[Math.min(items.length - 1, Math.max(0, pick(items.length)))];
}

function usedThemes(previous: CompletedDilemma[]) {
  const byId = new Map(futureDevelopments.map((item) => [item.id, item]));
  const counts = new Map<FutureTheme, number>();
  for (const completed of previous) {
    const item = completed.futurePressureId ? byId.get(completed.futurePressureId) : undefined;
    for (const theme of item?.themes ?? []) counts.set(theme, (counts.get(theme) ?? 0) + 1);
  }
  return counts;
}

function noveltyScore(item: FutureDevelopment, counts: Map<FutureTheme, number>) {
  return Math.min(...item.themes.map((theme) => counts.get(theme) ?? 0));
}

/** Select the concrete future and place. The participant's choices are ignored. */
export function selectDilemmaSeed(
  previous: CompletedDilemma[],
  role: UserRole,
  pick: Picker = randomPick,
): DilemmaSeed {
  const usedDevelopmentIds = new Set(previous.map((item) => item.futurePressureId).filter(Boolean));
  const suitable = futureDevelopments.filter((item) => developmentIsSuitableForRole(item, role));
  const unused = suitable.filter((item) => !usedDevelopmentIds.has(item.id));
  const available = unused.length ? unused : suitable;
  const themeCounts = usedThemes(previous);
  const bestNovelty = Math.min(...available.map((item) => noveltyScore(item, themeCounts)));
  const varied = available.filter((item) => noveltyScore(item, themeCounts) === bestNovelty);
  const roleWeighted = varied.flatMap((item) => item.suitableRoles?.includes(role) ? [item, item] : [item]);
  const selected = pickOne(roleWeighted, pick);

  const round = previous.length;
  const usedCities = new Set(previous.map((item) => item.city));
  const domestic = locations.filter((item) => item.country === "Danmark" && !usedCities.has(item.city));
  const international = locations.filter((item) => item.country !== "Danmark" && !usedCities.has(item.city));
  const anyUnused = locations.filter((item) => !usedCities.has(item.city));
  const locationPool = round === 0
    ? (domestic.length ? domestic : anyUnused)
    : (international.length ? international : anyUnused);
  const location = pickOne(locationPool.length ? locationPool : locations, pick);
  const examples = selectDilemmaExamples(role, selected.themes, selected.development, pick);

  return {
    round,
    development: selected,
    location,
    examples,
    severity: round === 0 ? "low" : "medium",
  };
}
