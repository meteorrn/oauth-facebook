import Meteor from '@meteorrn/core';
import { AccessToken, GraphRequest, GraphRequestManager, LoginManager, Settings } from 'react-native-fbsdk-next';

Meteor.loginWithFacebook = async function(options, callback) {
	let scope = ['email'];
	if (options?.requestPermissions.length) {
		scope = options.requestPermissions;
	}
	try {
		Settings.initializeSDK();
		let dataAccessToken = await AccessToken.getCurrentAccessToken();
		if (!dataAccessToken) {
			const result = await LoginManager.logInWithPermissions(scope);
			if (result.isCancelled) {
				typeof callback == 'function' && callback({ reason: 'Operation cancelled' });
				return;
			}
		}
		const request = new GraphRequest(
			'/me',
			{
				httpMethod: 'GET'
			},
			async(graphError) => {
				if (graphError) {
					typeof callback == 'function' && callback(graphError);
					return;
				}
				dataAccessToken = await AccessToken.getCurrentAccessToken();
				Meteor._startLoggingIn();
				Meteor.call('login', { facebookSignIn: true, ...dataAccessToken }, (error, response) => {
					Meteor._endLoggingIn();
					Meteor._handleLoginCallback(error, response);
					typeof callback == 'function' && callback(error);
				});
			}
		);
		new GraphRequestManager().addRequest(request).start();
	} catch (error) {
		callback(error);
	}
};

Meteor.logoutFromFacebook = function() {
	return Promise((resolve, reject) => {
		Meteor.logout(async(error) => {
			if (!error) {
				await LoginManager.logOut();
				resolve();
			} else {
				reject(error);
			}
		});
	});
};
