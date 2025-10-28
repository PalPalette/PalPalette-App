# iOS Setup Checklist

Use this checklist to ensure you've completed all necessary steps for iOS deployment.

## ✅ Initial Setup

- [ ] Install CocoaPods: `sudo gem install cocoapods`
- [ ] Install iOS dependencies: `cd ios/App && pod install`
- [ ] Open project in Xcode: `npx cap open ios`

## ✅ Firebase Configuration

- [ ] Download `GoogleService-Info.plist` from Firebase Console
- [ ] Add `GoogleService-Info.plist` to Xcode project
  - Right-click `App` folder → Add Files to "App"
  - ✅ Check "Copy items if needed"
  - ✅ Ensure it's added to "App" target
- [ ] File is located at: `ios/App/App/GoogleService-Info.plist`

## ✅ Apple Developer Portal Setup

- [ ] Create/verify App ID: `com.palpalette.app`
- [ ] Enable Push Notifications capability on App ID
- [ ] Create APNs Authentication Key (.p8 file)
- [ ] Note down Key ID and Team ID
- [ ] Upload APNs key to Firebase Console (Project Settings → Cloud Messaging)

## ✅ Xcode Configuration

- [ ] Open workspace: `ios/App/App.xcworkspace`
- [ ] Select "App" target
- [ ] Go to "Signing & Capabilities" tab
- [ ] Add "Push Notifications" capability
- [ ] Add "Background Modes" capability
- [ ] Enable "Remote notifications" in Background Modes
- [ ] Configure signing with your Apple Developer Team
- [ ] Verify Bundle Identifier: `com.palpalette.app`

## ✅ Permissions (Already Configured)

These are already added to Info.plist:

- ✅ NSCameraUsageDescription
- ✅ NSPhotoLibraryUsageDescription
- ✅ NSPhotoLibraryAddUsageDescription
- ✅ UIBackgroundModes (remote-notification)

## ✅ Code Configuration (Already Done)

- ✅ AppDelegate.swift updated with push notification handlers
- ✅ Info.plist updated with permissions
- ✅ Podfile includes CapacitorPushNotifications

## ✅ Testing

- [ ] Connect physical iOS device (push notifications don't work on simulator!)
- [ ] Build and run app: `npm run cap:run:ios`
- [ ] Accept push notification permission when prompted
- [ ] Verify FCM token is logged in Xcode console
- [ ] Send test notification from Firebase Console
- [ ] Verify notification is received

## ✅ Before App Store Submission

- [ ] Update app version and build number
- [ ] Add app icons (all required sizes)
- [ ] Add launch screen
- [ ] Test on multiple iOS versions and devices
- [ ] Review App Store Guidelines compliance
- [ ] Create App Store listing in App Store Connect
- [ ] Create archive: Product → Archive
- [ ] Upload to App Store Connect

## Common Commands

```bash
# Install iOS dependencies
cd ios/App && pod install

# Open in Xcode
npx cap open ios

# Sync web changes to iOS
npm run build && npx cap sync ios

# Run on iOS device/simulator
npm run cap:run:ios

# Run with development config
npm run cap:run:ios:dev
```

## Troubleshooting

If you encounter issues, see the detailed [iOS Setup Guide](./iOS-Setup-Guide.md) for solutions.

### Quick Fixes

**Push notifications not working:**

- Testing on physical device? (Required!)
- Capabilities enabled in Xcode?
- GoogleService-Info.plist added to project?
- APNs key uploaded to Firebase?

**Pod install fails:**

```bash
cd ios/App
pod repo update
pod install
```

**Code signing issues:**

- Check Team is selected in Signing & Capabilities
- Try toggling "Automatically manage signing"
- Clean build folder: ⇧⌘K

---

For detailed instructions, see [iOS-Setup-Guide.md](./iOS-Setup-Guide.md)
