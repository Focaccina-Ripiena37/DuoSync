"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Inserisci un'email valida." }),
  password: z
    .string()
    .min(6, { message: "La password deve contenere almeno 6 caratteri." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const siteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
    "RECAPTCHA_SITE_KEY_PLACEHOLDER"; // fallback to provided key

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const token: string = await new Promise((resolve, reject) => {
        const gre: any = (window as any)?.grecaptcha;
        if (!gre) {
          reject(new Error("reCAPTCHA non caricato"));
          return;
        }
        gre.ready(async () => {
          try {
            const t = await gre.execute(siteKey, { action: "LOGIN" });
            resolve(t);
          } catch (e) {
            reject(e);
          }
        });
      });

      const res = await fetch("/api/recaptcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "LOGIN" }),
      });

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(
          payload?.message || "Verifica reCAPTCHA fallita, riprova."
        );
      }
      if (typeof payload.score === "number" && payload.score < 0.5) {
        throw new Error("Punteggio reCAPTCHA troppo basso");
      }
      if (payload.action && payload.action !== "LOGIN") {
        throw new Error("Azione reCAPTCHA non valida");
      }

      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push("/calendar");
    } catch (error: any) {
      console.error("Login failed:", error);
      let errorMessage = "Impossibile completare l'accesso. Controlla i dati e riprova.";
      
      // Handle Firebase auth errors
      if (error?.code === "auth/invalid-credential" || error?.code === "auth/wrong-password" || error?.code === "auth/user-not-found") {
        errorMessage = "Email o password non validi. Riprova.";
      } else if (error?.code === "auth/too-many-requests") {
        errorMessage = "Troppi tentativi falliti. Riprova più tardi.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Errore",
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
        strategy="afterInteractive"
      />
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-primary"
            >
              <path d="M11.7 6.6c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0l- ключевая-2.1 2.1c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l2.1-2.1z" />
              <path d="M12.3 17.4c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l2.1-2.1c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-2.1 2.1z" />
              <path d="M3.9 8.9c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l2.1 2.1c.4.4 1 .4 1.4 0 .4-.4.4-1 0-1.4L3.9 8.9z" />
              <path d="M19.5 8.9c.4.4 1 .4 1.4 0 .4-.4.4-1 0-1.4l-2.1-2.1c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l2.1 2.1z" />
              <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
              <path d="M12 12l4.2 4.2" />
            </svg>
          </div>
          <CardTitle className="font-headline text-2xl">DuoSync</CardTitle>
          <CardDescription>Accedi al tuo spazio condiviso</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="tua@email.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Accedi
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
