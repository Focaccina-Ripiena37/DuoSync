# **App Name**: DuoSync

## Core Features:

- User Authentication: Secure login via email and password using Firebase Authentication. Restrict access to two pre-defined users.
- Shared Calendar: Add, modify, and delete events. Each event includes a title, date, and description. Data is stored in Firestore's 'calendar' collection, shared between the two users.
- Shared Wishlist: Add, modify, mark as 'bought', or delete items. Each item includes a name, optional description, and status (e.g., 'to buy'). Data is stored in Firestore's 'wishlist' collection.
- Welcome Message: Display a personalized greeting message 'Ciao <nome_utente>' after login.
- Firestore Security Rules: Implement Firestore security rules to allow read/write access only to the two specific user IDs.
- Mobile-Friendly UI: A responsive user interface optimized for mobile devices and suitable for saving as a shortcut app on smartphones.

## Style Guidelines:

- Primary color: Soft Lavender (#E6E6FA) to represent a calming and shared space.
- Background color: Light Gray (#F5F5F5), providing a neutral and clean backdrop.
- Accent color: Pale Green (#98FF98) for highlighting interactive elements like CTAs and checked wishlist items.
- Body and headline font: 'PT Sans' for a modern and warm user experience.
- Simple and clear layout with a navbar for easy navigation between the Calendar and Wishlist sections.
- Use minimalistic icons for calendar events and wishlist items.
- Subtle transition animations between sections to enhance user experience.