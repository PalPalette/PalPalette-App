# Push Notifications Troubleshooting Guide

## Issue: Not receiving FCM test messages from Firebase Console

### Prerequisites Checklist

1. **✅ google-services.json is configured**

   - File exists at: `android/app/google-services.json`
   - Contains correct Firebase project configuration
   - Project ID matches your Firebase Console project

2. **✅ Android Permissions**

   - `POST_NOTIFICATIONS` permission added to AndroidManifest.xml (required for Android 13+)
   - App has runtime notification permission granted

3. **✅ Capacitor Push Plugin**

   - `@capacitor/push-notifications` installed in package.json
   - Plugin initialized in `main.tsx`

4. **✅ App Running in Foreground/Background**
   - Foreground: Should show alert popup
   - Background/Killed: Should show system notification

---

## Testing Steps

### Step 1: Verify Token Registration

1. Open the app
2. Go to **Settings**
3. Enable **Developer Mode**
4. Scroll to **Push Debug** card
5. Check:
   - ✅ **Platform**: Should show "android"
   - ✅ **Push Permission**: Should show "granted" (green badge)
   - ✅ **FCM Token**: Should display a long token string

### Step 2: Sync with Backend

1. Click **"Sync with Backend"** button
2. Verify success message: ✅ Synced token with backend
3. Click **"List Subscriptions"**
4. Confirm your device appears in the subscription list

### Step 3: Send Test Message from Firebase Console

#### Option A: Using Firebase Console (Notifications)

1. Go to Firebase Console → **Messaging** → **Send your first message**
2. Enter notification title and text
3. Click **Send test message**
4. **Paste your FCM token** from the app
5. Click **Test**

#### Option B: Using Firebase Console (Cloud Messaging)

1. Go to Firebase Console → **Cloud Messaging**
2. Click **Send your first message**
3. Fill in:
   - **Notification title**: Test Title
   - **Notification text**: Test Message
4. Click **Next**
5. Under **Target**, select **FCM registration token**
6. Paste your token
7. Click **Review** → **Publish**

---

## Common Issues & Solutions

### Issue 1: Permission Status is "prompt" or "denied"

**Solution:**

1. Uninstall the app completely
2. Reinstall and grant notification permission when prompted
3. For Android 13+: Check system settings → Apps → PalPalette → Notifications → Allowed

### Issue 2: Token exists but no notifications received

**Cause:** FCM service may not be initialized properly.

**Solution:**

1. Rebuild the Android app:
   ```bash
   npm run build
   npx cap sync android
   ```
2. Open in Android Studio and check Logcat for FCM logs:

   - Look for `FCM` or `FirebaseMessaging` logs
   - Check for any service initialization errors

3. Verify `google-services.json` is valid:
   - Compare `package_name` with `applicationId` in `android/app/build.gradle`
   - Should be: `com.palpalette.app`

### Issue 3: Foreground notifications not showing

**Expected behavior:** App shows an alert dialog when in foreground.

**If not working:**

1. Check browser console for logs:
   - Should see: `🔔 Push notification received in foreground:`
2. If no logs appear, listeners may not be attached:
   - Verify `PushService.init()` is called in `main.tsx`
   - Check for JavaScript errors in console

### Issue 4: Background notifications not showing

**Expected behavior:** System notification appears when app is in background or killed.

**If not working:**

1. Android may require a notification icon:

   - Add `ic_stat_notification.png` to `android/app/src/main/res/drawable/`
   - Add notification channel configuration

2. Verify app is NOT in battery optimization:

   - Settings → Apps → PalPalette → Battery → Unrestricted

3. Check Firebase message format:
   - Must include `notification` payload (not just `data`)
   - Example:
     ```json
     {
       "to": "YOUR_FCM_TOKEN",
       "notification": {
         "title": "Test Title",
         "body": "Test Body"
       }
     }
     ```

### Issue 5: Token changes on every app restart

**This is normal behavior.** FCM tokens can refresh periodically or when:

- App is reinstalled
- App data is cleared
- Device changes network conditions

**Solution:** Always sync token with backend on app start (already implemented in `AuthContext`).

---

## Debugging Tips

### View Android Logs

1. Connect device via USB
2. Open Android Studio → Logcat
3. Filter by: `FCM` or `PushNotifications`
4. Look for:
   - `FCM registration token:` (indicates successful registration)
   - `FirebaseMessaging: Received message` (indicates message received)

### View JavaScript Console

1. Open Chrome DevTools for Android:
   - Chrome → `chrome://inspect`
   - Select your device
2. Look for PushService logs:
   - `📲 Push registration token:`
   - `🔔 Push notification received in foreground:`
   - `👉 Push notification tapped:`

### Test with curl

Send a test message directly using FCM HTTP API:

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: Bearer YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "notification": {
      "title": "Direct Test",
      "body": "Testing FCM directly"
    },
    "priority": "high"
  }'
```

Replace:

- `YOUR_SERVER_KEY`: Get from Firebase Console → Project Settings → Cloud Messaging → Server Key
- `YOUR_FCM_TOKEN`: Get from the Push Debug card

---

## Verification Checklist

Before asking for help, verify:

- [ ] App is installed via Android Studio or signed APK (not `npx cap run`)
- [ ] `google-services.json` exists and is valid
- [ ] Permission status shows "granted" in Push Debug card
- [ ] FCM token is visible in Push Debug card
- [ ] Token is synced with backend (check subscriptions list)
- [ ] Android Logcat shows FCM registration success
- [ ] JavaScript console shows PushService initialization
- [ ] Notification permission is allowed in Android system settings
- [ ] Battery optimization is disabled for the app
- [ ] Firebase Console test message includes correct token

---

## Expected Flow

### Successful Registration Flow:

1. App starts → `PushService.init()` called
2. User logs in → `AuthContext` calls `PushService.syncRegistration()`
3. Permission requested (if not granted)
4. FCM generates token → `registration` event fires
5. Token stored locally in Preferences
6. Token sent to backend via `/push/register` API
7. Backend stores token in database

### Successful Message Reception (Foreground):

1. Firebase sends message to FCM
2. FCM delivers to device
3. Capacitor Push Plugin triggers `pushNotificationReceived` event
4. `PushService` listener logs and shows alert
5. User sees popup

### Successful Message Reception (Background):

1. Firebase sends message to FCM
2. FCM delivers to device
3. Android system displays notification
4. User taps notification
5. Capacitor triggers `pushNotificationActionPerformed` event
6. App opens and logs action

---

## Additional Resources

- [Capacitor Push Notifications Docs](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)
