import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, ExternalLink, Heart, Trash2, X } from "lucide-react";
import type { WishlistItem } from "@/types";
import { cn } from "@/lib/utils";
import { displayName, isReserved, reservedByMe } from "@/lib/wishlist-utils";

function ReservedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
      {label}
    </span>
  );
}

type WishlistCardProps = {
  item: WishlistItem;
  isMine: boolean;
  myUid: string;
  onToggleStatus: (item: WishlistItem) => void;
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
  onReserve: (item: WishlistItem) => void;
  onUnreserve: (item: WishlistItem) => void;
};

export function WishlistCard({
  item,
  isMine,
  myUid,
  onToggleStatus,
  onEdit,
  onDelete,
  onReserve,
  onUnreserve,
}: WishlistCardProps) {
  const bought = item.status === "bought";
  const reservedByOther = isReserved(item) && !reservedByMe(item, myUid);
  const isMyReservation = isReserved(item) && reservedByMe(item, myUid);

  return (
    <Card
      className={cn(
        "flex flex-col transition-shadow hover:shadow-md",
        bought && "bg-accent/30"
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "break-words",
              bought && "line-through text-muted-foreground"
            )}
          >
            {item.name}
          </span>
          <Checkbox
            checked={bought}
            onCheckedChange={() => onToggleStatus(item)}
            aria-label={
              bought
                ? `Segna "${item.name}" come da comprare`
                : `Segna "${item.name}" come comprato`
            }
            className="mt-1 shrink-0"
          />
        </CardTitle>
        {!isMine && (
          <p className="text-xs text-muted-foreground">
            Aggiunto da {displayName(item.ownerEmail)}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        {item.description && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {item.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {item.url && (
            <Button asChild size="sm" variant="outline">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Apri link di "${item.name}"`}
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Apri link
              </a>
            </Button>
          )}
          {isMine && reservedByOther && item.reservedByName && (
            <ReservedBadge label={`Riservato da ${item.reservedByName}`} />
          )}
          {isMine && isMyReservation && (
            <ReservedBadge label="Riservato da te" />
          )}
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between gap-2">
        {!isMine ? (
          isReserved(item) ? (
            isMyReservation ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUnreserve(item)}
                aria-label={`Lascia "${item.name}"`}
              >
                <X className="mr-1.5 h-4 w-4" />
                Lo lascio
              </Button>
            ) : null
          ) : (
            <Button
              size="sm"
              onClick={() => onReserve(item)}
              aria-label={`Prendi "${item.name}"`}
            >
              <Heart className="mr-1.5 h-4 w-4" />
              Lo prendo io
            </Button>
          )
        ) : null}
        {/* Solo chi ha aggiunto l'oggetto puo' modificarlo o eliminarlo:
            l'altro puo' spuntarlo come comprato e prenotarlo. */}
        {isMine && (
          <div className="ml-auto flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 sm:h-9 sm:w-9"
              onClick={() => onEdit(item)}
              aria-label={`Modifica "${item.name}"`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-destructive hover:text-destructive sm:h-9 sm:w-9"
              onClick={() => onDelete(item.id)}
              aria-label={`Elimina "${item.name}"`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
