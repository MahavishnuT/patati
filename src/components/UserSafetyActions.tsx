import React, { useState } from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { colors, spacing, borders } from '@/design/tokens';
import { blockUser, reportUser, type ReportReason } from '@/lib/data';

type Props = {
  reporterId: string;
  reportedUserId: string;
  messageContext?: { matchId: string; messageId: string; content: string };
  onBlocked?: () => void;
};

const REPORT_REASONS: ReportReason[] = [
  'inappropriate_profile',
  'harassment',
  'spam',
  'sexual_content',
  'underage',
  'other',
];

export function UserSafetyActions({ reporterId, reportedUserId, messageContext, onBlocked }: Props) {
  const { t } = useTranslation();
  const [actionsVisible, setActionsVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [working, setWorking] = useState(false);

  const submitReport = async (reason: ReportReason) => {
    setReportVisible(false);
    setWorking(true);
    try {
      await reportUser(reporterId, reportedUserId, reason, messageContext);
      Alert.alert(t('safety.reportSubmitted'), t('safety.reportThanks'));
    } catch {
      Alert.alert(t('common.error'), t('safety.reportFailed'));
    } finally {
      setWorking(false);
    }
  };

  const confirmBlock = () => {
    setActionsVisible(false);
    Alert.alert(t('safety.blockTitle'), t('safety.blockMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('safety.blockAction'),
        style: 'destructive',
        onPress: () => {
          setWorking(true);
          void blockUser(reporterId, reportedUserId)
            .then(() => {
              onBlocked?.();
            })
            .catch(() => {
              Alert.alert(t('common.error'), t('safety.blockFailed'));
            })
            .finally(() => setWorking(false));
        },
      },
    ]);
  };

  return (
    <>
      <Pressable
        onPress={() => setActionsVisible(true)}
        disabled={working}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t('safety.actions')}
        style={{ padding: spacing.xs, opacity: working ? 0.5 : 1 }}
      >
        <Ionicons name={messageContext ? 'flag-outline' : 'ellipsis-horizontal-circle-outline'} size={messageContext ? 18 : 24} color={colors.ink} />
      </Pressable>

      <Modal transparent visible={actionsVisible} animationType="fade" onRequestClose={() => setActionsVisible(false)}>
        <Pressable
          onPress={() => setActionsVisible(false)}
          style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: '#00000088' }}
        >
          <View style={{ backgroundColor: colors.white, borderWidth: borders.thick, borderColor: colors.ink, padding: spacing.md, gap: spacing.xs }}>
            <Text variant="subtitle">{t('safety.actions')}</Text>
            <Pressable
              onPress={() => {
                setActionsVisible(false);
                setReportVisible(true);
              }}
              style={{ padding: spacing.sm, backgroundColor: colors.yellow, borderWidth: borders.base, borderColor: colors.ink }}
            >
              <Text variant="bodyBold">{t('safety.reportAction')}</Text>
            </Pressable>
            <Pressable
              onPress={confirmBlock}
              style={{ padding: spacing.sm, backgroundColor: colors.pink, borderWidth: borders.base, borderColor: colors.ink }}
            >
              <Text variant="bodyBold">{t('safety.blockAction')}</Text>
            </Pressable>
            <Pressable onPress={() => setActionsVisible(false)} style={{ padding: spacing.sm, alignItems: 'center' }}>
              <Text variant="body">{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={reportVisible} animationType="fade" onRequestClose={() => setReportVisible(false)}>
        <Pressable
          onPress={() => setReportVisible(false)}
          style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: '#00000088' }}
        >
          <View style={{ backgroundColor: colors.white, borderWidth: borders.thick, borderColor: colors.ink, padding: spacing.md, gap: spacing.xs }}>
            <Text variant="subtitle">{t('safety.reportTitle')}</Text>
            {REPORT_REASONS.map((reason) => (
              <Pressable
                key={reason}
                onPress={() => void submitReport(reason)}
                style={{ padding: spacing.sm, backgroundColor: colors.bg, borderWidth: borders.base, borderColor: colors.ink }}
              >
                <Text variant="body">{t(`safety.reasons.${reason}`)}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setReportVisible(false)} style={{ padding: spacing.sm, alignItems: 'center' }}>
              <Text variant="body">{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
