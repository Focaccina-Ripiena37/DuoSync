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
  where,
  Timestamp,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { it } from "date-fns/locale";
import {
  Plus,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Palette,
} from "lucide-react";
import type { CalendarEvent } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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

function defaultColorForUser() {
  const email = auth.currentUser?.email || "";
  // due colori diversi di default per i due utenti
  if (email.toLowerCase().includes("lorenzo")) return "#A78BFA"; // viola
  if (email.toLowerCase().includes("emma")) return "#F472B6"; // rosa
  return "#60A5FA"; // fallback blu
}

const eventSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio."),
  date: z.date({ required_error: "La data è obbligatoria." }),
  description: z.string().optional(),
  color: z.string().optional(),
  allDay: z.boolean().default(true),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

function EventForm({
  event,
  onClose,
  initialDate,
}: {
  event?: CalendarEvent;
  onClose: () => void;
  initialDate?: Date;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  // Auth context not needed inside EventForm currently; using Firebase auth directly for createdBy
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      date: event?.date.toDate() || initialDate || new Date(),
      description: event?.description || "",
      color: event?.color || defaultColorForUser(),
      allDay: event?.allDay ?? true,
      startTime: event?.startTime || "",
      endTime: event?.endTime || "",
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    setIsLoading(true);
    try {
      const eventData = {
        ...data,
        date: Timestamp.fromDate(data.date),
        createdBy: auth.currentUser?.uid || "",
      };
      if (event) {
        await updateDoc(doc(db, "calendar", event.id), eventData);
        toast({ title: "Evento aggiornato!" });
      } else {
        await addDoc(collection(db, "calendar"), eventData);
        toast({ title: "Evento creato!" });
      }
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Qualcosa è andato storto.",
        description: "Impossibile salvare l'evento.",
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titolo</FormLabel>
              <FormControl>
                <Input placeholder="Es. Cena romantica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: it })
                      ) : (
                        <span>Scegli una data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                    locale={it}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="allDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo evento</FormLabel>
                <div className="flex gap-2">
                  <Button type="button" variant={field.value ? "default" : "outline"} onClick={() => field.onChange(true)}>Tutto il giorno</Button>
                  <Button type="button" variant={!field.value ? "default" : "outline"} onClick={() => field.onChange(false)}>Con orario</Button>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">Colore <Palette className="h-4 w-4" /></FormLabel>
                <div className="flex gap-2">
                  {["#A78BFA","#60A5FA","#34D399","#F59E0B","#F472B6"].map(c => (
                    <button key={c} type="button" aria-label={`Scegli colore ${c}`} onClick={() => field.onChange(c)} className={cn("h-8 w-8 rounded-full border", field.value === c && "ring-2 ring-offset-2 ring-primary")} style={{backgroundColor: c}} />
                  ))}
                </div>
              </FormItem>
            )}
          />
        </div>
        {!form.watch("allDay") && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dalle</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alle</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
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
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Annulla
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {event ? "Salva modifiche" : "Crea evento"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user, loading: isAuthLoading } = useAuth();

  // Avoid hydration mismatch by rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // fetch events of the visible month (after auth is ready)
  useEffect(() => {
    if (isAuthLoading || !user) return;
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const qRef = query(
      collection(db, "calendar"),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<=", Timestamp.fromDate(end)),
      orderBy("date", "asc")
    );
    const unsubscribe = onSnapshot(
      qRef,
      (snapshot) => {
        const eventsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent));
        setEvents(eventsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
        toast({ variant: "destructive", title: "Errore di caricamento", description: "Impossibile caricare gli eventi del calendario." });
      }
    );
    return () => unsubscribe();
  }, [currentMonth, toast, isAuthLoading, user]);

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const [draftDate, setDraftDate] = useState<Date | undefined>(undefined);

  const handleAddNew = (date?: Date) => {
    setEditingEvent(undefined);
    setDraftDate(date || undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "calendar", id));
      toast({ title: "Evento cancellato." });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Qualcosa è andato storto.",
        description: "Impossibile cancellare l'evento.",
      });
    }
  };

  // compute calendar grid days (must be declared before any return to keep hooks order stable)
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      const key = format(e.date.toDate(), "yyyy-MM-dd");
      map[key] = map[key] || [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  if (!mounted || loading || isAuthLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const openDay = (d: Date) => {
    setSelectedDate(d);
  };

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: it });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">Calendario Condiviso</h1>
          <p className="text-muted-foreground">I vostri impegni e momenti speciali, insieme.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth((d) => addMonths(d, -1))} aria-label="Mese precedente">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-[150px] text-center font-medium">{monthLabel}</div>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth((d) => addMonths(d, 1))} aria-label="Mese successivo">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Dialog
            open={isFormOpen}
            onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);
              if (!isOpen) setEditingEvent(undefined);
            }}
          >
            <DialogTrigger asChild>
              <Button className="ml-2">
                <Plus className="mr-2 h-4 w-4" /> Aggiungi evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Modifica Evento" : "Nuovo Evento"}</DialogTitle>
              </DialogHeader>
              <EventForm event={editingEvent} initialDate={draftDate} onClose={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {["Lun","Mar","Mer","Gio","Ven","Sab","Dom"].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-px rounded-md border bg-border">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const inMonth = isSameMonth(d, currentMonth);
          const isToday = isSameDay(d, new Date());
          const dayEvents = eventsByDay[key] || [];
          const bg = isToday ? "bg-primary/10" : inMonth ? "bg-card" : "bg-muted/40";
          return (
            <button
              key={key}
              type="button"
              onClick={() => openDay(d)}
              className={cn("min-h-24 p-2 text-left transition-colors focus:outline-none focus-visible:ring-2", bg)}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={cn("font-medium", !inMonth && "text-muted-foreground")}>{format(d, "d", { locale: it })}</span>
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0,3).map((e) => (
                  <div key={e.id} className="truncate rounded px-1 py-0.5 text-xs text-card" style={{backgroundColor: e.color || "#A78BFA"}}>
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">+{dayEvents.length-3} altri</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day details modal */}
      <Dialog open={!!selectedDate} onOpenChange={(o) => !o && setSelectedDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(selectedDate, "eeee d MMMM yyyy", { locale: it }) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(selectedDate && eventsByDay[format(selectedDate, "yyyy-MM-dd")])?.map((event) => (
              <Card key={event.id}>
                <CardHeader className="flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full" style={{backgroundColor: event.color || "#A78BFA"}} />
                      {event.title}
                    </CardTitle>
                    <CardDescription>
                      {event.allDay ? "Tutto il giorno" : `Dalle ${event.startTime} alle ${event.endTime}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(event)} aria-label="Modifica">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Elimina"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Sei sicuro?</AlertDialogTitle><AlertDialogDescription>Questa azione non può essere annullata.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(event.id)}>Sì, cancella</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                {event.description && <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p></CardContent>}
              </Card>
            ))}
            <div className="pt-2">
              <Button onClick={() => handleAddNew(selectedDate || undefined)}><Plus className="mr-2 h-4 w-4"/>Aggiungi evento per questo giorno</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
