# [Draft] Accounts Facebook for Meteor React Native.

## Installation

Run the following command to install it:

```shell
npm install @meteorrn/oauth-facebook
```

In your meteor app, make sure you have installed the **accounts-facebook** package:

```shell
meteor add accounts-facebook
```

### Configuration for Android

Before you can run the project, follow
the [Getting Started Guide](https://developers.facebook.com/docs/android/getting-started/) for Facebook Android SDK to
set up a Facebook app. You can skip the build.gradle changes since that's taken care of by the rnpm link step above,
but **make sure** you follow the rest of the steps such as updating `strings.xml` and `AndroidManifest.xml`.

### Configuration for iOS

Follow ***steps 3 and 4*** in the [Getting Started Guide](https://developers.facebook.com/docs/ios/use-cocoapods) for
Facebook SDK for iOS.

**If you're not using cocoapods already** you can also follow step 1.1 to set it up.

**If you're using React Native's RCTLinkingManager**

The `AppDelegate.m` file can only have one method for `openUrl`. If you're also using `RCTLinkingManager` to handle deep
links, you should handle both results in your `openUrl` method.

```objc
#import <FBSDKCoreKit/FBSDKCoreKit.h> // <- Add This Import
#import <React/RCTLinkingManager.h> // <- Add This Import

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  if ([[FBSDKApplicationDelegate sharedInstance] application:app openURL:url options:options]) {
    return YES;
  }

  if ([RCTLinkingManager application:app openURL:url options:options]) {
    return YES;
  }

  return NO;
}
```

## Usage

### SDK Initialization

To comply with Apple privacy requirements, for iOS the `autoInitEnabled` option is removed
from [facebook-ios-sdk#v9.0.0](https://github.com/facebook/facebook-ios-sdk/blob/master/CHANGELOG.md#900).

Using this module, Platform-neutral SDK Initialization is used to comply with this requirement. So, you don't need to
configure anything else. For further information, please visit this [link](https://github.com/thebergamo/react-native-fbsdk-next#sdk-initialization).

### Login

```js
import { Component } from 'react';
import { View } from 'react-native';
import Meteor from '@meteorrn/core';
import '@meteorrn/oauth-facebook';//this should be inside of @meteorrn/core package (PR is needed).
import FacebookButton from './path/to/customFacebookButton';

export default class Login extends Component {

	handleLoginFB() {
		Meteor.loginWithFacebook({ requestPermissions: ['email', 'public_profile'] }, (error) => {
			if (!error) {
				//Do anything
			} else {
				console.error('There was an error in login with Facebook: ', error);
			}
		});
	}

	render() {
		return (
			<View>
				<FacebookButton onPress={ handleLoginFB }/>
			</View>
		);
	}
};
```
