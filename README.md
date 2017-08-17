# Indico check in mobile application

This application was initially developed during the CERN OpenLab Summer Student Programme.
An early description of the project (for historical purposes) can be found [here].

[here]: http://indico-software.org/wiki/User/Dev/ETicket

## Build

We leverage [Apache Cordova](https://cordova.apache.org/)'s multi-platform capabilities to create a simple yet useful
web application.
First of all, you'll have to install Cordova:

```sh
$ npm install -g cordova
```

### For Android development

You'll need to have the [Android SDK Tools](https://developer.android.com/studio/releases/sdk-tools.html) installed.
[Android Studio](https://developer.android.com/studio/index.html) may also be of help if you intend to use an emulator
instead of a physical phone.

Please note that the `ANDROID_HOME` environment variable needs to be properly set, otherwise Cordova won't be able to
find the SDK.

```sh
$ cordova platform add android
```

If you intend to use the emulator you may need to [create an AVD](https://developer.android.com/studio/run/managing-avds.html)
if you don't yet have one. If you want to use a physical device, just make sure you connect it via USB.

Regardless of what you choose, you'll only need to run:

```sh
$ cordova run android
```


### iOS Development

You will need to have XCode installed. You will also need to install `ios-deploy`:

```sh
$ npm install -g ios-deploy
```

Similarly to what happens with Android, you may choose to use an emulator or actual phone.

```sh
$ cordova run ios
```

You may be required to associate the XCode project [with a development team](https://stackoverflow.com/a/41217410/682095).
