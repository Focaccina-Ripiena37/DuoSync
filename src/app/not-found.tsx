import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary text-2xl" aria-hidden>☁️</span>
        </div>
        <h1 className="text-2xl font-headline font-bold">Pagina non trovata</h1>
        <p className="text-muted-foreground mt-2">
          Forse il link è cambiato oppure hai digitato male l'indirizzo.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link href="/" className="px-3 py-2 rounded-md border text-sm">
            Home
          </Link>
          <Link href="/calendar" className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm">
            Vai al Calendario
          </Link>
        </div>
      </div>
    </main>
  );
}
