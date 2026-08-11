import type { Timestamp } from "firebase/firestore";

export type CalendarEvent = {
  id: string;
  title: string;
  date: Timestamp;
  description?: string;
  color?: string; // es. "#A78BFA"
  allDay?: boolean;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  createdBy?: string; // uid
};

export type WishlistItem = {
  id: string;
  name: string;
  description?: string;
  status: "to-buy" | "bought";
  url?: string;
  ownerUid?: string;
  ownerEmail?: string;
  createdAt?: Timestamp;
  reservedBy?: string;
  reservedByName?: string;
  reservedByEmail?: string;
};