# DuoSync

A private shared **calendar** and **wishlist** for two people, exported as a static
Next.js app and served by Firebase Hosting.

Built with Next.js (App Router), Firebase (Auth, Firestore, Hosting, App Check),
Tailwind + shadcn/ui, and date-fns. Installable as a PWA.

## Features

- Shared calendar with month and week views, quick-add events, per-day dialogs
- Shared wishlist: add items, mark as bought, reserve a partner's item ("I'll take it")
- Light/dark theme, mobile-first navigation, installable PWA

## Use it as your own private app

This repository is a ready template: clone it, point it to your own Firebase
project, and only the two e-mail addresses you pick will be able to log in.

1. `npm install`
2. Enable Email/Password authentication, Firestore, and Hosting in a Firebase project.
3. Copy `.env.local.example` to `.env.local` and fill it with your Firebase web-app
   config and your two e-mail addresses.
4. Deploy:

   ```bash
   npm run deploy:rules   # compiles and pushes the Firestore rules with your addresses
   npm run deploy         # static export + Firebase Hosting deploy
   ```

Local development: `npm run dev`

## Stack

- Next.js (App Router, `output: "export"`)
- Firebase Auth, Firestore, Hosting, App Check
- Tailwind CSS + shadcn/ui
- TypeScript, ESLint, Vitest

## License

[MIT](./LICENSE)