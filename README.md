<div align="center">

# DuoSync

**A private, shared calendar & wishlist for two — static Next.js app on Firebase Hosting.**

<p>
<a href="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/ci.yml"><img src="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
<a href="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-deploy.yml"><img src="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-deploy.yml/badge.svg" alt="Deploy"></a>
<a href="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-pull-request.yml"><img src="https://github.com/Focaccina-Ripiena37/DuoSync/actions/workflows/firebase-hosting-pull-request.yml/badge.svg" alt="PR preview"></a>
</p>
<p>
<img alt="Next.js 15" src="https://img.shields.io/badge/Next.js-15-111111?style=flat-square&logo=nextdotjs&logoColor=white">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white">
<img alt="Firebase" src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white">
<img alt="Vitest" src="https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white">
<img alt="PWA" src="https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa">
<img alt="License MIT" src="https://img.shields.io/github/license/Focaccina-Ripiena37/DuoSync?style=flat-square">
</p>

</div>

---

## What is it?

A ready-to-use template for a **two-person private app**: one shared calendar and
one shared wishlist, protected by Firebase auth and Firestore rules so only the
two e-mail addresses you choose can sign in. Exported as a fully static site and
installable as a PWA.

### Features

- **Calendar** — month & week views, quick-add events, colors, all-day or timed
- **Wishlist** — add items, mark as bought, "I'll take it" for your partner's list
- **Theming** — light/dark, mobile-first navigation, installable PWA

## Getting started

Clone it, point it at your own Firebase project, pick your two e-mail addresses.

```bash
npm install
```

1. Enable **Email/Password auth**, **Firestore**, and **Hosting** in a Firebase project.
2. Copy `.env.local.example` to `.env.local` and fill in your Firebase web-app
   config and your two e-mail addresses.
3. Deploy the rules (writes your two addresses into `firestore.rules`, never
   committing them) and then the site:

   ```bash
   npm run deploy:rules
   npm run deploy
   ```

Local development is `npm run dev`.

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js (App Router, `output: "export"`) |
| Backend | Firebase Auth · Firestore · Hosting · App Check |
| UI | Tailwind CSS · shadcn/ui · date-fns |
| Quality | TypeScript · ESLint · Vitest |

## License

[MIT](./LICENSE) © Focaccina-Ripiena37