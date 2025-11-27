# IronLog - Fitness & Strength Tracker PWA

A mobile-first, offline-capable fitness tracking application built with React, TypeScript, and Firebase.

## Features

- 🏋️ **Exercise Library**: Search, filter, and view details for exercises (synced from Firebase).
- 📝 **Workout Logging**: Log sets, reps, and weight. Calculate volume and PRs.
- 📊 **Progress Charts**: Visualize your strength gains over time.
- 📴 **Offline First**: Full functionality offline. Changes are queued and synced when online.
- ☁️ **Cloud Sync**: Secure data storage with Firebase Firestore.
- 📱 **PWA**: Installable on iOS, Android, and Desktop.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI**: Mantine v7
- **State/Query**: TanStack Query (React Query)
- **Database (Local)**: Dexie.js (IndexedDB)
- **Database (Cloud)**: Firebase Firestore
- **Auth**: Firebase Auth (Google)
- **Charts**: Recharts
- **Testing**: Vitest, React Testing Library

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workout-log
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Google Provider).
   - Enable **Firestore Database**.
   - Create a `.env` file in the root directory (or update `src/lib/firebase.ts` directly if preferred for dev):
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. **Run locally**
   ```bash
   npm run dev
   ```

## Architecture

The project follows a Clean Architecture inspired structure:

- `src/features`: Contains domain-specific logic and components (Auth, Exercises, Workouts).
- `src/services`: Core business logic and API services (Db, Queue, Sync).
- `src/hooks`: Custom React hooks for data access and state.
- `src/components`: Shared UI components.

### Offline Strategy

1. **Reads**: All data is read from **IndexedDB** (Dexie) via `useExercises` and `useWorkouts` hooks.
2. **Writes**: Writes are saved to IndexedDB immediately.
3. **Queue**: Critical actions (logging, syncing) are added to a persistent **Queue** in IndexedDB.
4. **Sync**: A `queueService` processes the queue when the app detects it is online, pushing changes to Firebase.

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy to Vercel, Netlify, or Firebase Hosting.

## Testing

Run unit tests:
```bash
npm test
```
