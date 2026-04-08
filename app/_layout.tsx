import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [acmeLoaded] = useAcme({ Acme_400Regular });
  const [merriweatherLoaded] = useMerriweather({
    Merriweather_400Regular,
    Merriweather_700Bold,
    Merriweather_400Regular_Italic,
  });

  const fontsLoaded = acmeLoaded && merriweatherLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="choose-trip" />
        <Stack.Screen name="saved-trips" />
        <Stack.Screen name="itinerary" />
        <Stack.Screen name="vote" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="invite" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
