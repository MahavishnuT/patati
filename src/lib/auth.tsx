import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { getMyProfile } from './data';
import type { Profile } from '@/types/models';
import { isAdultBirthdate } from './age';

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string, birthdate: unknown) => {
    if (!isAdultBirthdate(birthdate)) {
      setProfile(null);
      return;
    }
    try {
      const p = await getMyProfile(userId);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      if (data.session?.user.id) {
        await loadProfile(data.session.user.id, data.session.user.user_metadata?.birthdate);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user.id) {
        await loadProfile(newSession.user.id, newSession.user.user_metadata?.birthdate);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (data.user) {
      setSession((current) => (current?.user.id === data.user.id ? { ...current, user: data.user } : current));
      await loadProfile(data.user.id, data.user.user_metadata?.birthdate);
    }
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
