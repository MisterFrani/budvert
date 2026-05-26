# Budvert

Application de gestion de budget personnel et partagé.

## Stack

React 18 + Vite + TypeScript · TailwindCSS + shadcn/ui · Supabase · TanStack Query · Zustand

## Lancer le projet

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 3. Lancer le serveur de développement
npm run dev
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (http://localhost:5173) |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | Linter ESLint |
| `npm run lint:fix` | Corriger auto les erreurs ESLint |
| `npm run format` | Formater avec Prettier |

## Structure

```
src/
├── app/           # Routing + layouts
├── features/      # Domaines métier (auth, budgets, transactions…)
├── components/    # UI partagés (shadcn/ui + métier)
├── lib/           # Supabase client, utils, formatters
├── hooks/         # Hooks globaux
├── stores/        # Zustand stores
└── types/         # Types DB Supabase
```

## Étape suivante

Configurer Supabase : créer un projet sur [supabase.com](https://supabase.com), récupérer les clés et les ajouter dans `.env`.
