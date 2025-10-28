# iOS Setup Guide for PalPalette

## Prerequisites

- macOS with Xcode installed (latest version recommended)
- Apple Developer Account (for Push Notifications and deployment)
- CocoaPods installed (`sudo gem install cocoapods`)

## Initial Setup

### 1. Install iOS Platform Dependencies

```bash
cd ios/App
pod install
```

This will install all Capacitor plugins defined in the Podfile.

---

## Push Notifications Setup

### Step 1: Apple Push Notification Service (APNs) Configuration

#### 1.1 Create an APNs Key in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click on **Keys** in the sidebar
4. Click the **+** button to create a new key
5. Enter a Key Name (e.g., "PalPalette Push Notifications")
6. Check **Apple Push Notifications service (APNs)**
7. Click **Continue** and then **Register**
8. **Download the .p8 file** - You can only download this once!
9. Note down:
   - **Key ID** (displayed on the key details page)
   - **Team ID** (found in the top-right corner of the developer portal)

#### 1.2 Configure App ID

1. In Apple Developer Portal, go to **Identifiers**
2. Find or create your App ID: `com.palpalette.app`
3. Ensure **Push Notifications** capability is enabled
4. Click **Save**

### Step 2: Firebase Console Configuration for iOS

#### 2.1 Add iOS App to Firebase Project

1. Go to [Firebase Console](https://console.firebase.com/)
2. Select your project (the same one used for Android)
3. Click **Add app** → Select **iOS**
4. Enter Bundle ID: `com.palpalette.app`
5. Enter App nickname: `PalPalette iOS`
6. Download `GoogleService-Info.plist`

#### 2.2 Add GoogleService-Info.plist to Xcode

1. Open Xcode: `open ios/App/App.xcworkspace`
2. In Xcode, right-click on the `App` folder in the project navigator
3. Select **Add Files to "App"...**
4. Navigate to and select `GoogleService-Info.plist`
5. ✅ **Important:** Check "Copy items if needed"
6. ✅ **Important:** Ensure the file is added to the "App" target

**File should be located at:** `ios/App/App/GoogleService-Info.plist`

#### 2.3 Upload APNs Key to Firebase

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Select the **Cloud Messaging** tab
3. Scroll to **Apple app configuration**
4. Under **APNs Authentication Key**, click **Upload**
5. Upload the `.p8` file you downloaded earlier
6. Enter your **Key ID** and **Team ID**
7. Click **Upload**

### Step 3: Xcode Project Configuration

#### 3.1 Enable Push Notifications Capability

1. Open Xcode: `open ios/App/App.xcworkspace`
2. Select the **App** target
3. Go to **Signing & Capabilities** tab
4. Click **+ Capability**
5. Add **Push Notifications**
6. Add **Background Modes**
7. Under Background Modes, check:
   - ✅ **Remote notifications**

#### 3.2 Configure Signing

1. In **Signing & Capabilities** tab
2. Select your **Team** (Apple Developer Account)
3. Choose **Automatically manage signing** (recommended)
4. Ensure the Bundle Identifier is: `com.palpalette.app`

---

## Camera Permissions (Already Configured)

The following permissions have been added to `Info.plist`:

- ✅ **NSCameraUsageDescription** - Camera access for color capture
- ✅ **NSPhotoLibraryUsageDescription** - Photo library access for color extraction
- ✅ **NSPhotoLibraryAddUsageDescription** - Save color palettes to photo library

---

## Building and Running

### Development Build

```bash
# From project root
npm run cap:run:ios:dev
```

Or manually:

```bash
# Build the web assets
npm run build:dev

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

Then in Xcode:

1. Select a simulator or connected device
2. Click the **Run** button (or press ⌘R)

### Testing Push Notifications

#### On Physical Device (Required for APNS)

⚠️ **Important:** Push notifications do NOT work on iOS Simulators. You MUST test on a real device.

1. Connect your iPhone/iPad via USB
2. In Xcode, select your device from the device dropdown
3. Run the app
4. Accept push notification permission when prompted
5. Check the app logs for the FCM token
6. Use Firebase Console to send a test notification

#### Send Test Notification from Firebase

1. Go to Firebase Console → **Messaging**
2. Click **Send your first message**
3. Enter title and message
4. Click **Next**
5. Select target: Choose **FCM registration token**
6. Paste the token from your app logs
7. Click **Test**

---

## Production Build

### Step 1: Create Archive

1. In Xcode, select **Any iOS Device (arm64)** as the build target
2. Go to **Product** → **Archive**
3. Wait for the archive to complete

### Step 2: Distribute to App Store / TestFlight

1. In the Archives window, select your archive
2. Click **Distribute App**
3. Choose distribution method:
   - **App Store Connect** (for TestFlight or App Store release)
   - **Ad Hoc** (for limited device testing)
   - **Enterprise** (if you have Enterprise account)
4. Follow the prompts to upload

---

## Common Issues & Troubleshooting

### Issue: Pod Install Fails

**Solution:**

```bash
cd ios/App
pod repo update
pod install
```

### Issue: Push Notifications Not Received

**Checklist:**

- ✅ Testing on a physical device (not simulator)
- ✅ Push Notifications capability enabled in Xcode
- ✅ Background Modes → Remote notifications enabled
- ✅ GoogleService-Info.plist added to Xcode project
- ✅ APNs key uploaded to Firebase
- ✅ App has permission to receive notifications
- ✅ FCM token successfully registered

**Debug Steps:**

1. Check Xcode console for registration errors
2. Verify FCM token is being sent to backend
3. Try sending test notification from Firebase Console
4. Check Firebase Console → Cloud Messaging → Send logs

### Issue: Camera Permission Denied

**Solution:**

- Check that usage descriptions are in Info.plist
- On device: Settings → PalPalette → Enable Camera access

### Issue: Code Signing Error

**Solution:**

1. In Xcode, go to **Signing & Capabilities**
2. Select your Team
3. Try toggling "Automatically manage signing" off and on
4. Clean build folder: Product → Clean Build Folder (⇧⌘K)

### Issue: Build Number Conflicts

**Solution:**

- Increment the build number in Xcode:
  - Select App target → General → Build (increment the number)

---

## Sync Changes from Web to iOS

After making changes to your web app:

```bash
# Build and sync
npm run build && npx cap sync ios

# Or use the combined script
npm run cap:sync:ios
```

---

## Useful Commands

```bash
# Open iOS project in Xcode
npx cap open ios

# Sync web assets to iOS
npx cap sync ios

# Update Capacitor plugins
npx cap update ios

# Run on iOS device/simulator
npm run cap:run:ios

# Check Capacitor doctor
npx cap doctor ios
```

---

## Project Structure

```
ios/
├── App/
│   ├── App/
│   │   ├── AppDelegate.swift         # App lifecycle & push notifications
│   │   ├── Info.plist               # Permissions & configuration
│   │   ├── GoogleService-Info.plist # Firebase config (ADD THIS)
│   │   └── Assets.xcassets/         # App icons & splash screens
│   ├── App.xcodeproj/
│   ├── App.xcworkspace/             # Open this in Xcode
│   └── Podfile                      # CocoaPods dependencies
└── .gitignore
```

---

## Next Steps

1. ✅ Install dependencies: `cd ios/App && pod install`
2. ✅ Download `GoogleService-Info.plist` from Firebase
3. ✅ Add `GoogleService-Info.plist` to Xcode project
4. ✅ Create APNs key in Apple Developer Portal
5. ✅ Upload APNs key to Firebase Console
6. ✅ Enable Push Notifications capability in Xcode
7. ✅ Configure signing with your Apple Developer account
8. 🚀 Build and test on a physical device

---

## Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging for iOS](https://firebase.google.com/docs/cloud-messaging/ios/client)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
