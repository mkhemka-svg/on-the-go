# About the app

## What your app does and why you chose this idea (1-2 sentences). 
The app is called On the GO, and it is an all-in-one travel app. The purpose of this app is to make group travel planning easy and hassle-free. Group travel planning often takes a significant amount of time and energy, and it is very difficult to ensure every person's individual preferences are taken into account. On the GO! has an immersive voting feature that allows each member of the group to vote on activities, restaurants, and which attractions the group will visit during the trip. The aim is to increase customer satisfaction on the trip by allowing users to plan and decide on what they want to do at their own time. I chose this idea because this is actually a startup I am building in the travel space.


## A description of each screen and what the user can do on it. 
1. LoadingPage: Show the logo and name of our app
2. SignInOrSignUpPage: Allows the user to either sign in an existing account or sign up i.e. create a new account on our app.
3. ChooseNewOrSavedTripPage: Allow the user to check their correct profile i.e. add / edit their name and profile picture.
4. YourSavedTripsPage: Allows the user to view the trips they have already planned before
5. TripNameAndDatesPage: This page is for us to get data on the name and start and end date of the trip so it can be accurately displayed in “Saved Trips” later and for other possible purposes.
6. InviteCollaboratorsStepTwoPage: This screen will allow users to add new members to their trip, either by sharing a dynamically generated trip code or by an email invite.
7. ChooseDestinationPageStepThree: This will allow users to pick the destination of their trip.
8. YourItineraryPage: This page allows the user to attach an itinerary if they already have one via the “AttachButton” button. Tapping an iteneary item toggles between collapsed and expanded states. The form to add another activity appears when the user taps the add item input field and dismisses when submitted or cancelled. 
9. CalendarPage: This shows the calendar to the user who can click on a date to see the items added for that date.
10. CalendarAddingActivityPage:  It shows an hourly timeline with CalendarActivityBlocks positioned and sized according to their scheduled start time and duration from the itinerary for a day.
11. VotingTutorial1Page: VotingTutorial1Page is a tutorial overlay shown the first time a user enters the voting feature. It teaches the swipe mechanic: swipe right to like an activity, swipe left to dislike.
12. VotingTutorial2Page: VotingTutorial2Page is the second tutorial screen shown immediately after VotingTutorial1Page on the user's first visit. It teaches the swipe up mechanic to skip an activity.
13. VoteOnActivityPage: The user swipes right to like, left to dislike, and up to skip for each activity as more activities keep showing up as you scroll down.
14. AllActivitiesVotedPage: AllActivitiesVotedPage is shown when the user has finished voting on all available activities. This screen should only appear when there are no remaining unvoted activities.
15. InviteMoreCrewPage: InviteMoreCrewPage is the post-onboarding version of InviteCollaboratorsPage, accessible from the Invite tab in BottomNavigationBar.
16. ProfilePage: The UserStatsCard gives important user stats like their last saved image and name, updated number of saved trips and hours saved. The PastTripsButton allows users to go to the “YourSavedTripsPage” to revisit and review their saved trips. There is also a settings menu list  with the following items in this exact order: Account Settings (with a red notification dot on the icon), Get Help, View Profile, Privacy, and Log Out. 


## How to set up and run the app (any extra dependencies or API keys needed). 
Based on everything we've built, here's the complete setup guide:

Prerequisites:
- Node.js (LTS version) — nodejs.org
- Expo CLI — npm install -g expo-cli
- Expo Go app on your iPhone (for testing)
- Apple Developer Account (for App Store submission)

Clone and Install:
git clone your-repo-url
cd OnTheGo
npm install

Extra Dependencies to Install:
npx expo install expo-secure-store
npx expo install expo-document-picker
npx expo install expo-camera
npx expo install expo-notifications
npx expo install expo-task-manager
npx expo install expo-background-fetch
npx expo install expo-calendar
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-calendars
npx expo install react-native-gesture-handler
npx expo install expo-net-info

API Keys Needed:
Create a .env file in the root of your project:
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_key
EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key


Where to get each key:
Supabase URL + Anon Key
Go to supabase.com → your project
Settings → API → copy Project URL and anon public key
Google Places API Key
Go to console.cloud.google.com
Create a project → Enable Places API
Credentials → Create API Key
Unsplash Access Key
Go to unsplash.com/developers
Create a new application
Copy the Access Key
Supabase Setup
bash

Run the App:
npx expo start

## One thing you learned about mobile development that surprised you. 
How every single feature has its own workflow and how to get all features to connect and for there to be data persistence, you need to have a very detailed and clear SPEC. Even having a very detailed SPEC, there were lots of bugs that I had to fix.
