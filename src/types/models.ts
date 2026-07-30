import type { LanguageCode } from '@/lib/languages';

export type Profile = {
  id: string;
  first_name: string;
  birthdate: string | null;
  bio: string;
  city: string;
  photo_url: string | null;
  languages_spoken: LanguageCode[];
  languages_learning: LanguageCode[];
  created_at: string;
  updated_at: string;
};

export type MatchRequest = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
};

export type Match = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
};

export type MatchWithProfile = Match & {
  otherProfile: Profile;
};

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};
