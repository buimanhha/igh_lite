
## Debug simulator
xcrun simctl list devices

npx react-native run-ios --simulator="iPhone 8"

## Debug ios
1. List device id: xcrun instruments -s devices
2. get udid
3. Debug in real device
```bash
npx react-native run-ios --device --udid 2e13c39ad8e6f603f4602d50c3af595ef6e86fc5
```