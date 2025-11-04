"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, Loader2, Gift, X } from "lucide-react";
import type { WishlistItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const itemSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio."),
  description: z.string().optional(),
  url: z.string().url({ message: "Inserisci un link valido." }).optional().or(z.literal(""))
});

type ItemFormValues = z.infer<typeof itemSchema>;

function ItemForm({
  item,
  onClose,
}: {
  item?: WishlistItem;
  onClose: () => void;
}) {
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
        const itemData = { ...data, status: "to-buy" as const, ownerUid: auth.currentUser?.uid || "" };
        await addDoc(collection(db, "wishlist"), itemData);
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
                <Input placeholder="Es. Un nuovo libro" {...field} />
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
                <Textarea
                  placeholder="Dettagli aggiuntivi (opzionale)"
                  {...field}
                />
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
                <Input placeholder="https://…" {...field} />
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

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | undefined>(
    undefined
  );
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "wishlist"), orderBy("name"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemsData = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as WishlistItem)
        );
        setItems(itemsData);
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
  }, [toast]);

  const me = auth.currentUser?.uid || "";
  const theirItems = useMemo(() => items.filter(i => i.ownerUid && i.ownerUid !== me), [items, me]);
  const myItems = useMemo(() => items.filter(i => (i.ownerUid || "") === me), [items, me]);

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

  const handleToggleStatus = async (item: WishlistItem) => {
    const newStatus = item.status === "bought" ? "to-buy" : "bought";
    try {
      await updateDoc(doc(db, "wishlist", item.id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Qualcosa è andato storto.",
        description: "Impossibile aggiornare lo stato.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupByStatus = (arr: WishlistItem[]) => ({
    toBuy: arr.filter(x => x.status === 'to-buy'),
    bought: arr.filter(x => x.status === 'bought'),
  });
  const theirs = groupByStatus(theirItems);
  const mine = groupByStatus(myItems);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">
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
          <DialogContent>
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
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">La wishlist è vuota</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Aggiungete il vostro primo desiderio.
          </p>
        </div>
      ) : (
    <div className="space-y-12">
      {/* Wishlist dell'altro utente */}
      {(theirs.toBuy.length > 0 || theirs.bought.length > 0) && (
        <div>
        <h2 className="text-xl font-semibold mb-4">Wishlist di chi ami</h2>
        {theirs.toBuy.length > 0 && <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Da comprare</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {theirs.toBuy.map((item) => (
                            <Card key={item.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex items-start justify-between">
                    <span className={cn(item.status === "bought" && "line-through text-muted-foreground")}>{item.name}</span>
                                      <div className="flex items-center space-x-2 pt-1">
                                          <Checkbox
                                              id={`status-${item.id}`}
                                              checked={item.status === 'bought'}
                                              onCheckedChange={() => handleToggleStatus(item)}
                                              aria-label="Mark as bought"
                                          />
                                      </div>
                                    </CardTitle>
                                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  {item.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                  {item.url && <Button asChild size="sm" variant="outline"><a href={item.url} target="_blank" rel="noopener noreferrer">Apri link</a></Button>}
                </CardContent>
                                <CardFooter className="flex justify-end gap-2 mt-auto">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Sei sicuro?</AlertDialogTitle><AlertDialogDescription>Questa azione non può essere annullata. L'oggetto sarà cancellato permanentemente.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)}>Sì, cancella</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardFooter>
                            </Card>
                        ))}
          </div>
        </div>}
        {theirs.bought.length > 0 && <div>
          <h3 className="text-lg font-medium mb-3">Comprati</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {theirs.bought.map((item) => (
                            <Card key={item.id} className="flex flex-col bg-accent/30">
                                <CardHeader>
                                    <CardTitle className="flex items-start justify-between">
                                      <span className={cn("line-through text-muted-foreground")}>{item.name}</span>
                                      <div className="flex items-center space-x-2 pt-1">
                                          <Checkbox
                                              id={`status-${item.id}`}
                                              checked={item.status === 'bought'}
                                              onCheckedChange={() => handleToggleStatus(item)}
                                              aria-label="Mark as to-buy"
                                          />
                                      </div>
                                    </CardTitle>
                                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  {item.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                  {item.url && <Button asChild size="sm" variant="outline"><a href={item.url} target="_blank" rel="noopener noreferrer">Apri link</a></Button>}
                </CardContent>
                                <CardFooter className="flex justify-end gap-2 mt-auto">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Sei sicuro?</AlertDialogTitle><AlertDialogDescription>Questa azione non può essere annullata. L'oggetto sarà cancellato permanentemente.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)}>Sì, cancella</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardFooter>
                            </Card>
                        ))}
          </div>
        </div>}
        </div>
      )}

      {/* La mia wishlist */}
      {(mine.toBuy.length > 0 || mine.bought.length > 0) && (
        <div>
        <h2 className="text-xl font-semibold mb-4">La mia wishlist</h2>
        {mine.toBuy.length > 0 && <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Da comprare</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {mine.toBuy.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className={cn(item.status === "bought" && "line-through text-muted-foreground")}>{item.name}</span>
                    <div className="flex items-center space-x-2 pt-1">
                      <Checkbox
                        id={`status-${item.id}`}
                        checked={item.status === 'bought'}
                        onCheckedChange={() => handleToggleStatus(item)}
                        aria-label="Mark as bought"
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  {item.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                  {item.url && <Button asChild size="sm" variant="outline"><a href={item.url} target="_blank" rel="noopener noreferrer">Apri link</a></Button>}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 mt-auto">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Sei sicuro?</AlertDialogTitle><AlertDialogDescription>Questa azione non può essere annullata. L'oggetto sarà cancellato permanentemente.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)}>Sì, cancella</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>}
        {mine.bought.length > 0 && <div>
          <h3 className="text-lg font-medium mb-3">Comprati</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {mine.bought.map((item) => (
              <Card key={item.id} className="flex flex-col bg-accent/30">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className={cn("line-through text-muted-foreground")}>{item.name}</span>
                    <div className="flex items-center space-x-2 pt-1">
                      <Checkbox
                        id={`status-${item.id}`}
                        checked={item.status === 'bought'}
                        onCheckedChange={() => handleToggleStatus(item)}
                        aria-label="Mark as to-buy"
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  {item.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                  {item.url && <Button asChild size="sm" variant="outline"><a href={item.url} target="_blank" rel="noopener noreferrer">Apri link</a></Button>}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 mt-auto">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Sei sicuro?</AlertDialogTitle><AlertDialogDescription>Questa azione non può essere annullata. L'oggetto sarà cancellato permanentemente.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)}>Sì, cancella</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>}
        </div>
      )}
        </div>
      )}
    </div>
  );
}
