# Local Android browser testing

opneet is a web app. Test it in Chrome inside an Android virtual device; importing the repository as a native Android project does not build an APK.

The workspace test SDK lives at `/home/happy/codex/android-test/sdk`, with separate AVD storage at `/home/happy/codex/android-test/avd`. It does not replace the SDK configured in Android Studio.

## Run the production preview

```bash
cd /home/happy/codex/opneet
export PATH="/home/happy/codex/.rea-toolchain/node_modules/.bin:$PATH"
npm run build
npm run preview -- --host 127.0.0.1 --port 4175 --strictPort
```

## Connect an Android device or emulator

For this checkout, launch the prepared phone emulator in a visible window:

```bash
/home/happy/codex/android-test/launch-phone.sh
```

It uses the same Android emulator engine as Android Studio. Wait for Android to boot before the ADB steps below. The first cold boot took about 3.5 minutes on this machine; its 3.7 GiB RAM makes the emulator slow. Run one emulator at a time.

With a virtual device running, use the matching SDK's `adb`. Select its serial explicitly when other devices are connected:

```bash
ADB=/home/happy/codex/android-test/sdk/platform-tools/adb
"$ADB" devices
"$ADB" -s emulator-5556 reverse tcp:4175 tcp:4175
"$ADB" -s emulator-5556 shell am start -a android.intent.action.VIEW -d http://localhost:4175/ com.android.chrome
```

The reverse tunnel makes the host preview available at `http://localhost:4175/` inside Android. Keep the preview running while testing. This localhost origin also supports the app's browser crypto APIs.

## Run the Android smoke checks

Enable Chrome remote debugging on the test device, then forward its DevTools socket:

```bash
"$ADB" -s emulator-5556 forward tcp:9223 localabstract:chrome_devtools_remote
ANDROID_TEST_PROFILE=phone node scripts/android-smoke.mjs
```

The script attaches to Android Chrome without setting a simulated desktop viewport. It exercises sample practice, explanations, bookmarks, saved answers, results, the session builder and timed-test deadline persistence. Screenshots and reports go into the ignored `.impeccable/review/android/` directory.

The script clears opneet storage on the connected Chrome profile. Use a disposable test emulator, not a personal browser with study history.

Rotate the emulator and repeat under a distinct profile name. Tablet configurations should also be checked with their actual Android display size and density. Physical-device testing remains separate.

## Recorded results

Android 15 / API 35 with the image's bundled Chrome 124 passed the smoke flows at 412 × 783 CSS pixels and at an 800 × 1080 tablet-sized display override. Phone landscape study layout passed at 863 × 304. These runs reported no horizontal overflow or JavaScript errors. The tablet configuration reused the phone AVD with `wm size 1200x1920` and `wm density 240`; it was not a separate tablet hardware profile. Chrome was restarted after changing the display.

Restore the phone display after experimenting:

```bash
"$ADB" -s emulator-5556 shell wm size reset
"$ADB" -s emulator-5556 shell wm density reset
"$ADB" -s emulator-5556 shell settings put system user_rotation 0
```

Stop this specific emulator when finished:

```bash
"$ADB" -s emulator-5556 emu kill
```
