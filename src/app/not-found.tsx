"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Ghost, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <main className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Ghost className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Pagina non trovata</CardTitle>
          <p className="text-muted-foreground mt-1">Forse il link è cambiato oppure hai digitato male l'indirizzo.</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nessun problema: puoi tornare indietro oppure andare alla tua area condivisa.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
          </Button>
          <Link href="/calendar" passHref>
            <Button>
              <Home className="mr-2 h-4 w-4" /> Vai al Calendario
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
