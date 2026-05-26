# Budget App — Guide pour Claude Code

## Contexte projet

Application web de gestion de budget personnel et partagé. Stack stable et minimaliste, esthétique Apple/Linear (sobre, beaucoup de blanc, ombres très subtiles, typographie soignée).

non de l'application web budgvert

## Stack technique (à respecter strictement)

- **React 18** + **Vite** + **TypeScript** (strict mode)
- **TailwindCSS** + **shadcn/ui** (Radix sous le capot)
- **Supabase** (Postgres + Auth + RLS + Edge Functions + Realtime)
- **React Router v6** pour la navigation
- **Zustand** pour le state global léger (budget actif, theme)
- **TanStack Query** pour le cache serveur (toutes les requêtes Supabase passent par useQuery/useMutation)
- **react-hook-form** + **zod** pour tous les formulaires
- **date-fns** pour les dates (PAS dayjs, PAS moment)
- **lucide-react** pour TOUTES les icônes (zéro emoji dans l'UI finale)
- **recharts** pour les graphiques (donut + bar chart)
- **sonner** pour les toasts (intégré shadcn)
- **papaparse** pour export CSV, **xlsx** (sheetjs) pour Excel
- **Resend** via Edge Function Supabase pour les mails

## Conventions de code (non négociables)

### Structure dossiers
```
src/
├── app/                    # routing, layouts
│   ├── layouts/
│   │   ├── DesktopLayout.tsx  # sidebar + main + right panel
│   │   └── MobileLayout.tsx   # bottom nav
│   └── routes.tsx
├── features/               # par domaine métier
│   ├── auth/
│   ├── budgets/
│   ├── transactions/
│   ├── categories/         # charges fixes
│   ├── members/
│   ├── savings/
│   ├── debts/
│   └── alerts/
├── components/
│   ├── ui/                 # shadcn (button, dialog, input, etc.)
│   └── shared/             # composants métier partagés
├── lib/
│   ├── supabase.ts         # client typé
│   ├── utils.ts            # cn(), formatters
│   ├── format.ts           # formatCurrency, formatDate
│   └── constants.ts
├── hooks/
├── stores/                 # zustand
└── types/
    └── database.ts         # types générés depuis Supabase
```

### Règles strictes

1. **Une feature = un dossier** contenant : `components/`, `hooks/`, `api.ts` (calls Supabase), `schemas.ts` (zod), `types.ts`.
2. **Jamais de fetch direct** dans un composant. Toujours via un hook custom (`useTransactions()`, `useBudget(id)`).
3. **TypeScript strict** : pas de `any`, pas de `@ts-ignore`. Si tu bloques, utilise `unknown` + narrowing.
4. **Pas de logique métier dans les composants UI** (ceux de `components/ui/`). Ils restent dumb.
5. **Imports absolus** via alias `@/` (configuré dans tsconfig et vite.config).
6. **Nommage** : composants `PascalCase`, hooks `useCamelCase`, fichiers de composant = nom du composant exact.
7. **Pas de CSS inline** sauf pour valeurs dynamiques (largeur barre %, couleur membre). Tout le reste = Tailwind.
8. **Pas de fichier > 300 lignes**. Si ça dépasse, split.

## Direction UI/UX

- **Inspiration** : Linear, Apple Wallet, Notion, Vercel dashboard.
- **Palette** : fond `#fafafa` (light) / `#0a0a0a` (dark), surfaces `#ffffff` / `#171717`, bordures `#e5e5e5` / `#262626`, accent principal `#6366f1` (indigo-500).
- **Ombres** : `shadow-sm` max, jamais `shadow-lg+`. Préférer les bordures fines.
- **Radius** : `rounded-lg` (8px) partout, `rounded-xl` (12px) pour les cards principales.
- **Typo** : Inter ou system-ui. Tailles : titres `text-2xl font-semibold`, cards `text-lg font-medium`, body `text-sm`.
- **Espacements** : généreux. `p-6` pour cards, `gap-4` minimum entre éléments, `space-y-6` entre sections.
- **Animations** : Framer Motion uniquement si vraiment utile. Sinon `transition-colors` Tailwind. Jamais d'animation gratuite.
- **États** : skeleton loaders (jamais de spinners), empty states avec icône + CTA, error states avec message clair + retry.
- **Mobile** : bottom nav 5 items max, FAB pour ajout transaction, sheets shadcn pour les formulaires.
- **Desktop** : layout 3 colonnes (sidebar 240px / main fluide / right panel 320px).

## Règles métier critiques

### Charges fixes (catégories)
- Type `fixed` : montant prédéfini, soustrait automatiquement du budget mensuel disponible (loyer, abonnements).
- Type `budget` : enveloppe à ne pas dépasser, alimente la barre de progression.
- À chaque transaction ajoutée avec `category_id`, le total dépensé du mois en cours est recalculé côté DB.
- Le trigger PostgreSQL `check_budget_threshold` génère automatiquement les alertes (80% = warning, 100%+ = critical).

### Couleurs barres de progression
- `< 70%` → vert `#10b981`
- `70-90%` → ambre `#f59e0b`
- `> 90%` → rouge `#ef4444`

### Budget partagé
- Si `budget.type !== 'personal'` et `members.length > 0` → afficher la page `/partage`.
- Sinon → page d'onboarding "Inviter un membre".
- Chaque transaction peut avoir un `member_id` (assignation).
- Cards membres style Apple : avatar initiales coloré, top 3 catégories du mois, total dépensé, % du total budget.

### Calendrier dashboard
- Grille 7 colonnes Lundi → Dimanche.
- Case : vert clair si solde du jour positif (revenu > dépense), crème/or si négatif.
- Aujourd'hui = bordure `border-2 border-indigo-500`.
- Clic sur case → affiche la liste des transactions du jour en dessous (pas en modal).

## Sécurité

- **RLS activée** sur toutes les tables. Toujours tester qu'un user ne peut pas accéder aux données d'un autre budget.
- **Pas de clé service_role** côté client. Uniquement `anon_key`.
- **Validation zod** systématique avant chaque insert/update.
- **Pas de logs sensibles** en prod (montants, emails dans console.log).

## Performance

- **TanStack Query** avec `staleTime: 30_000` par défaut.
- **Invalidation ciblée** après mutations (pas d'invalidation globale).
- **Realtime Supabase** uniquement pour `alerts` et `transactions` du budget actif.
- **Pagination** des transactions : 50 par page, infinite scroll.

## Ce que tu NE fais PAS

- Pas de commentaires inutiles type `// set state`. Le code parle de lui-même.
- Pas de "défensif" excessif (try/catch partout, optional chaining sur tout). Type-safety > defensive.
- Pas de console.log laissés dans le code livré.
- Pas de TODO. Si c'est à faire, fais-le ou ouvre une issue.
- Pas de réécriture massive non demandée. Tu modifies ce qui est demandé.
- Pas d'ajout de dépendances sans validation explicite.

## Workflow

1. Lis le `README.md` et ce fichier avant toute tâche.
2. Pour chaque feature : crée les types DB → l'api Supabase → les hooks → les composants → la route.
3. Avant de committer mentalement une étape, vérifie : TypeScript ok ? RLS testée ? Responsive ok ?
4. Si un choix d'archi se présente, propose-moi 2 options brèves avant de coder.

## Conventions multi-budget

- Toute requête vers une table liée à un budget (categories, transactions, savings_goals, debts, alerts) DOIT inclure budgetId dans la queryKey TanStack Query
- Pattern : queryKey: ['categories', budgetId] — jamais ['categories'] seul
- Le budget actif est UNIQUEMENT lu via useActiveBudget(), jamais via une prop ou un context dédié
- Si une page a besoin du budgetId, elle l'obtient via useActiveBudget(), pas via useParams ou autre
- Les invalidations TanStack après mutation sont CIBLÉES sur le budget concerné : queryClient.invalidateQueries({ queryKey: ['transactions', budgetId] })