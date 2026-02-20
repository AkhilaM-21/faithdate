# FaithDate - User Guide & Application Overview

## 📖 Introduction
FaithDate is a faith-based dating application designed to help users find meaningful relationships. It combines modern dating app mechanics (swiping, matching) with community features (prayer requests, discussions) to foster connections based on shared values.

---

## 📱 How to Use the App

### 1. Getting Started
*   **Registration**: Create an account using your email or use Social Login (Google, Facebook, Apple).
*   **Profile Setup**: You will be guided to build your profile:
    *   **Photos**: Upload up to **9 photos**. The first photo is your main profile picture.
    *   **Details**: Add your bio, job, education, and location.
    *   **Faith**: Specify your denomination (e.g., Catholic, Protestant) and church involvement level.
    *   **Preferences**: Set your age range, distance preference, and gender interest.

### 2. Discover (The Swipe Deck)
Navigate to the **Discover** tab to find potential matches.
*   **Mobile Gestures**:
    *   **Swipe Right**: Like (Free users have a daily limit of 10 likes).
    *   **Swipe Left**: Dislike (Pass).
    *   **Swipe Up**: View Full Profile details.
    *   **Double Tap**: Super Like (Show strong interest).
    *   **Single Tap**: Add to Favorites (Save for later).
    *   **Two-Finger Swipe Down**: Restore (Undo last swipe - Premium).
*   **Desktop Controls**:
    *   Use the action buttons below the card to Like, Dislike, Super Like, Favorite, or Restore.
    *   **Drag Up** with mouse to view Full Profile.
*   **Daily Streak**: Log in every day to build your streak and earn rewards.

### 3. Matches & Chat
*   **Matches**: When you like someone and they like you back, it's a Match! They will appear in the **Matches** tab.
*   **Chat**: Tap a match to start a conversation.
    *   **Real-time**: Messages are delivered instantly.
    *   **Media**: You can send GIFs. Sending **Photos** is a Premium feature.
    *   **Safety**: You can **Unmatch** or **Report** users directly from the chat menu.
*   **Who Liked Me**: See a list of people who have liked you before you swipe on them (Premium feature).

### 4. Community
The **Community** tab is a space to connect beyond dating.
*   **Post**: Share "Discussions", "Prayer Requests", or "Events".
*   **Interact**: Like and comment on posts from other users.

### 5. Profile & Verification
Go to the **Profile** tab to manage your identity.
*   **Edit**: Update your photos, bio, and interests.
*   **Verification**: Use the camera feature to take a selfie. The system compares it with your profile photos to give you a **Verified Badge**.
*   **Profile Views**: See who has viewed your profile (Premium feature).
*   **My Gallery**: A collection of your uploaded photos.

### 6. Account Settings
Access **Settings** from the Profile page.
*   **Visibility**: Toggle "Show me on FaithDate" to hide your profile from the Discover deck without deleting your account.
*   **Security**: Change your password or update your phone number (verified via OTP).
*   **Notifications**: Enable or disable push notifications for likes, matches, and messages.
*   **Delete Account**: Permanently remove your data.

### 7. Membership Plans & Rewards

#### Daily Streaks 🔥
*   **How it works**: Open the app every day to build your streak.
*   **Rewards**: Maintaining a streak unlocks daily rewards, such as a free **Super Like** to use on a special profile.
*   **Miss a day?**: Your streak resets to zero.

#### Membership Tiers

**Free Plan**
*   **Daily Likes**: 10 per day
*   **Super Likes**: 1 per day
*   **Rewind (Restore)**: Not included
*   **See Who Liked You**: Blurred
*   **Profile Views**: Count only
*   **Send Photos in Chat**: Not included

**Premium (Plus)**
*   **Daily Likes**: Unlimited
*   **Super Likes**: 5 per day
*   **Rewind (Restore)**: Unlimited
*   **See Who Liked You**: Not included
*   **Profile Views**: Full List
*   **Send Photos in Chat**: Included

**Gold Plan**
*   **Daily Likes**: Unlimited
*   **Super Likes**: 5 per day
*   **Rewind (Restore)**: Unlimited
*   **See Who Liked You**: Full List
*   **Profile Views**: Full List
*   **Send Photos in Chat**: Included

---

## ⚙️ How It Works (Technical Overview)

### Architecture
The application is built using the **MERN Stack**:
*   **Frontend**: React.js (Vite) with Tailwind CSS for styling.
*   **Backend**: Node.js with Express.
*   **Database**: MongoDB (Mongoose) for storing users, matches, messages, and posts.

### Key Logic
1.  **Matching Algorithm**:
    *   The `discover` endpoint filters users based on **Distance**, **Age Preference**, **Gender**, and **Faith**.
    *   It excludes users you have already liked or matched with.
    *   It prioritizes active users and those with a high "Desirability Score".
    *   **Match Score**: A percentage is calculated based on shared interests, denomination, and relationship goals.

2.  **Real-Time Chat**:
    *   Uses **Socket.io** to establish a WebSocket connection between the client and server.
    *   When a message is sent, it is saved to MongoDB and immediately emitted to the recipient if they are online.

3.  **Premium Features**:
    *   The backend checks the user's `subscriptionTier` or `isPremium` flag.
    *   **Limits**: Free users are limited to 10 likes per day. Premium users have unlimited swipes.
    *   **Gating**: Features like "Who Liked Me" and "Profile Views" return blurred or empty data for free users.

4.  **Security**:
    *   **JWT (JSON Web Tokens)**: Used for secure authentication.
    *   **CSRF Protection**: Checks origin headers on form submissions.
    *   **Content Safety**: (Stubbed) Logic to flag inappropriate keywords or images.
