import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // On avertit plutôt que de planter au chargement du module : ça permet à
  // l'app de démarrer (écran d'erreur clair) même sans .env configuré.
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY manquants. ' +
      'Copiez .env.example vers .env et renseignez vos identifiants Supabase.',
  );
}

// Fallback vers une URL syntaxiquement valide si .env n'est pas encore configuré,
// pour que l'app démarre quand même (les appels échoueront proprement plutôt que
// de faire planter createClient() au chargement du module).
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
