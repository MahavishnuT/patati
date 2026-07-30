import { supabase } from './supabase';
import type { Profile, MatchWithProfile, Message } from '@/types/models';
import type { LanguageCode } from './languages';

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').upsert(profile).select().single();
  if (error) throw error;
  return data as Profile;
}

export async function getCompatibleProfiles(userId: string): Promise<Profile[]> {
  const { data, error } = await supabase.rpc('get_compatible_profiles', { current_user_id: userId });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function proposeMatch(fromUserId: string, toUserId: string): Promise<void> {
  const { error } = await supabase.from('match_requests').insert({ from_user_id: fromUserId, to_user_id: toUserId });
  if (error) throw error;
}

/** Renvoie les langues qu'un profil compatible et moi pouvons pratiquer ensemble. */
export function commonPracticeLanguages(myProfile: Profile, other: Profile): LanguageCode[] {
  const iCanTeachThem = other.languages_learning.filter((l) => myProfile.languages_spoken.includes(l));
  const theyCanTeachMe = other.languages_spoken.filter((l) => myProfile.languages_learning.includes(l));
  return Array.from(new Set([...iCanTeachThem, ...theyCanTeachMe]));
}

export async function getMyMatches(userId: string): Promise<MatchWithProfile[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const matches = data ?? [];
  if (matches.length === 0) return [];

  const otherIds = matches.map((m) => (m.user_a_id === userId ? m.user_b_id : m.user_a_id));
  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').in('id', otherIds);
  if (profilesError) throw profilesError;

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));
  return matches
    .map((m) => {
      const otherId = m.user_a_id === userId ? m.user_b_id : m.user_a_id;
      const otherProfile = profileById.get(otherId);
      return otherProfile ? { ...m, otherProfile } : null;
    })
    .filter((m): m is MatchWithProfile => m !== null);
}

export async function getMessages(matchId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(matchId: string, senderId: string, content: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: senderId, content })
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}

export function subscribeToMessages(matchId: string, onInsert: (message: Message) => void) {
  const channel = supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
      (payload) => onInsert(payload.new as Message),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const fileExt = uri.split('.').pop() ?? 'jpg';
  const path = `${userId}/avatar.${fileExt}`;

  const { error } = await supabase.storage.from('avatars').upload(path, arrayBuffer, {
    contentType: `image/${fileExt}`,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}
