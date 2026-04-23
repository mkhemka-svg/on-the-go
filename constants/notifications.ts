import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// How notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests permission and returns the Expo push token (physical device only).
 * Returns null on simulators or if permission is denied.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'On the GO!',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch {
    return null;
  }
}

// ── Local notification helpers ────────────────────────────────

async function schedule(title: string, body: string, seconds = 1): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: seconds <= 1
      ? null  // fire immediately
      : { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false },
  });
}

// ── Category-specific triggers ────────────────────────────────

/** Call when a new email is added to the crew invite list. */
export async function notifyCollaboratorJoined(email: string): Promise<void> {
  await schedule(
    '🧑‍🤝‍🧑 Crew update',
    `${email} was invited to the trip!`,
  );
}

/** Call after a new itinerary item is saved. */
export async function notifyItineraryItemAdded(title: string): Promise<void> {
  await schedule(
    '📋 Itinerary updated',
    `"${title}" was added to the itinerary.`,
  );
}

/** Call after the voting tutorial is completed. Fires after a short delay. */
export async function notifyVotingReminder(): Promise<void> {
  await schedule(
    '🗳️ Time to vote!',
    "Your crew's activities are waiting — swipe to cast your votes.",
    10,
  );
}

/**
 * Schedules a "trip starting soon" notification for the morning of the trip start date.
 * Silently no-ops if the date has already passed.
 */
export async function scheduleTripStartNotification(
  tripName: string,
  startDateISO: string | null,
): Promise<void> {
  if (!startDateISO) return;
  const tripStart = new Date(startDateISO);
  // Fire at 8 am on the start date
  tripStart.setHours(8, 0, 0, 0);
  const secondsUntil = (tripStart.getTime() - Date.now()) / 1000;
  if (secondsUntil <= 0) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✈️ Trip starts today!',
      body: `"${tripName}" kicks off today. Have a great trip!`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: tripStart,
    },
  });
}
