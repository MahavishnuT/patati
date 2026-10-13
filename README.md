# Babbel'r 🗣️☕

Application de rencontre linguistique pour Bruxelles : trouve des personnes qui
parlent la langue que tu apprends, et qui apprennent la langue que tu parles —
pour se rencontrer autour d'un café ou d'un verre.

Stack : **Expo (React Native) + TypeScript + expo-router + Supabase**.
Style : **néo-brutaliste** (couleurs vives, ombres noires dures, bords épais, formes plates).
Langues de l'interface : français (défaut), anglais, néerlandais, espagnol, italien.

## 1. Créer votre projet Supabase (gratuit, ~2 minutes)

1. Allez sur [supabase.com](https://supabase.com) → **Start your project** → connectez-vous avec GitHub/Google/email.
2. Cliquez **New project**. Choisissez un nom (ex. `babbelr`), un mot de passe de base de données (gardez-le de côté), une région proche (ex. `Central EU (Frankfurt)` pour Bruxelles), et validez.
3. Attendez ~1-2 minutes que le projet soit provisionné.
4. Dans le menu de gauche, allez dans **SQL Editor** → **New query**, collez tout le contenu du fichier [`supabase/schema.sql`](./supabase/schema.sql) de ce projet, puis cliquez **Run**. Cela crée les tables, les règles de sécurité (RLS), le déclencheur de matching automatique, la file de signalements et le stockage privé des photos.
   - Si le schéma avait déjà été installé avant le changement de nom, **ne relancez pas `schema.sql`** : exécutez uniquement [`supabase/migrations/20261013_store_safety.sql`](./supabase/migrations/20261013_store_safety.sql) dans une nouvelle requête SQL.
5. Allez dans **Project Settings** (icône ⚙️) → **API**. Copiez :
   - **Project URL** (ex. `https://abcdefgh.supabase.co`)
   - **anon public** key (une longue chaîne commençant par `eyJ...`)
6. (Optionnel mais recommandé le temps du développement) Dans **Authentication → Providers → Email**, désactivez **"Confirm email"** pour pouvoir tester les comptes sans devoir cliquer un lien de confirmation à chaque inscription. Réactivez-la avant la mise en production.
7. Pour la suppression de compte dans l'app, déployez la fonction sécurisée après avoir lié le CLI Supabase à ce projet :

   ```bash
   npx supabase functions deploy delete-account
   ```

   La fonction vérifie la session, supprime les photos privées, puis supprime le compte et ses données liées. Ne copiez jamais la clé secrète/service-role dans l'application.

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
- **18+** : âge demandé à l'inscription, contrôlé par Supabase et conservé dans les métadonnées privées du compte (pas dans le profil public).
- **Modération manuelle des profils** : la photo et la description restent invisibles aux autres jusqu'à leur approbation dans Supabase. Une modification les remet en attente.
- **Sécurité communautaire** : signalement d'un profil ou message, blocage d'un membre, photos privées avec accès limité aux profils approuvés et non bloqués.
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
  schema.sql               # Schéma complet pour un nouveau projet Supabase
  migrations/              # Migrations à appliquer aux projets existants
  functions/               # Edge Functions Supabase
```

## Prochaines étapes suggérées

- Ajouter la connexion Google / Apple (Supabase Auth le supporte nativement).
- Ajouter la géolocalisation pour prioriser les profils proches (colonnes `lat`/`lng` + `earthdistance`).
- Déployer et tester la migration, la file de signalements et la suppression de compte avant mise en production publique.
- Évaluer un filtrage automatique des textes et photos en complément de la modération humaine (non implémenté).
- Ajouter des notifications push (Expo Notifications) pour les nouveaux matches/messages.
- `eas.json` fournit des profils de prévisualisation interne et de production. Après avoir configuré les identifiants d'app et le projet EAS, lancer `npx eas-cli build --platform all --profile production`.

## Avant toute soumission aux stores

- **Modération au quotidien** : dans Supabase, examiner la table `content_reports` et mettre à jour son champ `status`. Dans `profiles`, passer `moderation_status` à `approved` seulement après examen; les changements de bio, photo, prénom ou langues remettent le profil à `pending`. Définir qui surveille ces files et sous quel délai avant d'ouvrir l'inscription au public.
- **Contact et règles publiques** : créer une adresse de support/sécurité réellement surveillée, remplacer le placeholder dans [`docs/community-guidelines.md`](./docs/community-guidelines.md), publier les règles sur une page web publique et renseigner ce contact et cette URL dans les consoles des stores. Google Play exige aussi des standards de sécurité enfant pour les apps déclarées « Social » ou « Dating », même si Babbel'r est 18+.
- **Suppression de compte** : le bouton iOS/Android et la fonction Supabase `delete-account` sont implémentés; déployer et tester cette fonction avant la soumission. Il manque encore un chemin web public pour les demandes Google Play.
- **Pages légales et confidentialité** : publier une politique de confidentialité et des conditions d'utilisation; compléter les déclarations de données et la classification d'âge avec les pratiques réelles de production.
- **Identifiants et publication** : choisir les identifiants iOS/Android et lier le projet EAS; `eas.json` contient les profils, mais les identifiants d'app, le `projectId`, les certificats/signatures et les comptes développeur restent à configurer.
- **Limite du contrôle d'âge** : le contrôle actuel est une déclaration de naissance auto-saisie, pas une vérification d'identité. Il faut le signaler exactement ainsi dans les déclarations des stores.

Les règles ne garantissent pas l'approbation : l'équipe App Review et Google Play évaluent aussi le produit réel, ses parcours et les informations fournies dans leurs consoles.
