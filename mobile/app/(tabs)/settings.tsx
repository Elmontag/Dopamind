import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { useSettings } from '../../src/context/SettingsContext';
import { useI18n } from '../../src/context/I18nContext';
import { removeItem } from '../../src/storage/storage';

const APP_VERSION = '1.0.0';

function SettingRow({
  label,
  value,
  onToggle,
  isDark,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  isDark: boolean;
}) {
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
      <Text style={{ fontSize: 15, color: textPrimary, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ true: '#6C63FF', false: '#6b7280' }} />
    </View>
  );
}

function SectionHeader({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text style={{ fontSize: 12, color: '#6C63FF', fontWeight: '700', textTransform: 'uppercase', marginTop: 20, marginBottom: 8 }}>
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const { settings, updateSettings } = useSettings();
  const { lang, switchLang } = useI18n();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const bg = isDark ? '#0f0f17' : '#f8f8fc';
  const cardBg = isDark ? '#1a1a2e' : '#ffffff';
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  const textMuted = isDark ? '#9ca3af' : '#6b7280';
  const accent = '#6C63FF';
  const divider = isDark ? '#2a2a3e' : '#e5e7eb';

  async function handleExport() {
    const data = JSON.stringify(state, null, 2);
    await Share.share({ message: data, title: 'Dopamind Export' });
  }

  function handleReset() {
    Alert.alert(
      'Daten zurücksetzen',
      'Alle lokalen Daten werden gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: async () => {
            await removeItem('dopamind-state');
            await removeItem('dopamind-settings');
            await removeItem('dopamind-calendar');
            await removeItem('dopamind-resource-monitor');
            Alert.alert('Erledigt', 'Daten wurden gelöscht. Bitte die App neu starten.');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: textPrimary, marginBottom: 4 }}>Einstellungen</Text>
        <Text style={{ fontSize: 13, color: textMuted, marginBottom: 16 }}>Version {APP_VERSION}</Text>

        {/* Language */}
        <SectionHeader title="Sprache" isDark={isDark} />
        <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 14 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {['de', 'en'].map((l) => (
              <TouchableOpacity
                key={l}
                onPress={() => switchLang(l)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: lang === l ? accent : (isDark ? '#2a2a3e' : '#f3f4f6'),
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: lang === l ? '#fff' : textMuted, fontWeight: '600' }}>
                  {l === 'de' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gamification */}
        <SectionHeader title="Gamification" isDark={isDark} />
        <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 14 }}>
          <SettingRow label="XP & Level aktiv" value={settings.gamification.xpEnabled} onToggle={(v) => updateSettings('gamification', { xpEnabled: v })} isDark={isDark} />
          <View style={{ height: 1, backgroundColor: divider }} />
          <SettingRow label="Sounds" value={settings.gamification.soundEnabled} onToggle={(v) => updateSettings('gamification', { soundEnabled: v })} isDark={isDark} />
          <View style={{ height: 1, backgroundColor: divider }} />
          <SettingRow label="Compassion-Modus" value={settings.gamification.compassionModeEnabled} onToggle={(v) => updateSettings('gamification', { compassionModeEnabled: v })} isDark={isDark} />
          <View style={{ height: 1, backgroundColor: divider }} />
          <SettingRow label="Micro-Confetti" value={settings.gamification.microConfettiEnabled} onToggle={(v) => updateSettings('gamification', { microConfettiEnabled: v })} isDark={isDark} />
          <View style={{ height: 1, backgroundColor: divider }} />
          <SettingRow label="Energie-Check-in" value={settings.gamification.energyCheckinEnabled} onToggle={(v) => updateSettings('gamification', { energyCheckinEnabled: v })} isDark={isDark} />
          <View style={{ height: 1, backgroundColor: divider }} />
          <SettingRow label="Tages-Challenge" value={settings.gamification.dailyChallengeEnabled} onToggle={(v) => updateSettings('gamification', { dailyChallengeEnabled: v })} isDark={isDark} />
        </View>

        {/* Features */}
        <SectionHeader title="Features" isDark={isDark} />
        <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 14 }}>
          <SettingRow label="Kalender" value={settings.features.calendarEnabled} onToggle={(v) => updateSettings('features', { calendarEnabled: v })} isDark={isDark} />
          <View style={{ height: 1, backgroundColor: divider }} />
          <SettingRow label="Ressourcen-Monitor" value={settings.features.resourceMonitorEnabled} onToggle={(v) => updateSettings('features', { resourceMonitorEnabled: v })} isDark={isDark} />
        </View>

        {/* Work hours */}
        <SectionHeader title="Arbeitszeiten" isDark={isDark} />
        <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 14 }}>
          <Text style={{ fontSize: 14, color: textPrimary }}>
            {settings.assistanceWindow.start} – {settings.assistanceWindow.end}
          </Text>
          <Text style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>
            Aktive Tage: {settings.assistanceWindow.activeDays.join(', ')}
          </Text>
        </View>

        {/* Data */}
        <SectionHeader title="Daten" isDark={isDark} />
        <View style={{ backgroundColor: cardBg, borderRadius: 12, overflow: 'hidden' }}>
          <TouchableOpacity onPress={handleExport} style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: divider }}>
            <Text style={{ fontSize: 15, color: accent, fontWeight: '500' }}>📤 Daten exportieren (JSON)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReset} style={{ padding: 16 }}>
            <Text style={{ fontSize: 15, color: '#ef4444', fontWeight: '500' }}>🗑️ Alle Daten zurücksetzen</Text>
          </TouchableOpacity>
        </View>

        {/* Stats info */}
        <SectionHeader title="Statistiken" isDark={isDark} />
        <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 14 }}>
          <Text style={{ fontSize: 14, color: textPrimary }}>Aufgaben gesamt: {state.tasks.length}</Text>
          <Text style={{ fontSize: 14, color: textPrimary, marginTop: 6 }}>Erledigt heute: {state.completedToday}</Text>
          <Text style={{ fontSize: 14, color: textPrimary, marginTop: 6 }}>Fokus heute: {state.focusMinutesToday} Min.</Text>
          <Text style={{ fontSize: 14, color: textPrimary, marginTop: 6 }}>Streak: {state.currentStreakDays} Tage</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
