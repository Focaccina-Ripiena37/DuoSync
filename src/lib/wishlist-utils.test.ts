import { describe, expect, it } from "vitest";
import type { WishlistItem } from "@/types";
import {
  displayName,
  groupByStatus,
  isReserved,
  reservedByMe,
  sortByCreatedAt,
  splitByOwner,
} from "@/lib/wishlist-utils";

function item(overrides: Partial<WishlistItem>): WishlistItem {
  return {
    id: "i1",
    name: "Oggetto",
    status: "to-buy",
    ownerUid: "uid-1",
    ownerEmail: "lorenzo@example.com",
    ...overrides,
  };
}

describe("splitByOwner", () => {
  it("separa gli item del partner dai miei", () => {
    const mine = item({ id: "a", ownerUid: "uid-1" });
    const theirsLegacy = item({ id: "b", ownerUid: undefined }); // senza owner -> dell'altro
    const theirs = item({ id: "c", ownerUid: "uid-2" });
    const { theirs: theirList, mine: myList } = splitByOwner(
      [mine, theirsLegacy, theirs],
      "uid-1"
    );
    expect(myList.map((i) => i.id)).toEqual(["a"]);
    expect(theirList.map((i) => i.id)).toEqual(["b", "c"]);
  });
});

describe("groupByStatus", () => {
  it("ordina in da-comprare / comprati", () => {
    const toBuy = item({ id: "a" });
    const bought = item({ id: "b", status: "bought" });
    const { toBuy: tb, bought: b } = groupByStatus([bought, toBuy]);
    expect(tb.map((i) => i.id)).toEqual(["a"]);
    expect(b.map((i) => i.id)).toEqual(["b"]);
  });
});

describe("displayName", () => {
  it("deriva il nome dall'email", () => {
    expect(displayName("emma.antibella@example.com")).toBe("Emma.antibella");
    expect(displayName("")).toBe("Partner");
    expect(displayName(undefined)).toBe("Partner");
  });
});

describe("isReserved / reservedByMe", () => {
  it("riconosce riserve attive e proprie", () => {
    const free = item({});
    const other = item({ reservedBy: "uid-2", reservedByName: "Emma" });
    const mine = item({ reservedBy: "uid-1", reservedByName: "Lorenzo" });
    expect(isReserved(free)).toBe(false);
    expect(isReserved(other)).toBe(true);
    expect(reservedByMe(other, "uid-1")).toBe(false);
    expect(reservedByMe(mine, "uid-1")).toBe(true);
  });
});
describe("sortByCreatedAt", () => {
  const at = (ms: number) =>
    ({ toMillis: () => ms }) as unknown as WishlistItem["createdAt"];

  it("ordina dal piu recente e non perde gli item senza createdAt", () => {
    const legacy = item({ id: "legacy", createdAt: undefined });
    const old = item({ id: "old", createdAt: at(1000) });
    const recent = item({ id: "recent", createdAt: at(2000) });

    const sorted = sortByCreatedAt([old, legacy, recent]);

    expect(sorted.map((i) => i.id)).toEqual(["recent", "old", "legacy"]);
  });
});
