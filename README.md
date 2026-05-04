# MoneyMeow

A personal finance management app with social features, built with React Native and Expo.

## Features

- **Transaction Tracking** -- Add, edit, and delete income/expense transactions with categories, notes, and date selection
- **Bank Connection** -- Link your bank account to auto-detect and sync transactions (simulated). Bank transactions appear in a separate section from manually created ones
- **Savings Goals (Heo Dat)** -- Create piggy bank savings goals, deposit and withdraw money between your bank and goals
- **Group Funds** -- Pool money with friends for shared goals, contribute, request withdrawals, and manage members
- **Friends & Messaging** -- Search and add friends by email, send/receive friend requests, real-time chat with message status tracking
- **Statistics** -- Visualize income vs. expense with pie charts and monthly line charts
- **CSV Export** -- Export all transactions to a downloadable CSV file
- **Customer Support (CSKH)** -- In-app chatbot that answers common questions, plus quick access to call or email support staff
- **Email Verification** -- Verification email sent on signup, with resend option in profile
- **Profile Management** -- View account info, bank connection status, email verification, and sign out

## Tech Stack

- **Framework:** React Native + Expo SDK 54
- **Language:** TypeScript
- **Routing:** Expo Router (file-based)
- **Auth & Database:** Firebase (Authentication + Firestore)
- **Charts:** react-native-chart-kit
- **Animations:** react-native-reanimated
- **Platforms:** iOS, Android, Web

## Project Structure

```
app/
  _layout.tsx          Root layout with auth-gated routing
  index.tsx            Home dashboard with transactions
  login.tsx            Login screen
  signup.tsx           Sign-up with email verification
  profile.tsx          User profile, bank connect, sign out
  add-transaction.tsx   Create/edit transactions
  HeoDat.tsx           Savings goals (piggy bank)
  GroupFunds.tsx       Group fund management
  AddFriends.tsx        Friend search and requests
  Messages.tsx          Chat conversations list + chat modal
  CSKH.tsx             Customer support chatbot
  statistics/
    index.tsx          Charts and analytics
  (tabs)/              Tab navigation (home, explore)
utils/
  auth.ts             Firebase auth helpers
  friendsUtils.ts     Friend request operations
  groupFundsUtils.ts  Group fund operations
  messageUtils.ts     Chat and messaging operations
  transactions.ts     Transaction CRUD
  goals.ts            Savings goal operations
firebase.js           Firebase config
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for auth and Firestore)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Update `firebase.js` with your Firebase project credentials.

### Running the App

```bash
# Start development server
npx expo start

# Run on specific platform
npx expo start --web
npx expo start --android
npx expo start --ios
```

### Build for Production

```bash
npx expo export --platform web
```

Output is generated in the `dist/` directory.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run web` | Start for web |
| `npm run android` | Start for Android |
| `npm run ios` | Start for iOS |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset to blank project |

## Firestore Data Model

```
users/{userId}
  email, displayName, friends[], friendRequests[]
  transactions/          (subcollection)
    amount, type, category, note, source, createdAt
  goals/                 (subcollection)
    name, targetAmount, currentAmount, createdAt
  bankAccount/           (subcollection)
    balance, createdAt

conversations/{conversationId}
  participants[], lastMessage, lastMessageTime, unreadCount

messages/{messageId}
  conversationId, senderId, receiverId, content, timestamp, read, status

groupFunds/{fundId}
  name, targetAmount, currentAmount, createdBy, members[], description

fundContributions/{contributionId}
  fundId, userId, amount, createdAt
```

## Deployment

### AWS Amplify Hosting

1. Build the static export: `npx expo export --platform web`
2. Connect your repo to AWS Amplify Console
3. Set build command: `npx expo export --platform web`
4. Set output directory: `dist`

### S3 + CloudFront

1. Build: `npx expo export --platform web`
2. Upload `dist/` contents to an S3 bucket with static hosting enabled
3. Add CloudFront distribution with the S3 bucket as origin
4. Configure error page to redirect to `index.html` for client-side routing

## License

Private
