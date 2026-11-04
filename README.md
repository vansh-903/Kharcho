# Kharcho (खर्चो) - Privacy-First Expense Tracker

<div align="center">
  <img src="docs/assets/kharcho-logo-concept.png" width="160" alt="Kharcho Logo" />
  <p><strong>Turn bank transaction SMS into private, actionable spending insights — 100% on-device.</strong></p>
  
  <p>
    <a href="https://github.com/vansh-903/Kharcho/actions/workflows/android-release.yml"><img src="https://github.com/vansh-903/Kharcho/actions/workflows/android-release.yml/badge.svg" alt="Build Status" /></a>
    <a href="https://github.com/vansh-903/Kharcho/releases"><img src="https://img.shields.io/github/v/release/vansh-903/Kharcho?color=2D5A3D&label=APK%20Download" alt="Download APK" /></a>
    <img src="https://img.shields.io/badge/Platform-Android-3DDC84?logo=android&logoColor=white" alt="Platform Android" />
    <img src="https://img.shields.io/badge/Privacy-100%25%20Offline-143825" alt="100% Offline" />
  </p>
</div>

---

## 🌟 Overview

**Kharcho** is a private, offline-first Android expense management application built with **React Native** and a custom **Kotlin native bridge**. It parses incoming and historical transaction SMS from Indian banks and UPI applications into a categorized financial dashboard without requiring bank credentials, cloud sync, or manual daily entries.

### Key Highlights
- **🔒 Privacy First & 100% Offline**: SMS parsing and expense records remain strictly on your device.
- **⚡ Deterministic Indian Bank Parser**: Supports SBI, HDFC, ICICI, Axis, Kotak, Bank of Baroda, PNB, Paytm, PhonePe, Google Pay, CRED, UPI Lite, and more.
- **🛡️ Noise Rejection**: Filters OTPs, loan promotions, collect requests, payment reminders, and balance-only inquiries.
- **💳 Discovered Accounts**: Automatically identifies cards and bank accounts from transaction SMS.
- **🎨 Warm Clay Aesthetic**: Custom 3D design system with gold coin hero assets, ambient drop shadows, and high-contrast typography.
- **🔄 Live SMS Tracking**: Real-time broadcast receiver updates transactions immediately as new bank SMS arrive.

---

## 📱 App Screenshots & Visual Design

The UI is designed according to the Kharcho Design Specification (`docs/DESIGN_SPEC.md`):
- **Welcome & Onboarding**: Floating 3D rupee coin with interactive orbit rings and bottom waves.
- **Dashboard**: Monthly summary card (Total Spent, Income, Net Balance) with quick month switcher.
- **Transactions**: Filter by category, payment method (UPI, Debit Card, Credit Card, Bank Transfer, Cash), date grouping, and detailed view.
- **Insights**: Category breakdown with donut visualizer and monthly spending trends.
- **Profile & Settings**: SMS import range switcher (Last 30 Days, 90 Days, All Time), discovered accounts list, privacy charter, and local data reset.

---

## 🛠️ Tech Stack

- **Framework**: React Native (0.76+) CLI with TypeScript
- **Native Android Module**: Kotlin (`SmsModule.kt`, `SmsReceiver.kt`) querying `Telephony.Sms.CONTENT_URI`
- **State Management**: React Context (`TransactionContext`)
- **Navigation**: Custom gesture-aware stack & bottom tab bar
- **Design System**: Warm Clay aesthetic (`#FAF7F0` canvas, `#143825` deep forest, `#2D5A3D` emerald, `#E58B68` coral)
- **Assets**: 3D renders with multi-density Android mipmaps (`ic_launcher`, `ic_launcher_round`, adaptive XML)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Android Studio](https://developer.android.com/studio) with Android SDK and command-line tools
- Java Development Kit (JDK 17+)
- Physical Android phone or emulator (Android 8.0+, API 26+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vansh-903/Kharcho.git
   cd Kharcho
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the Metro bundler:**
   ```bash
   npm start
   ```

4. **Run on Android Device:**
   Connect your physical Android phone with USB Debugging enabled, then in a new terminal:
   ```bash
   cd frontend
   npx react-native run-android
   ```
   Or via Gradle directly:
   ```bash
   cd frontend/android
   ./gradlew installDebug
   ```

5. **Grant SMS Permission:**
   When launching the app, allow SMS permissions to scan and auto-categorize your transaction SMS locally.

---

## 📦 Building a Release APK / AAB for Deployment

### 1. Automated via GitHub Actions (Recommended)
Every commit to `main` or release tag triggers the automated build pipeline in `.github/workflows/android-release.yml`. You can download the latest generated APK directly from the **[GitHub Actions Artifacts](https://github.com/vansh-903/Kharcho/actions)** or the **[Releases](https://github.com/vansh-903/Kharcho/releases)** tab.

### 2. Manual Local Build
To generate a standalone APK or Android App Bundle (AAB) on your development machine:

1. **Build Release APK:**
   ```bash
   cd frontend/android
   ./gradlew assembleRelease
   ```
   Output: `frontend/android/app/build/outputs/apk/release/app-release.apk`

2. **Build Release Android App Bundle (AAB for Google Play):**
   ```bash
   cd frontend/android
   ./gradlew bundleRelease
   ```
   Output: `frontend/android/app/build/outputs/bundle/release/app-release.aab`

---

## 📁 Repository Structure

```text
Kharcho/
├── .github/
│   └── workflows/
│       └── android-release.yml # Automated CI/CD APK & AAB builder
├── docs/
│   ├── assets/                 # Brand assets, 3D coin renders, storyboard
│   ├── PRD.md                  # Product Requirements Document
│   ├── TECHNICAL_SPEC.md       # Architecture & native bridge specs
│   └── DESIGN_SPEC.md          # Visual tokens, colors, typography
├── frontend/
│   ├── android/                # Native Android project (Kotlin)
│   │   └── app/src/main/
│   │       ├── java/com/kharcho/
│   │       │   ├── SmsModule.kt        # Native SMS query bridge
│   │       │   └── SmsReceiver.kt      # BroadcastReceiver for live SMS
│   │       └── res/                    # Mipmap app icons & drawables
│   ├── src/
│   │   ├── components/         # Reusable UI cards, buttons, tabs
│   │   ├── context/            # TransactionContext provider
│   │   ├── features/           # Dashboard, Transactions, Insights, Profile, Onboarding
│   │   ├── services/           # smsParser.ts (Deterministic Indian Bank Engine)
│   │   └── theme/              # Color palette, spacing, typography
│   └── package.json
├── backend/                    # Reserved for cloud sync & AI insights API
└── README.md
```

---

## 📄 License

MIT License. Free and open source for personal expense tracking.
