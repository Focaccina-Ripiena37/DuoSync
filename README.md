<div align="center">
	<h1>💑 DuoSync</h1>
	<p><em>Calendario e wishlist condivisi, con Next.js + Firebase</em> — <strong>Dark/Light mode</strong></p>

	<a href="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-deploy.yml">
		<img alt="Deploy status" src="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-deploy.yml/badge.svg" />
	</a>
	<a href="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-pull-request.yml">
		<img alt="PR Preview" src="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-pull-request.yml/badge.svg" />
	</a>
</div>

App Next.js (App Router) con autenticazione Firebase, calendario e wishlist condivisi. Deploy su Firebase Hosting con esportazione statica.

## Funzionalità

- Login con Email/Password (due utenti consentiti)
- Calendario condiviso a griglia mensile
	- Evidenziazione di oggi, navigazione mese precedente/successivo
	- Eventi con colore, descrizione, tutto il giorno oppure fascia oraria
	- Modale per dettagli e modifica/eliminazione
	- Query Firestore filtrata sul mese visibile
- Wishlist condivisa
	- Mostra prima gli elementi del partner
	- Campo link opzionale con bottone "Apri link"
- Navigazione ottimizzata per mobile (bottom bar) e desktop (header)
- Tema chiaro/scuro con toggle nell’header (next-themes)

## Requisiti

- Node.js 18+
- Firebase CLI (`npm i -g firebase-tools`)

## Setup

1. Variabili d'ambiente
	 - Copia `.env.local.example` in `.env.local`.
	 - Compila i valori dal progetto Firebase (Console > Impostazioni progetto > SDK Web):
		 - `NEXT_PUBLIC_FIREBASE_API_KEY`
		 - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
		 - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
		 - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
		 - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
		 - `NEXT_PUBLIC_FIREBASE_APP_ID`
	 - Nota: queste chiavi sono di configurazione client e non sono segreti. NON committare `.env.local` (già ignorato in `.gitignore`).

2. Firebase Authentication
	 - Abilita Email/Password.
	 - Crea i due utenti che useranno l'app.

3. Firestore Rules (accesso ristretto a due email)
	 - Apri `firestore.rules` e sostituisci le due email consentite.
	 - Deploy regole:
		 ```bash
		 firebase deploy --only firestore --project <project-id>
		 ```

4. Hosting (static export)
	 - `next.config.ts` è configurato con `output: "export"` e `trailingSlash: true`.
	 - `firebase.json` usa `out/` come public e imposta header per evitare HTML cache (niente 404 di chunk vecchi) e per rendere statici i file `_next/static/**`.

## Sviluppo locale

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm install
npm run deploy            # build + export + firebase deploy (usa progetto da .firebaserc)

# in alternativa
npm run build:static      # solo build+export in out/
firebase deploy --project <project-id>
```

> Se non hai impostato il progetto localmente, esegui `firebase use --add` oppure aggiungi `--project <project-id>` ai comandi di deploy.

## CI/CD (consigliato)

Sono inclusi due workflow in `.github/workflows/`:

- `firebase-hosting-pull-request.yml`: preview su PR
- `firebase-hosting-deploy.yml`: build su push in `main` e deploy manuale su produzione via "Run workflow" con conferma

Per abilitarli:

1) Crea una chiave JSON di Service Account con ruolo minimo "Firebase Hosting Admin" nel progetto `duosync-xxx`.
2) In GitHub: Settings → Secrets and variables → Actions → New repository secret
	- Nome: `FIREBASE_SERVICE_ACCOUNT_DUOSYNC_XXX`
	- Valore: incolla il JSON del service account
3) (Consigliato) Environment `production` con approvazione manuale e accesso ai secrets limitato.

> Come funziona: al push su `main` viene eseguita la build. Per rilasciare in produzione, apri la tab **Actions** → workflow "Deploy to Firebase Hosting" → **Run workflow** → scegli `confirm: yes`.

## Sicurezza e privacy su repo pubblica

- Config Firebase Web: non è segreta. È normale tenerla client-side. La sicurezza è garantita dalle regole Firestore.
- File `.env.local`: non committare. È già ignorato. Usa `.env.local.example` come template senza dati sensibili.
- Regole Firestore: sono la barriera reale. In questo progetto consentono accesso solo a due email. Mantienile aggiornate.
- Domini autorizzati (Auth): limita i domini di redirect/hosting nella Console Firebase.
- Dati personali: evita di committare dati reali in `public/` o `docs/`. Popola il DB direttamente in Firebase.
- Token/Service Account: non committare JSON di service account. Mettilo nei GitHub Secrets per i workflow.
- Repo pubblica vs privata: se preferisci la massima riservatezza, rendi la repo privata. Pubblica è ok se non contiene segreti o PII.
- App Check (opzionale ma utile): abilitalo in Firebase per Firestore/Hosting per mitigare abusi da client non verificati.
- 2FA: abilita l’autenticazione a due fattori sul tuo account GitHub e su Google.
- Branch protection: proteggi `main` con review obbligatorie e status checks.

## App Check (Web) con reCAPTCHA v3

- Imposta nel file `.env.local` la variabile `NEXT_PUBLIC_FIREBASE_RECAPTCHA_V3_SITE_KEY` (site key pubblica reCAPTCHA v3).
- In Firebase Console abilita App Check per la tua app Web e seleziona reCAPTCHA v3.
- L’SDK è inizializzato in `src/lib/firebase.ts` e aggiorna automaticamente i token (`isTokenAutoRefreshEnabled: true`).

## Strumenti

- Next.js 15 (App Router)
- Firebase Hosting, Auth, Firestore
- Tailwind + shadcn/ui
- date-fns (locale: it)

## Licenza

Nessuna licenza specificata. Aggiungi una licenza se intendi distribuirla.
