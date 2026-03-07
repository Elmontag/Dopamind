import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider } from '../src/context/SettingsContext';
import { AppProvider } from '../src/context/AppContext';
import { ResourceMonitorProvider } from '../src/context/ResourceMonitorContext';
import { CalendarProvider } from '../src/context/CalendarContext';
import { FocusTimerProvider } from '../src/context/FocusTimerContext';
import { I18nProvider } from '../src/context/I18nContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <AppProvider>
            <ResourceMonitorProvider>
              <CalendarProvider>
                <FocusTimerProvider>
                  <I18nProvider>
                    <StatusBar style="auto" />
                    <Stack screenOptions={{ headerShown: false }} />
                  </I18nProvider>
                </FocusTimerProvider>
              </CalendarProvider>
            </ResourceMonitorProvider>
          </AppProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
