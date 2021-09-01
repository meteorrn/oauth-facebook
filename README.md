# Accounts Facebook for Meteor React Native.

## Prerequisites

Have RN >= 0.63.3

## Installation

In your react native app, run the following command to install it:

```shell
npm install @meteorrn/oauth-facebook
```

In your meteor app, make sure you have installed the following packages:

```
meteor add accounts-base accounts-password http
```

Then, add the following code into a server's file:

```js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { HTTP } from 'meteor/http';

const registerHandler = () => {
    Accounts.registerLoginHandler('facebook', function(request) {
        // If this isn't facebook login then we don't care about it. No need to proceed.
        if (request.facebookSignIn !== true) {
            return;
        }

        // include basic fields from facebook
        // https://developers.facebook.com/docs/facebook-login/permissions/
        const whitelisted = ['id', 'email', 'name', 'first_name', 'last_name',
            'middle_name', 'name_format', 'picture', 'short_name'];

        // Get our user's identifying information. This also checks if the accessToken
        // is valid. If not it will error out.
        const identity = getIdentity(request.accessToken, whitelisted);

        // Build our actual data object.
        const serviceData = {
            accessToken: request.accessToken,
            expiresAt: (+new Date) + (1000 * request.expirationTime)
        };
        const fields = Object.assign({}, serviceData, identity);
		
        return Accounts.updateOrCreateUserFromExternalService('facebook', { ...fields }, {
            profile: {
                name: identity.name,
                //add more fields if you want
            }
        });
    });
};

// Gets the identity of our user and by extension checks if
// our access token is valid.
const getIdentity = (accessToken, fields) => {
    try {
        return HTTP.get('https://graph.facebook.com/v2.4/me', {
            params: {
                access_token: accessToken,
                fields: fields.join(',')
            }
        }).data;
    } catch (err) {
        throw Object.assign(
            new Error(`Failed to fetch identity from Facebook. ${ err.message }`),
            { response: err.response }
        );
    }
};

Meteor.startup(() => {
    registerHandler();
});

```

____

Currently, there is a [PR](https://github.com/meteor/meteor/pull/11603) for **accounts-facebook** package to make easier
this configuration. Once PR was merged and
published in a Meteor release, you will have to add the following packages and skip the above code:

```shell
meteor add accounts-facebook service-configuration
```

And add this configuration in a server's file:

```js
import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';

if (Meteor.isDevelopment) {
    if (Meteor.settings.private?.OAUTH?.facebook) {
        process.env.OAUTH_FACEBOOK_APP_ID = Meteor.settings.private.OAUTH.facebook.APP_ID;
        process.env.OAUTH_FACEBOOK_SECRET = Meteor.settings.private.OAUTH.facebook.SECRET;
    } else {
        console.warn('[App name] - Facebook OAuth settings are not configured.');
        process.env.OAUTH_FACEBOOK_APP_ID = '';
        process.env.OAUTH_FACEBOOK_SECRET = '';
    }
}

ServiceConfiguration.configurations.upsert({ service: 'facebook' }, {
    $set: {
        appId: process.env.OAUTH_FACEBOOK_APP_ID,
        loginStyle: "popup",
        secret: process.env.OAUTH_FACEBOOK_SECRET
    }
});
```

Make sure you have environment variables configured in your `settings-settings.json` file:

```json
{
  "private": {
    "ROOT_URL": "http://localhost",
    "OAUTH": {
      "facebook": {
        "APP_ID": "yourAppId",
        "SECRET": "yourSecret"
      }
    }
  }
}
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

```objetive-c
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
import '@meteorrn/oauth-facebook';//this should be inside of meteorrn/core package (PR is needed).
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

If you want to do **logout**, remember to use this way:

```js
Meteor.logoutFromFacebook();
```
