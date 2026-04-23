import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import {
  Acme_400Regular,
  useFonts as useAcme,
} from '@expo-google-fonts/acme';
import {
  Merriweather_400Regular,
  Merriweather_700Bold,
  Merriweather_400Regular_Italic,
  useFonts as useMerriweather,
} from '@expo-google-fonts/merriweather';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications } from '@/constants/notifications';
// Must be imported at top level so TaskManager.defineTask calls run on every launch
import '@/constants/backgroundTasks';
import { registerBackgroundTasks } from '@/constants/backgroundTasks';
import { startRealtimeSync } from '@/lib/realtimeSync';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [acmeLoaded] = useAcme({ Acme_400Regular });
  const [merriweatherLoaded] = useMerriweather({
    Merriweather_400Regular,
    Merriweather_700Bold,
    Merriweather_400Regular_Italic,
  });

  const fontsLoaded = acmeLoaded && merriweatherLoaded;

  // Register for push notifications once fonts are ready
  const notifListenerRef     = useRef<Notifications.EventSubscription | null>(null);
  const notifResponseRef     = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    void registerForPushNotifications();
    void registerBackgroundTasks();
    const stopSync = startRealtimeSync();

    notifListenerRef.current = Notifications.addNotificationReceivedListener(() => {
      // Notification arrived while app is foregrounded — handler in
      // setNotificationHandler (notifications.ts) shows it automatically.
    });

    notifResponseRef.current = Notifications.addNotificationResponseReceivedListener(() => {
      // User tapped a notification — deep-link handling can go here later.
    });

    return () => {
      stopSync();
      notifListenerRef.current?.remove();
      notifResponseRef.current?.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="choose-trip" />
        <Stack.Screen name="saved-trips" />
        <Stack.Screen name="itinerary" />
        <Stack.Screen name="vote" />
        <Stack.Screen name="vote-tutorial-1" />
        <Stack.Screen name="vote-tutorial-2" />
        <Stack.Screen name="all-voted" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="calendar-day" />
        <Stack.Screen name="invite" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="past-trips" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
