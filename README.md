<div align="center">

<h1>💑 DuoSync</h1>
<p><em>Calendario e wishlist condivisi, con Next.js + Firebase</em> — <strong>Dark/Light mode</strong></p>

<a href="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/ci.yml">
  <img src="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/ci.yml/badge.svg" alt="CI status" />
</a>

<a href="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-deploy.yml">
  <img src="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-deploy.yml/badge.svg" alt="Deploy status" />
</a>

<a href="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-pull-request.yml">
  <img src="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-pull-request.yml/badge.svg" alt="PR Preview" />
</a>

</div>

App Next.js (App Router) con autenticazione Firebase, calendario e wishlist condivisi per due persone. Deploy su Firebase Hosting con esportazione statica. Licenza MIT.

## Funzionalità

- Login con Email/Password (due utenti consentiti, gated dalle Firestore rules)
- Calendario condiviso
  - Viste **Mese** e **Settimana** (toggle dedicato)
  - Pulsante **Oggi** e navigazione rapida
  - **Quick-add**: pulsante `+` su ogni giorno per creare subito un evento
  - Eventi con colore, descrizione, tutto il giorno oppure fascia oraria
  - Modale per dettagli e modifica/eliminazione
  - Query Firestore filtrata sul periodo visibile
- Wishlist condivisa
  - Sezioni "di chi ami" e "la mia", ordinate per aggiunta recente
  - **"Lo prendo io"**: riserva un regalo della wishlist del partner (sezione "Riservati")
  - Status comprato / da comprare con toggle ottimistico e **annulla**
  - Campo link opzionale con bottone "Apri link", indicazione "Aggiunto da …"
- Navigazione ottimizzata per mobile (bottom bar con safe-area) e desktop (header)
- Tema chiaro/scuro con toggle (next-themes)
- **PWA installabile** (manifest, icone, service worker con cache degli asset statici)

## Requisiti

- Node.js 20+
- Firebase CLI (`npm i -g firebase-tools`)

## Setup

1. Variabili d'ambiente
   - Copia `.env.local.example` in `.env.local`.
   - Compila i valori dal progetto Firebase (Console > Impostazioni progetto > SDK Web):
     - `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
     - `NEXT_PUBLIC_FIREBASE_RECAPTCHA_V3_SITE_KEY` (App Check, reCAPTCHA v3 — site key pubblica)
   - Nota: queste chiavi sono di configurazione client e non sono segreti. NON committare `.env.local` (già ignorato in `.gitignore`).

2. Firebase Authentication
   - Abilita Email/Password e crea i due utenti.

3. Firestore Rules
   - Le regole in `firestore.rules` contengono **solo placeholder** (`user1@example.com` / `user2@example.com`): le email reali non sono mai committate.
   - Aggiungi a `.env.local`:
     - `DUOSYNC_EMAIL_1` / `DUOSYNC_EMAIL_2` = le due email ammesse
   - Deploy delle regole (inietta le email, deploy, poi ripristina i placeholder):
     ```bash
     npm run deploy:rules
     ```

4. Hosting (static export)
   - `next.config.ts` usa `output: "export"` e `trailingSlash: true`.
   - `firebase.json` serve `out/`, imposta header di sicurezza (nosniff, referrer-policy, X-Frame-Options, Permissions-Policy) e cache per `_next/static/**`.

## Sviluppo locale

```bash
npm install
npm run dev
```

## Quality gate

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest (helper puri)
npm run build:static
```

## Build & Deploy

```bash
npm run deploy            # build + export + firebase deploy (progetto da .firebaserc)
npm run deploy:rules      # deploy delle sole Firestore rules (vedi Setup)
```

> Se non hai impostato il progetto localmente, esegui `firebase use --add` oppure aggiungi `--project <project-id>`.

## CI/CD

- **`ci.yml`** — su push in `main` e su ogni PR: lint + typecheck + test + build + **secret scan con gitleaks** (azione pinnate a SHA).
- **`firebase-hosting-pull-request.yml`** — preview della PR su preview channel.
- **`firebase-hosting-deploy.yml`** — build su push in `main`; deploy in produzione solo via "Run workflow" con `confirm: yes` (environment `production`).

Per abilitare i workflow:

1) Crea una chiave JSON di Service Account con ruolo minimo "Firebase Hosting Admin" nel tuo progetto Firebase.
2) In GitHub: Settings → Secrets and variables → Actions → `FIREBASE_SERVICE_ACCOUNT_DUOSYNC_XXX` = JSON del service account (nomi da allineare al tuo progetto).
3) (Consigliato) Environment `production` con approvazione manuale e accesso ai secrets limitato.
4) (Consigliato) Branch protection su `main`: richiedi PR review + status check `CI`.

## Sicurezza e privacy su repo pubblica

- La sicurezza reale è nelle **Firestore rules** (`firestore.rules`): accesso solo alle due email configurate, validazione dei campi in scrittura (`createdBy`/`ownerUid` assegnati dalle regole e immutabili, limiti di dimensione, enum `status`). Le email reali sono placeholder nel repo e vengono iniettate solo al deploy.
- **App Check** (reCAPTCHA v3) mitiga il traffico non verificato verso Firestore. Non esiste più un backend: la vecchia route server di verifica reCAPTCHA è stata rimossa perché incompatibile con l'export statico.
- Config Firebase Web: non è segreta; è normale tenerla client-side.
- `.env.local`: non committare. Usa `.env.local.example` come template senza dati sensibili.
- Headers di sicurezza serviti da Firebase Hosting: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`.
- Domini autorizzati (Auth): limita i domini di redirect nella Console Firebase.
- Token/Service Account: SOLO nei GitHub Secrets, mai in repo.
- Gitleaks in CI blocca commit con segreti; la repo è già stata ripulita nello storico (git-filter-repo) prima della pubblicazione.
- Conosciute: `npm audit` segnala 3 vulnerabilità `high` in `sharp` (transitiva di Next.js, usato solo in build; la fix richiede il Major upgrade a Next 16 — valutare quando disponibile).
- 2FA su GitHub e Google, branch protection su `main`.

## Strumenti

- Next.js 15 (App Router, static export)
- Firebase Hosting, Auth, Firestore, App Check
- Tailwind + shadcn/ui (solo i componenti usati)
- date-fns (locale: it), react-hook-form + zod
- Vitest (test unitari helper), ESLint, TypeScript strict

## Licenza

MIT — vedi [LICENSE](./LICENSE).