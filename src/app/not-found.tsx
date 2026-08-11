import Link from "next/link";
import { Heart } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Heart className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <h1 className="font-headline text-2xl font-bold">
          Pagina non trovata
        </h1>
        <p className="mt-2 text-muted-foreground">
          Forse il link è cambiato oppure hai digitato male l&apos;indirizzo.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Home
          </Link>
          <Link
            href="/calendar"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Vai al Calendario
          </Link>
        </div>
      </div>
    </main>
  );
}