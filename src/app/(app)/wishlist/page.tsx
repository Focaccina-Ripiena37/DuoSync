"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  deleteField,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2, Gift, Heart } from "lucide-react";
import type { WishlistItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { WishlistCard } from "@/components/WishlistCard";
import { displayName, groupByStatus, splitByOwner } from "@/lib/wishlist-utils";

const itemSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio."),
  description: z.string().optional(),
  url: z.string().url({ message: "Inserisci un link valido." }).optional().or(z.literal("")),
});

type ItemFormValues = z.infer<typeof itemSchema>;

function ItemForm({ item, onClose }: { item?: WishlistItem; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      url: item?.url || "",
    },
  });

  const onSubmit = async (data: ItemFormValues) => {
    setIsLoading(true);
    try {
      if (item) {
        await updateDoc(doc(db, "wishlist", item.id), data);
        toast({ title: "Oggetto aggiornato!" });
      } else {
        await addDoc(collection(db, "wishlist"), {
          ...data,
          status: "to-buy",
          ownerUid: auth.currentUser?.uid || "",
          ownerEmail: auth.currentUser?.email || "",
          createdAt: Timestamp.now(),
        });
        toast({ title: "Oggetto aggiunto!" });
      }
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Qualcosa è andato storto.",
        description: "Impossibile salvare l'oggetto.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome oggetto</FormLabel>
              <FormControl>
                <Input placeholder="Es. Un nuovo libro" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione</FormLabel>
              <FormControl>
                <Textarea placeholder="Dettagli aggiuntivi (opzionale)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link (opzionale)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://…" inputMode="url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Annulla
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {item ? "Salva modifiche" : "Aggiungi oggetto"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 text-xl font-semibold">{children}</h2>;
}

function SubSectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-lg font-medium">
      {children}
    </h3>
  );
}

function ItemGrid({
  items,
  isMine,
  myUid,
  onToggleStatus,
  onEdit,
  onDelete,
  onReserve,
  onUnreserve,
}: {
  items: WishlistItem[];
  isMine: boolean;
  myUid: string;
  onToggleStatus: (item: WishlistItem) => void;
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
  onReserve: (item: WishlistItem) => void;
  onUnreserve: (item: WishlistItem) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <WishlistCard
          key={item.id}
          item={item}
          isMine={isMine}
          myUid={myUid}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onReserve={onReserve}
          onUnreserve={onUnreserve}
        />
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | undefined>(undefined);
  const { toast } = useToast();
  const { user, loading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading || !user) return;
    const q = query(collection(db, "wishlist"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setItems(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as WishlistItem)
        );
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching items:", error);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Errore di caricamento",
          description: "Impossibile caricare la wishlist.",
        });
      }
    );
    return () => unsubscribe();
  }, [toast, isAuthLoading, user]);

  const me = user?.uid || "";

  const handleEdit = (item: WishlistItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "wishlist", id));
      toast({ title: "Oggetto cancellato." });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Qualcosa è andato storto.",
        description: "Impossibile cancellare l'oggetto.",
      });
    }
  };

  const handleToggleStatus = (item: WishlistItem) => {
    const newStatus = item.status === "bought" ? "to-buy" : "bought";
    const previous = item.status;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
    );
    toast({
      title: newStatus === "bought" ? "Comprato!" : "Segnato come da comprare",
      action: (
        <ToastAction
          altText="Annulla modifica stato"
          onClick={() => {
            setItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, status: previous } : i))
            );
            void updateDoc(doc(db, "wishlist", item.id), { status: previous });
          }}
        >
          Annulla
        </ToastAction>
      ),
    });
    updateDoc(doc(db, "wishlist", item.id), { status: newStatus }).catch(() => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: previous } : i))
      );
      toast({
        variant: "destructive",
        title: "Oh no! Qualcosa è andato storto.",
        description: "Impossibile aggiornare lo stato.",
      });
    });
  };

  const handleReserve = (item: WishlistItem) => {
    const who = displayName(user?.email || "");
    updateDoc(doc(db, "wishlist", item.id), {
      reservedBy: user?.uid || "",
      reservedByName: who,
      reservedByEmail: user?.email || "",
    })
      .then(() => toast({ title: "Lo prendi tu!" }))
      .catch((error) => {
        console.error("Error reserving item:", error);
        toast({
          variant: "destructive",
          title: "Oh no! Qualcosa è andato storto.",
          description: "Impossibile riservare l'oggetto.",
        });
      });
  };

  const handleUnreserve = (item: WishlistItem) => {
    updateDoc(doc(db, "wishlist", item.id), {
      reservedBy: deleteField(),
      reservedByName: deleteField(),
      reservedByEmail: deleteField(),
    })
      .then(() => toast({ title: "Riserva rimossa." }))
      .catch((error) => {
        console.error("Error unreserving item:", error);
        toast({
          variant: "destructive",
          title: "Oh no! Qualcosa è andato storto.",
          description: "Impossibile rimuovere la riserva.",
        });
      });
  };

  if (loading || isAuthLoading || !user) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-lg bg-muted/60" />
        ))}
      </div>
    );
  }

  const { theirs, mine } = splitByOwner(items, me);
  const theirReserved = theirs.filter((i) => i.reservedBy);
  const theirToBuy = theirs.filter((i) => !i.reservedBy);
  const theirGroups = groupByStatus(theirToBuy);
  const mineGroup = groupByStatus(mine);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            Wishlist Condivisa
          </h1>
          <p className="text-muted-foreground">
            Idee regalo e desideri, per non dimenticare nulla.
          </p>
        </div>
        <Dialog
          open={isFormOpen}
          onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) setEditingItem(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Aggiungi Oggetto
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Modifica Oggetto" : "Nuovo Oggetto"}
              </DialogTitle>
            </DialogHeader>
            <ItemForm item={editingItem} onClose={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg py-16 text-center">
          <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">La wishlist è vuota</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Aggiungete il vostro primo desiderio.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {(theirs.length > 0) && (
            <div>
              <SectionTitle>Wishlist di chi ami</SectionTitle>
              {theirReserved.length > 0 && (
                <div className="mb-6">
                  <SubSectionLabel>
                    <Heart className="h-5 w-5 text-primary" /> Riservati
                  </SubSectionLabel>
                  <ItemGrid
                    items={theirReserved}
                    isMine={false}
                    myUid={me}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReserve={handleReserve}
                    onUnreserve={handleUnreserve}
                  />
                </div>
              )}
              {theirGroups.toBuy.length > 0 && (
                <div className="mb-6">
                  <SubSectionLabel>Da comprare</SubSectionLabel>
                  <ItemGrid
                    items={theirGroups.toBuy}
                    isMine={false}
                    myUid={me}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReserve={handleReserve}
                    onUnreserve={handleUnreserve}
                  />
                </div>
              )}
              {theirGroups.bought.length > 0 && (
                <div>
                  <SubSectionLabel>Comprati</SubSectionLabel>
                  <ItemGrid
                    items={theirGroups.bought}
                    isMine={false}
                    myUid={me}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReserve={handleReserve}
                    onUnreserve={handleUnreserve}
                  />
                </div>
              )}
            </div>
          )}

          {(mineGroup.toBuy.length > 0 || mineGroup.bought.length > 0) && (
            <div>
              <SectionTitle>La mia wishlist</SectionTitle>
              {mineGroup.toBuy.length > 0 && (
                <div className="mb-6">
                  <SubSectionLabel>Da comprare</SubSectionLabel>
                  <ItemGrid
                    items={mineGroup.toBuy}
                    isMine={true}
                    myUid={me}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReserve={handleReserve}
                    onUnreserve={handleUnreserve}
                  />
                </div>
              )}
              {mineGroup.bought.length > 0 && (
                <div>
                  <SubSectionLabel>Comprati</SubSectionLabel>
                  <ItemGrid
                    items={mineGroup.bought}
                    isMine={true}
                    myUid={me}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReserve={handleReserve}
                    onUnreserve={handleUnreserve}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}