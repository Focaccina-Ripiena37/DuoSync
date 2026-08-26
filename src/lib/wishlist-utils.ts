import type { WishlistItem } from "@/types";

export type WishlistGroup = { toBuy: WishlistItem[]; bought: WishlistItem[] };

export function groupByStatus(items: WishlistItem[]): WishlistGroup {
  const toBuy: WishlistItem[] = [];
  const bought: WishlistItem[] = [];
  for (const item of items) {
    (item.status === "bought" ? bought : toBuy).push(item);
  }
  return { toBuy, bought };
}

export function splitByOwner(
  items: WishlistItem[],
  myUid: string
): { theirs: WishlistItem[]; mine: WishlistItem[] } {
  // Items without ownerUid (created before ownership tracking) go to the
  // partner's section so they are never hidden.
  const theirs = items.filter((i) => !i.ownerUid || i.ownerUid !== myUid);
  const mine = items.filter((i) => i.ownerUid === myUid);
  return { theirs, mine };
}

export function displayName(email?: string): string {
  const local = email?.split("@")[0];
  if (!local) return "Partner";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function isReserved(item: WishlistItem): boolean {
  return Boolean(item.reservedBy);
}

export function reservedByMe(item: WishlistItem, myUid: string): boolean {
  return Boolean(item.reservedBy && item.reservedBy === myUid);
}
// Custom order first, falling back to newest-first for legacy items.
export function sortWishlistItems(items: WishlistItem[]): WishlistItem[] {
  return [...items].sort(
    (a, b) =>
      (b.order ?? b.createdAt?.toMillis() ?? 0) -
      (a.order ?? a.createdAt?.toMillis() ?? 0)
  );
}

export function moveWishlistItem(
  items: WishlistItem[],
  itemId: string,
  offset: -1 | 1
): WishlistItem[] {
  const moved = sortWishlistItems(items);
  const from = moved.findIndex((item) => item.id === itemId);
  const to = from + offset;
  if (from < 0 || to < 0 || to >= moved.length) return moved;
  [moved[from], moved[to]] = [moved[to], moved[from]];
  const now = Date.now();
  return moved.map((item, index) => ({ ...item, order: now - index }));
}
