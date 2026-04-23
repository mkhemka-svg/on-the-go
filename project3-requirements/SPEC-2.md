**App Specification**

**Overview:** Brief description of the app, its purpose, and target audience.

The app is called On the GO, and it is an all-in-one travel app. The purpose of this app is to make group travel planning easy and hassle-free. Group travel planning often takes a significant amount of time and energy, and it is very difficult to ensure every person's individual preferences are taken into account. On the GO\! has an immersive voting feature that allows each member of the group to vote on activities, restaurants, and which attractions the group will visit during the trip. The aim is to increase customer satisfaction on the trip by allowing users to plan and decide on what they want to do at their own time. The target audience for this app includes college students as well as young professionals who are interested in traveling in a group for leisure travel. Types of trips could include anything from summer vacation to bachelorette parties to spring break trips to ski excursions.

**Core Features:** List the main features of the app.

**1\. Authentication**

* Sign in or sign up via email  
* Continue with Google or Apple

**2\. Trip Creation (3 step flow)**

* Step 1: Set trip name and dates  
* Step 2: Invite crew via trip code or email  
*   
* Step 3: Choose destination from trending list or custom input

**3\. Trip Management**

* View all saved trips  
* Each trip shows destination photo, name, location and date range  
* Create new trips from the home screen

**4\. Itinerary**

* Add activities manually (title, description, date, time)  
* Attach files or photos of any previous itinerary   
* Expand activities to see full details  
* View scheduled activities in a day view calendar

**5\. Voting**

* Swipe right to like an activity  
* Swipe left to dislike  
* Swipe up to skip  
* First time tutorial explaining the swipe mechanic  
* Completion screen when all activities have been voted on

**6\. Calendar**

* Monthly calendar view  
* Tap a date to see scheduled activities for that day  
* Activities displayed as time blocks reflecting duration

**7\. Invite**

* Share auto-generated trip code with crew  
* Invite collaborators by email  
* View current trip members

**8\. Profile**

* View trip stats (trips taken, hours saved)  
* Access past trips via Memory Lane  
* Account settings, help, privacy, log out

**User Roles:** Define the types of users and their permissions.

| Role | Description | Permissions |
| ----- | ----- | ----- |
| Trip Creator | The user who creates a trip | Create and delete trips, generate trip code, invite crew, add/edit/delete itinerary items, view calendar, vote on activities, can give Collaborators abilities only he/she has at first |
| Collaborator | A user who joins a trip via trip code or email invite | View trip details, add itinerary items, vote on activities, view calendar, invite additional crew members |
| Guest | A user who has downloaded the app but not yet signed in | Sign up, sign in via email/Google/Apple: no access to any trip features |

**Screens & Navigation:** Describe the main screens and how users navigate between them. 

**Build this to be responsive across all iPhone screen sizes using safe area insets and relative sizing, not fixed pixel values**

| Screen (as called in Figma) | Purpose  | Navigation |
| :---- | :---- | :---- |
| LoadingPage | Show the logo and name of our app | Comes on the screen as soon as user opens the app as a loading screen till the data in the app loads; how long the screen lasts is dependent on how strong the wifi connection is essentially  |
| SignInOrSignUpPage | Allows the user to either sign in an existing account or sign up i.e. create a new account on our app. The user can either enter their email or login / sign up via Google or Apple. Use an authentication API here which goes to the next page (not in the prototype) which asks for a verification code sent to the email or apple ID entered | Post the loading screen, this screen will immediately be shown and then the next screen (which is the “Choose new or saved trip” screen) will show up once any one of the Continue buttons are clicked and the verification code has been used to verify the user.  |
| ChooseNewOrSavedTripPage | Allow the user to check their correct profile i.e. add / edit their name and profile picture. Also allow the user to choose between two options / buttons: either “Create a new trip” where they can make a new trip or “Your Saved Trips” where they can view their past trips, especially if they have used the app to create a trip before. | This screen will pop up once the user has successfully signed in or signed up. After this screen, if the user clicks on their profile picture, they should be able to edit it or add a new one and if they click on the dynamic welcome text, they should be able to add a custom one or edit a previous one in the same screen. If the user clicks the “CreateNewTripCard”, then bring them to the “TripNameAndDatesPage”screen. If the user clicks the “SavedTripsCard”, then bring them to the “YourSavedTripsPage” page. |
| YourSavedTripsPage | Allows the user to view the trips they have already planned before as well as add a new trip via “AddNewTripInputField”. Enable a scrolling feature where users can view more trips as they go down, depending on whether there are more trips or not.  | If the user clicks “AddNewTripInputField”, navigate them to the “TripNameAndDatesStepOnePage”. If the user clicks on any “TripCard”, navigate them to that trip’s “YourItineraryPage”page. The user can now access the active navigation bar at the bottom called “BottomNavigationBar”. In this bar, if you click on "ItineraryTabIcon", it will lead you to the "YourItineraryPage". If you click on “CalendarTabIcon”, it will lead you to the "CalendarPage". If you click on “VotingTabIcon”, it will lead you to the "VoteOnActivityPage" or “VotingTutorial1Page” based on whether the user is using the voting feature for the first time or not.  If you click on “InviteTabIcon”, it will lead you to the "InviteMoreCrewPage". If you click on “ProfileTabIcon”, it will lead you to the "ProfilePage". ***"The BottomNavigationBar has 5 tabs: Trips, Itinerary, Voting, Calendar, and Invite. Each tab has an active state (yellow label \+ underline indicator) and an inactive state (normal label, no underline). Build it as a reusable component with a dynamic active state based on the current screen."*** |
| TripNameAndDatesPage | This page is for us to get data on the name of the trip so it can be accurately displayed in “Saved Trips” later and for other possible purposes. This is also why it is a required field. We are also asking for the “Start Date” and “End Date” of the trip but this is not a required field, in case the group hasn’t decided it yet. If we click on the  “Start Date” or if we click on the “End Date”, the text box will expand to show a calendar that allows users to pick a date i.e. year, month and day as either the start date or the end date of the trip.  | The user reaches this page when the “CreateNewTripCard” is clicked in the “ChooseNewOrSavedTripPage” screen. The user can go back to the “ChooseNewOrSavedTripPage” screen by pressing the “BackNavigationButton”  and move ahead to the “InviteCollaboratorsStepTwoPage” screen by pressing the “NextNavigationButton”.  |
| InviteCollaboratorsStepTwoPage | This screen will allow users to add new members to their trip, either by sharing a dynamically generated trip code present in “TripCodeValueText”. “TripCodeValueText” should be auto-generated by the app and is not manually entered by the user. As for via email, the user can invite users by sending them an invitation via email. The “Collaborators Row” displays all the people that have already been added and there will be a scrolling horizontally option where “CollaboratorAvatarIcon” and “DynamicCollaboratorNameText” keep getting added based on the number of people the user adds. The “CollaboratorAvatarIcon” and “DynamicCollaboratorNameText” are dynamic since they change based on different users / members that the primary user is adding. | The user reaches this page when the “NextNavigationButton” is clicked in the “TripNameAndDatesStepOnePage” screen. The user can go back to the “TripNameAndDatesStepOnePage” screen by pressing the “BackNavigationButton”  and move ahead to the “ChooseDestinationPageStepThree” screen by pressing the “NextNavigationButton”.  |
| ChooseDestinationPageStepThree | This will allow users to pick the destination of their trip. They can either add it using “CustomDestinationInputField” or scroll down in the “TrendingDestinationsGrid” to find a destination they want to go to. “TrendingDestinationsGrid” will have an unlimited vertical scroll. | The user reaches this page when the “NextNavigationButton” is clicked in the “InviteCollaboratorsStepTwoPage” screen. The user can go back to the “InviteCollaboratorsStepTwoPage” screen by pressing the “BackNavigationButton”  and move ahead to the “YourItineraryPage” screen by pressing the “NextNavigationButton”.  |
| YourItineraryPage | This page allows the user to attach an itinerary if they already have one via the “AttachButton” button. Implement a feature such that all the items / activities that are mentioned in the  itinerary attached are then displayed in the “ItineraryItemsList” i.e. they show up on the “ItineraryItemsList”. This list contains a list of all the items that will be voted on in the “VoteOnActivityPage” page. A user can also custom add an item to be voted on using the “AddItineraryItemInputField” field. Also implement a vertical scroll feature so users can view more activities / items to be voted on when they scroll down. | The user reaches this page when the “NextNavigationButton” is clicked in the “ChooseDestinationPageStep Three” screen.  “AttachItineraryPage” is not a separate page. If you click on “AttachButton”, a pop-up should show up that asks the user to choose between uploading a file or taking a photo, as represented in “AttachItineraryPage”. Once an image of an itinerary is uploaded, interpret the items that the itinerary has and add them to the ItineraryItemsList using an API, if needed. “ItineraryExpandItemPage” is not a separate page. It is “YourItineraryPage” with one “ItineraryItemCard” expanded, depending on whoever one was clicked by the user. Build “ItineraryItemCard” with two states: collapsed (shows only the item title) and expanded (shows title, description, and scheduled time). Tapping a card toggles between collapsed and expanded states. The “ItineraryItemDescription” and “ItineraryItemTitle” in “ItineraryExpandItemPage” are both dynamic.  “ItineraryExpandItemPage” is not a separate page. “ItineraryManuallyAddItemPage” is “YourItineraryPage” with the “AddActivityFormCard” overlaying the list. The form appears when the user taps the add item input field and dismisses when submitted or cancelled. The purpose of this is to let the user manually add an item to be voted on. The user can now access the active navigation bar at the bottom called “BottomNavigationBar”. In this bar, if you click on "ItineraryTabIcon", it will lead you to the "YourItineraryPage". If you click on “CalendarTabIcon”, it will lead you to the "CalendarPage". If you click on “VotingTabIcon”, it will lead you to the "VoteOnActivityPage" or “VotingTutorial1Page” based on whether the user is using the voting feature for the first time or not.  If you click on “InviteTabIcon”, it will lead you to the "InviteMoreCrewPage". If you click on “ProfileTabIcon”, it will lead you to the "ProfilePage". |
| CalendarPage | CalendarImage is a placeholder image in Figma. Do not try to recreate the calendar from the image. Instead build a fully interactive native calendar component from scratch with month navigation, dynamic date display, and a yellow highlighted indicator for the selected date. Use a standard React Native calendar library such as react-native-calendars to implement this. | The user reaches the CalendarPage by clicking the “CalendarTabIcon” in the “BottomNavigationBar”.  The user can now access the active navigation bar at the bottom called “BottomNavigationBar”. In this bar, if you click on "ItineraryTabIcon", it will lead you to the "YourItineraryPage". If you click on “CalendarTabIcon”, it will lead you to the "CalendarPage". If you click on “VotingTabIcon”, it will lead you to the "VoteOnActivityPage" or “VotingTutorial1Page” based on whether the user is using the voting feature for the first time or not.  If you click on “InviteTabIcon”, it will lead you to the "InviteMoreCrewPage". If you click on “ProfileTabIcon”, it will lead you to the "ProfilePage".  |
| CalendarAddingActivityPage | CalendarAddingActivityPage is the day view that appears when a date is tapped on CalendarPage. It shows an hourly timeline with CalendarActivityBlocks positioned and sized according to their scheduled start time and duration from the itinerary. CalendarActivityBlock height should reflect the duration of the activity. For example, a day trip to Newport spans multiple hours while Dinner at Strega is shorter. This view is dynamic and pulls activity data from the itinerary. Allow the user to switch from a daily to a weekly view. The weekly view allows the user to drag and drop items between the days. In day only view allows the swipe left and right between days.  | The user reaches the CalendarAddingActivityPage by clicking a  “CalendarSelectedDayIndicator” in the “CalendarOuterContainer” of CalendarPage from the previous screen.  The user can now access the active navigation bar at the bottom called “BottomNavigationBar”. In this bar, if you click on "ItineraryTabIcon", it will lead you to the "YourItineraryPage". If you click on “CalendarTabIcon”, it will lead you to the "CalendarPage". If you click on “VotingTabIcon”, it will lead you to the "VoteOnActivityPage" or “VotingTutorial1Page” based on whether the user is using the voting feature for the first time or not.  If you click on “InviteTabIcon”, it will lead you to the "InviteMoreCrewPage". If you click on “ProfileTabIcon”, it will lead you to the "ProfilePage".  |
| VotingTutorial1Page | VotingTutorial1Page is a tutorial overlay shown the first time a user enters the voting feature. It teaches the swipe mechanic: swipe right to like an activity, swipe left to dislike.  | This page is reached when the user clicks the “VotingTabIcon” in the “BottomNavigationBar”. Clicking or hovering over this screen will soon lead to the next screen “VotingTutorial2Page”. Build the voting screen as one component where the tutorial overlay is conditionally visible only on the user's first visit, then never shown again. If you click the “BackButton”, you will go to the YourItineraryPage.  |
| VotingTutorial2Page  | VotingTutorial2Page is the second tutorial screen shown immediately after VotingTutorial1Page on the user's first visit. It teaches the swipe up mechanic to skip an activity. | Add this as a second step in the tutorial overlay sequence: Tutorial 1 shows first, then Tutorial 2, then the actual voting begins on “VoteOnActivityPage”. After completing both tutorials once, neither is shown again. If you click the “BackButton”, you will go to the YourItineraryPage.  |
| VoteOnActivityPage | The actual voting screen works identically but without the tutorial overlay elements (SwipeDividerLine, SwipeLeftArrow, SwipeRightArrow, SwipeLeftLabel, SwipeRightLabel, DislikeIcon, LikeIcon).  The user swipes right to like, left to dislike, and up to skip: these gestures are the core interaction and must be implemented as swipe gestures, not buttons. ActivityBackgroundImage fills the entire screen and changes with each activity. ActivityInfoCard sits at the bottom of the screen and shows the activity name and a ReadMoreButton that expands to show the full activity description in “ActivityDescriptionExpandedPage”.   | VoteOnActivityPage is the actual voting screen shown after both tutorials are complete. This will have a horizontal scroll capability and each new scroll will reveal the title of a new activity on the “ItineraryItemsList” and a relevant picture with it. The user can then choose what action to respond with. We have to use some API that pulls the relevant picture from the internet for each activity based on the destination of the trip (found and stored in “ChooseDestinationPageStepThree” and the title of the activity i.e. ActivityNameLabel. ActivityDescriptionExpandedPage is not a separate page. It is VoteOnActivityPage with ActivityInfoCard expanded after the user taps ReadMoreButton. The card grows upward to reveal ActivityDescriptionText beneath the activity name. Tapping anywhere outside the card or a close gesture collapses it back to the default state. Do not build this as a separate screen : build it as an expanded state of ActivityInfoCard within VoteOnActivityPage. After voting on all activities, navigate to the “AllActivitiesVotedPage” screen.  If you click the “BackButton”, you will go to the YourItineraryPage. If you click the “BackButton”, you will go to the YourItineraryPage. |
| AllActivitiesVotedPage | AllActivitiesVotedPage is shown when the user has finished voting on all available activities. This screen should only appear when there are no remaining unvoted activities. GoToItineraryHintText and GoToItineraryArrow form a visual hint pointing down to the Itinerary tab in BottomNavigationBar, nudging the user to add more activities. Tapping the arrow or the hint text should navigate directly to YourItineraryPage.  | This screen should only appear when there are no remaining unvoted activities. The user can now access the active navigation bar at the bottom called “BottomNavigationBar”. In this bar, if you click on "ItineraryTabIcon", it will lead you to the "YourItineraryPage". If you click on “CalendarTabIcon”, it will lead you to the "CalendarPage". If you click on “VotingTabIcon”, it will lead you to the "VoteOnActivityPage" or “VotingTutorial1Page” based on whether the user is using the voting feature for the first time or not.  If you click on “InviteTabIcon”, it will lead you to the "InviteMoreCrewPage". If you click on “ProfileTabIcon”, it will lead you to the "ProfilePage".  |
| InviteMoreCrewPage | InviteMoreCrewPage is the post-onboarding version of InviteCollaboratorsPage, accessible from the Invite tab in BottomNavigationBar. It has no stepper, adds a UserProfileAvatarIcon in the top right, and uses the same TripCode and email invite functionality. Build it by reusing the same invite components from InviteCollaboratorsPage rather than duplicating the code. | The user can now access the active navigation bar at the bottom called “BottomNavigationBar”. In this bar, if you click on "ItineraryTabIcon", it will lead you to the "YourItineraryPage". If you click on “CalendarTabIcon”, it will lead you to the "CalendarPage". If you click on “VotingTabIcon”, it will lead you to the "VoteOnActivityPage" or “VotingTutorial1Page” based on whether the user is using the voting feature for the first time or not.  If you click on “InviteTabIcon”, it will lead you to the "InviteMoreCrewPage". If you click on “ProfileTabIcon”, it will lead you to the "ProfilePage". |
| ProfilePage | The UserStatsCard gives important user stats like their last saved image and name, updated number of saved trips and hours saved. The PastTripsButton allows users to go to the “YourSavedTripsPage” to revisit and review their saved trips. SettingsMenuCardImage is a placeholder image copied from Airbnb. Do not try to recreate it from the image. Instead build a proper settings menu list from scratch with the following items in this exact order: Account Settings (with a red notification dot on the icon), Get Help, View Profile, Privacy, and Log Out. Each row except Log Out should have a right chevron arrow. Use a standard React Native list component to implement this. Tapping each row navigates to its respective screen.  | The PastTripsButton navigates users to their saved trips. The user can now access the active navigation bar at the bottom called “BottomNavigationBar”. In this bar, if you click on "ItineraryTabIcon", it will lead you to the "YourItineraryPage". If you click on “CalendarTabIcon”, it will lead you to the "CalendarPage". If you click on “VotingTabIcon”, it will lead you to the "VoteOnActivityPage" or “VotingTutorial1Page” based on whether the user is using the voting feature for the first time or not.  If you click on “InviteTabIcon”, it will lead you to the "InviteMoreCrewPage". If you click on “ProfileTabIcon”, it will lead you to the "ProfilePage".  |

**Data Model:** Define the key entities and their relationships. 

### **User**

* id: string  
* email: string  
* name: string  
* avatarUrl: string  
* provider: enum (email, google, apple)  
* createdAt: timestamp

### **Trip**

* id: string  
* name: string  
* destinationId: string  
* startDate: date  
* endDate: date  
* tripCode: string  
* creatorId: string (ref → User)  
* coverImageUrl: string  
* createdAt: timestamp

### **TripMember**

* id: string  
* tripId: string (ref → Trip)  
* userId: string (ref → User)  
* role: enum (creator, collaborator)  
* joinedAt: timestamp

### **ItineraryItem**

* id: string  
* tripId: string (ref → Trip)  
* createdBy: string (ref → User)  
* title: string  
* description: string  
* scheduledDate: date  
* scheduledTime: time  
* attachmentUrl: string  
* createdAt: timestamp

### **Vote**

* id: string  
* itineraryItemId: string (ref → ItineraryItem)  
* userId: string (ref → User)  
* value: enum (like, dislike, skip)  
* createdAt: timestamp

### **Destination**

* id: string  
* name: string  
* country: string  
* imageUrl: string  
* isTrending: boolean

### **Invite**

* id: string  
* tripId: string (ref → Trip)  
* invitedBy: string (ref → User)  
* email: string  
* status: enum (pending, accepted, declined)  
* createdAt: timestamp

**Relationships summary:**

* A **User** can create many **Trips**  
* A **Trip** has many **TripMembers** (users)  
* A **Trip** has many **ItineraryItems**  
* An **ItineraryItem** has many **Votes** (one per user)  
* A **Trip** has one **Destination**  
* A **Trip** can have many pending **Invites**

**API & Backend**: Describe external APIs, backend services, or Expo API routes used.

**Authentication:**

* **Expo Auth Session** and **Supabase Auth** : handles email/password, Google and Apple sign in out of the box, which matches your three sign in options exactly

**Database:**

* **Supabase** (PostgreSQL) for some functions because it works with Supabase Auth, has real-time subscriptions (useful for live voting and collaborator updates) and has a generous free tier to get started. Add Vercel serverless functions for custom backend logic like email invites, push notification triggers, complex voting and trip code generation.

**Third-party APIs:**

* **Google Places API**: for destination search and location data on the Choose Destination screen (especially for “Top 10 Trending”)  
* **Unsplash API** or **Google Places Photos API**: for destination cover images on the Trending Destinations grid and Trip Cards for each trip  
* **Apple Calendar API / Expo Calendar / Google Calendar API**: to optionally sync trip dates to the user’s native iPhone calendar and Google Calendar  
* **Expo Camera**: for the Take Photo option in the itinerary attach flow  
* **Expo Document Picker**: for the Upload File option in the itinerary attach flow  
* **Expo Notifications**: for notifying collaborators when new itinerary items are added or votes are in  
* **react-native-calendars**: for the calendar screen as discussed in the “Screens & Navigation” section

**Design & Branding**

**Color Palette:**

* **Primary Blue:** `#76b9ff`: the main background blue used across all screens  
* **Dark Navy Blue:** `##1d5abc`: used for buttons, itinerary item cards, navigation icons  
* **Yellowish-Gold:** `#febd19`: used for active states  
* **Light-yellow:**  `#fef3b3`: used for borders, highlighted stepper circles  
* **White:** `#FFFFFF:` cards, input fields, modal backgrounds, some text elements  
* **Black:** `#000000`: the Continue button on sign in screen, some text elements  
* **Light Gray:** `#828282`: some supporting text, input fields examples   
* **Red:** `#E53935`: dislike icon in voting  
* **Green:** `#43A047`: like icon in voting

**Typography:**

* **Font for “On the GO\!” logo:** Acme  
* **Font for text:** Merriweather  
* **App Logo/Title:** Bold serif or display font : “On the GO\!” has a heavy weighted style  
* **Headings:** Bold, large, dark; used for page titles like “My Itinerary”, “Your Trips”  
* **Body Text:** Regular weight, (gray, black or white)  
* **Button Text:** Bold, white or black depending on button color  
* **Active Tab Label:** Bold, yellow `#febd19`

**Style Direction:**

* **Friendly and energetic**: rounded corners everywhere, bright blue palette, bold typography  
* **Card-based UI**: content is consistently grouped in white rounded cards  
* **High contrast**: dark elements on light blue, white text on dark blue buttons  
* **Playful but clean**: illustrated icons rather than flat minimal ones, slight shadows on cards

**Platform Targets**

The platform target is IOS. Our current Figma frame size is iPhone 13 mini (375 x 812px). **Target: all modern iPhones** \- want the app to display correctly across all sizes from iPhone SE up to iPhone 17 Pro Max.  Build this to be responsive across all iPhone screen sizes using safe area insets and relative sizing, not fixed pixel values

**Notifications & Background Tasks:** Push notifications, scheduled tasks, background sync, etc. 

Push notifications for the app include reminders before all upcoming activities scheduled in the calendar. There will be a notification when a new collaborator has joined the trip. There will be scheduled tasks as well such as reminding people to vote, nudging people who have not voted yet as well as sending itinerary reminders before flights. The app will also have background sync such as syncing new votes, syncing calendar changes as well as updating any itinerary changes.

**Push Notifications:**

* **New collaborator joined**: notify Trip Creator and existing members when someone joins via trip code or email invite  
* **New itinerary item added** : notify all trip members when someone adds an activity  
* **Voting reminder** : remind members who haven't voted yet on pending activities  
* **Trip starting soon** : reminder notification 24 hours before the trip start date  
* **Ownership transfer** : notify the new Trip Creator when ownership is transferred to them  
* **Invite accepted/declined** : notify the sender when their email invite gets a response

**Background Tasks:**

* **Trip code expiry check** : periodically check if trip codes need to be regenerated or expired  
* **Vote tally calculation** : recalculate voting results when all members have voted on an activity  
* **Calendar sync** : background sync of trip dates and itinerary items to the user's native iPhone calendar if they opt in

**Background Sync:**

* **Real-time collaborator updates** : sync itinerary changes across all members' devices instantly using Supabase real-time subscriptions  
* **Voting state sync** : keep voting results live across all members so everyone sees up to date vote counts  
* **New member sync** : update the collaborators list across all devices when someone new joins

**Tools to implement these:**

* **Expo Notifications** : for all push notifications  
* **Expo Task Manager** : for background tasks  
* **Expo Background Fetch** : for periodic background sync  
* **Supabase Realtime** : for live data sync across devices  
* **Vercel Cron Jobs** : for scheduled server side tasks like trip reminders


**Offline Behavior:** How the app should behave without network connectivity. 

Without network connectivity, users will be able to view their past and saved trips, view the itinerary as well as the calendar, however the user will not be able to make any changes or view any changes that other collaborators have made.

**What should work offline:**

* **View saved trips** : trips already loaded should be readable without connection  
* **View itinerary items** : previously loaded activities should be accessible  
* **View calendar** : already loaded trip dates and scheduled activities should display  
* **View collaborators list** : previously loaded member list should be visible  
* **View voting history** : activities already voted on should be viewable

**What should NOT work offline:**

* **Creating a new trip** : requires backend to generate trip code and save to database  
* **Joining a trip via code** : requires backend to validate the code  
* **Inviting collaborators** : requires backend and email service  
* **Adding itinerary items** : requires database write  
* **Voting on new activities** : requires real-time sync across all members  
* **Uploading attachments or photos** : requires storage service  
* **Signing in or signing up** : requires authentication service

**Offline UX Behavior:**

* Show a **"You're offline"** banner at the top of the screen when connectivity is lost  
* Disable interactive elements that require network with a **visual indicator** (grayed out)  
* When connectivity is restored, **automatically retry** any failed actions  
* Show **last synced timestamp** so users know how fresh their data is

**Data Caching Strategy:**

* Cache trip data, itinerary items, and collaborator lists locally on device using **Expo SecureStore** or **AsyncStorage**  
* Cache destination images so the trips screen loads smoothly offline  
* Clear cache when user logs out

**Tools to implement:**

* **AsyncStorage** : local data caching  
* **Expo NetInfo** : detect online/offline state  
* **React Query** : handles caching, background refetching and retry logic automatically

**Analytics & Monitoring: t**racking events, crash reporting, performance monitoring. 

**Analytics : User Event Tracking:**

Key events worth tracking:

* `user_signed_up` : with provider (email, Google, Apple)  
* `trip_created` : with destination and date range  
* `trip_joined` : via code or email invite  
* `itinerary_item_added` : manually or via attachment  
* `vote_cast` : with value (like, dislike, skip)  
* `all_activities_voted` : completion of voting session  
* `collaborator_invited` : via code or email  
* `past_trips_viewed` : Memory Lane feature usage  
* `notification_tapped` : which notification type

**Tools: Use Expo & PostHog**

* PostHog is open source, has a generous free tier, works well with React Native and gives you funnels, retention and session analytics

**Crash Reporting:**

* Capture crashes with full stack traces  
* Alert you immediately when something breaks in production  
* Track which device/iOS version caused the crash

**Tool: Sentry**

* Industry standard for React Native crash reporting  
* Has a free tier  
* Integrates with Expo in a few lines of code

**Performance Monitoring:**

* Track screen load times  
* Monitor API response times from Supabase  
* Detect slow voting and real-time sync performance

**Constraints & Non-Goals:** Known limitations, things explicitly out of scope, or technical constraints. 

**Constraints:**

* **iOS only (for now)** : Android and web are out of scope for the initial build  
* **iPhone only** : no iPad layout or optimization planned  
* **English only** : no multi-language or localization support  
* **Internet required for core features** : creating trips, voting, and inviting require active connection as defined in offline behavior  
* **One Trip Creator per trip** : only one owner, no co-creator role  
* **Supabase free tier limits** : 500MB database, 1GB storage, 50,000 monthly active users on free plan. Scaling will require a paid plan  
* **Expo managed workflow limitations** : some advanced native iOS features may require ejecting to bare workflow

**Non-Goals (explicitly out of scope):**

* **In-app messaging or group chat** : members communicate outside the app  
* **Payment splitting or expense tracking** : no financial features  
* **Flight or hotel booking** : app plans trips but does not book them  
* **Map view of destinations** : no interactive maps in v1  
* **Public trip sharing** : trips are private to invited members only  
* **Social features** : no following, likes, or public profiles  
* **Android app** : explicitly deferred to a future version  
* **Web app** : explicitly deferred to a future version  
* **Offline editing** : users can view but not create or edit without connection

**Technical Constraints:**

* **Figma frames built for iPhone 13 mini** : responsive handling must be done in code as discussed

**Open Questions:** Unresolved decisions or areas needing further research. 

* How long should the trip code be valid? **Does it expire** or is it permanent?


  
