# Patati 🗣️☕

Application de rencontre linguistique pour Bruxelles : trouve des personnes qui
parlent la langue que tu apprends, et qui apprennent la langue que tu parles —
pour se rencontrer autour d'un café ou d'un verre.

Stack : **Expo (React Native) + TypeScript + expo-router + Supabase**.
Style : **néo-brutaliste** (couleurs vives, ombres noires dures, bords épais, formes plates).
Langues de l'interface : 🇫🇷 français (défaut), 🇬🇧 anglais, 🇳🇱 néerlandais, 🇪🇸 espagnol, 🇮🇹 italien.

## 1. Créer votre projet Supabase (gratuit, ~2 minutes)

1. Allez sur [supabase.com](https://supabase.com) → **Start your project** → connectez-vous avec GitHub/Google/email.
2. Cliquez **New project**. Choisissez un nom (ex. `patati`), un mot de passe de base de données (gardez-le de côté), une région proche (ex. `Central EU (Frankfurt)` pour Bruxelles), et validez.
3. Attendez ~1-2 minutes que le projet soit provisionné.
4. Dans le menu de gauche, allez dans **SQL Editor** → **New query**, collez tout le contenu du fichier [`supabase/schema.sql`](./supabase/schema.sql) de ce projet, puis cliquez **Run**. Cela crée toutes les tables, les règles de sécurité (RLS), le déclencheur de matching automatique, et le bucket de stockage pour les photos.
5. Allez dans **Project Settings** (icône ⚙️) → **API**. Copiez :
   - **Project URL** (ex. `https://abcdefgh.supabase.co`)
   - **anon public** key (une longue chaîne commençant par `eyJ...`)
6. (Optionnel mais recommandé le temps du développement) Dans **Authentication → Providers → Email**, désactivez **"Confirm email"** pour pouvoir tester les comptes sans devoir cliquer un lien de confirmation à chaque inscription. Réactivez-la avant la mise en production.

## 2. Configurer l'application

```bash
cp .env.example .env
```

Puis éditez `.env` et renseignez :

```
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

## 3. Lancer l'application

```bash
npm install       # si ce n'est pas déjà fait
npx expo start
```

Scannez le QR code avec l'app **Expo Go** (Android/iOS), ou lancez un simulateur avec `npx expo start --ios` / `--android`.

## Fonctionnalités

- **Inscription / connexion** par email + mot de passe (Google/Apple à câbler plus tard).
- **Onboarding** : prénom, bio, langues parlées, langues à apprendre, photo de profil.
- **Découvrir** : liste des profils compatibles (matching mutuel : quelqu'un qui apprend une langue que vous parlez, ET qui parle une langue que vous apprenez), avec bouton "Proposer un match".
- **Matches** : dès que deux personnes se sont mutuellement proposé un match, un match est créé automatiquement (déclencheur SQL) et un chat s'ouvre.
- **Chat** : messagerie texte en temps réel (Supabase Realtime) pour organiser un rendez-vous.
- **Paramètres** : changement de langue de l'application (5 langues), déconnexion.

## Structure du projet

```
app/                      # Écrans (expo-router — routage par fichiers)
  (auth)/                 # Écrans non connectés : welcome, login, signup
  onboarding.tsx           # Création de profil (1re connexion)
  (app)/                   # Écrans connectés (tabs : Découvrir / Matches / Profil)
    discover.tsx
    matches/               # Liste des matches + chat (route dynamique [matchId])
    profile/               # Vue profil, édition, paramètres
src/
  design/                  # Tokens néo-brutalistes (couleurs, ombres, bordures) + HardShadow
  components/              # Composants UI réutilisables (Button, Card, Chip, TextField…)
  i18n/                    # Configuration i18next + fichiers de traduction (5 langues)
  lib/                     # Client Supabase, accès aux données, auth, langues
  types/                   # Types TypeScript partagés
supabase/
  schema.sql               # Schéma complet à exécuter dans Supabase (tables, RLS, matching, storage)
```

## Prochaines étapes suggérées

- Ajouter la connexion Google / Apple (Supabase Auth le supporte nativement).
- Ajouter la géolocalisation pour prioriser les profils proches (colonnes `lat`/`lng` + `earthdistance`).
- Ajouter la vérification d'âge / modération de contenu avant mise en production publique.
- Ajouter des notifications push (Expo Notifications) pour les nouveaux matches/messages.
- Builder l'app avec EAS Build pour la publier sur les stores (`npx eas build`).
