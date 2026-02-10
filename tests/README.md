# Test Framework Overview

## Aperçu

Ce dossier contient la base Playwright choisie pour ce projet Next.js, inspirée par les bonnes pratiques BMAD (fixture-architecture, data-factories, network-first, test-quality). Elle repose sur `@seontechnologies/playwright-utils` pour les fixtures, le logging, la manipulation réseau et l'authentification.

## Mise en place

1. Copier `.env.example` vers `.env` et compléter `BASE_URL`, `API_URL`, `TEST_ENV`.
2. Installer les dépendances : `npm install` (ou `pnpm install`).
3. Utiliser Node 24 via `.nvmrc` : `nvm use`.
4. (Optionnel) Ajouter des variables spécifiques à vos environnements (auth, feature flags) dans `.env`.

## Exécution des tests

- `npm run test:e2e` : lance Playwright avec configuration parallelisée et trace/screenshot/vidéo `on-first-retry`.
- `npx playwright test --headed` : mode débogage (ouvre le navigateur).
- `npx playwright test tests/e2e/example.spec.ts --debug` : déclenche la vue Playwright Inspector pour un test précis.
- `npx playwright show-report test-results/html` : afficher le rapport HTML généré.
- `npx playwright test --workers=1 --trace=on` : debug trace complet.

## Architecture du framework

- Config TypeScript `playwright.config.ts` (timeouts 15s/30s/60s, base URL sur `BASE_URL`, artefacts sur échec, 3 projets navigateur + 2 mobile, reporters `list`/`html`/`junit`).
- Dossier `tests/e2e/` pour les specs d’acceptance, `tests/support/fixtures/` pour les fixtures composées (mergeTests) et `tests/support/helpers/` pour les utilitaires (API/network).
- Fixtures auto-cleanup via `registerCleanup`, factories `tests/support/fixtures/factories/user.factory.ts` (faker), helpers `sneakyNavigateWithInterception` respectant le pattern network-first.

## Bonnes pratiques

- Suivre la hiérarchie de selectors : `data-testid` ou rôle ARIA, éviter les CSS/`nth()` (source `selector-resilience.md`).
- Chaque test doit avoir un seul scénario et une seule assertion principale (test-quality).
- Intercepter les requêtes avant `page.goto()` (`network-first.md`) et utiliser `intercept-network-call` ou `waitForResponse` pour des attentes déterministes.
- Utiliser des données générées via les factories (faker) pour éviter les collisions, puis nettoyer via `registerCleanup` (data-factories).
- Logger registres/étapes via `log` pour enrichir les rapports Playwright (log.md).

## CI & scalabilité

- CI doit invoquer `npm run test:e2e`; la parallelisation et les retries sont configurés automatiquement.
- Pour optimiser les runs ciblés, intégrer ultérieurement `@seontechnologies/playwright-utils/burn-in` si nécessaire (burn-in.md). Les artefacts sont stockés dans `test-results/` et branchés aux rapports JUnit/HTML.

## Références de connaissances utilisées

- `fixture-architecture.md`, `data-factories.md` pour la construction des fixtures et des factories.
- `network-first.md`, `intercept-network-call.md` pour garantir des attentes déterministes.
- `test-quality.md`, `selector-resilience.md` pour les normes de test (don’t use hard waits, use data-testid).
- `log.md`, `api-request.md`, `auth-session.md`, `network-recorder.md`, `network-error-monitor.md`, `recurse.md` pour les fixtures Playwright Utils.
- `overview.md`, `fixtures-composition.md` pour la composition des fixtures via `mergeTests`.

## Troubleshooting

- **Le test est détecté comme pass** : vérifier que l’environnement cible (backend) est bien accessible (`BASE_URL`) et que les données dynamiques via factories provoquent le comportement attendu.
- **Artefacts absents** : Playwright ne crée traces/screenshot/vidéo qu’en cas d’échec ; réexécuter avec `PLAYWRIGHT_DOCKER=1` si besoin d’isoler dans CI.
- **Node version mismatch** : `nvm use` ou `corepack` pour aligner sur la version 24 de `.nvmrc`.
