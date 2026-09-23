import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, TextField, EmptyState } from '@/components';
import { colors, spacing, borders } from '@/design/tokens';
import { useAuth } from '@/lib/auth';
import { getMyMatches, getMessages, sendMessage, subscribeToMessages } from '@/lib/data';
import type { Message, MatchWithProfile } from '@/types/models';
import { HardShadow } from '@/design/HardShadow';

const CHAT_INPUT_HEIGHT = 48;

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { session } = useAuth();
  const [match, setMatch] = useState<MatchWithProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const load = useCallback(async () => {
    if (!session?.user.id || !matchId) return;
    const [matches, msgs] = await Promise.all([getMyMatches(session.user.id), getMessages(matchId)]);
    setMatch(matches.find((m) => m.id === matchId) ?? null);
    setMessages(msgs);
  }, [session, matchId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => {
    if (!matchId) return;
    return subscribeToMessages(matchId, (message) => {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });
  }, [matchId]);

  const onSend = async () => {
    const content = draft.trim();
    if (!content || !session?.user.id || !matchId) return;
    setDraft('');
    try {
      const sent = await sendMessage(matchId, session.user.id, content);
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
    } catch {
      setDraft(content);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.orange, borderBottomWidth: borders.thick, borderBottomColor: colors.ink }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              padding: spacing.sm,
            }}
          >
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('common.back')}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
            {match && <Avatar uri={match.otherProfile.photo_url} name={match.otherProfile.first_name} size={40} />}
            <Text variant="subtitle" numberOfLines={1}>
              {match?.otherProfile.first_name ?? ''}
            </Text>
          </View>
        </SafeAreaView>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.xs, flexGrow: 1 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<EmptyState icon="chatbubble-ellipses-outline" title={t('chat.empty')} tone={colors.orange} />}
          renderItem={({ item }) => {
            const isMine = item.sender_id === session?.user.id;
            return (
              <HardShadow backgroundColor={isMine ? colors.blue : colors.white} borderColor={colors.ink} borderWidth={borders.base} radius={8} offset={4} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '80%', marginBottom: spacing.xxs }}>   
                <View
                  style={{
                    paddingVertical: spacing.xs,
                    paddingHorizontal: spacing.sm,
                  }}
                >
                  <Text variant="body" style={{ color: isMine ? colors.white : colors.ink }}>
                    {item.content}
                  </Text>
                </View>
              </HardShadow>
            );
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField
              placeholder={t('chat.placeholder')}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={onSend}
              containerStyle={{ marginBottom: 0 }}
              style={{ height: CHAT_INPUT_HEIGHT, paddingVertical: 0, textAlignVertical: 'center' }}
            />
          </View>
          <Pressable
            onPress={onSend}
            accessibilityRole="button"
            accessibilityLabel={t('chat.send')}
            style={{
              height: CHAT_INPUT_HEIGHT,
              width: CHAT_INPUT_HEIGHT,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.green,
              borderWidth: borders.base,
              borderColor: colors.ink,
              borderRadius: 4,
            }}
          >
            <Ionicons name="send" size={20} color={colors.ink} />
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
