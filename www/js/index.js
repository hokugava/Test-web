/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    /**
 * Modified MIT License
 *
 * Copyright 2017 OneSignal
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * 1. The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * 2. All copies of substantial portions of the Software may only be used in connection
 * with services provided by OneSignal.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
 
var addedObservers = false;

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
        var strong = window.location.search.substr(1);
        if(strong != ""){
            strong = strong.replace("url=","");
            cordova.InAppBrowser.open(strong, '_blank', 'location=no','hardwareback=no');
        }
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        //START ONESIGNAL CODE
        //Remove this method to stop OneSignal Debugging
        window.plugins.OneSignal.setLogLevel({logLevel: 6, visualLevel: 0});
  
        var notificationOpenedCallback = function(jsonData) {
            var notificationData = JSON.stringify(jsonData)
            console.log('notificationOpenedCallback: ' + notificationData);
            var notificationID = jsonData.notification.payload.notificationID;
            console.log('notificationID: ' + notificationID);
            var notificationData = jsonData.notification.payload.additionalData.foo;
            console.log('notificationData: ' + notificationData);
        };
        // Set your iOS Settings
        var iosSettings = {};
        iosSettings["kOSSettingsKeyAutoPrompt"] = false;
        iosSettings["kOSSettingsKeyInAppLaunchURL"] = false;
               
        window.plugins.OneSignal
          .startInit("ONESIGNAL_DEV_KEY")
          .handleNotificationReceived(function(jsonData) {
            console.log('Did I receive a notification: ' + JSON.stringify(jsonData));
          })
          .handleNotificationOpened(notificationOpenedCallback)
          .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
          .iOSSettings(iosSettings)
          .endInit();

        if (addedObservers == false) {
            addedObservers = true;

            window.plugins.OneSignal.addEmailSubscriptionObserver(function(stateChanges) {
                console.log("Email subscription state changed: \n" + JSON.stringify(stateChanges, null, 2));
            });

            window.plugins.OneSignal.addSubscriptionObserver(function(stateChanges) {
                console.log("Push subscription state changed: " + JSON.stringify(stateChanges, null, 2));
            });

            window.plugins.OneSignal.addPermissionObserver(function(stateChanges) {
                console.log("Push permission state changed: " + JSON.stringify(stateChanges, null, 2));
            });
        }
        // The promptForPushNotificationsWithUserResponse function will show the iOS push notification prompt. 
        // We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step 6)
        window.plugins.OneSignal.promptForPushNotificationsWithUserResponse(function(accepted) {
            console.log("User accepted notifications: " + accepted);
        });
    }
};

function triggerOutcome() {
    window.plugins.OneSignal.sendOutcomeWithValue("cordova", 10, function () {
        console.log("outcomes sent log");
    });
}

function triggerIAM() {
    console.log("Triggering any active IAM with Trigger value birthday is true");
    window.plugins.OneSignal.addTrigger("birthday", "true");
}

function getIds() {
    window.plugins.OneSignal.getPermissionSubscriptionState(function(status) {
        document.getElementById("OneSignalUserId").innerHTML = "UserId: " + status.subscriptionStatus.userId;
        document.getElementById("OneSignalPushToken").innerHTML = "PushToken: " + status.subscriptionStatus.pushToken;
        console.log('Player ID: ' + status.subscriptionStatus.userId);
        //alert('Player ID: ' + status.subscriptionStatus.userId + "\npushToken = " + status.subscriptionStatus.pushToken);
    });
}

function sendTags() {
    window.plugins.OneSignal.sendTags({PhoneGapKey: "PhoneGapValue", key2: "value2"});
    //alert("Tags Sent");
}

function getTags() {
    window.plugins.OneSignal.getTags(function(tags) {
        //alert('Tags Received: ' + JSON.stringify(tags));
    });
}

function deleteTags() {
    window.plugins.OneSignal.deleteTags(["PhoneGapKey", "key2"]);
    //alert("Tags deleted");
}

function promptLocation() {
    window.plugins.OneSignal.promptLocation();
    // iOS - add CoreLocation.framework and add to plist: NSLocationUsageDescription and NSLocationWhenInUseUsageDescription
    // android - add one of the following Android Permissions:
    // <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    // <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
}

function postNotification() {
    window.plugins.OneSignal.getIds(function(ids) {
        var notificationObj = { contents: {en: "message body"},
        data: {"foo": "bar"},
                          include_player_ids: [ids.userId]};
        window.plugins.OneSignal.postNotification(notificationObj,
            function(successResponse) {
                console.log("Notification Post Success:", successResponse);
            },
            function (failedResponse) {
                console.log("Notification Post Failed: ", failedResponse);
                //alert("Notification Post Failed:\n" + JSON.stringify(failedResponse, null, 2));
            }
        );
    });
}

function setEmail() {
    console.log("Setting email: " + document.getElementById("email").value);
    window.plugins.OneSignal.setEmail(document.getElementById("email").value, function() {
        console.log("Successfully set email");
    }, function(error) {
        //alert("Encountered an error setting email: \n" + JSON.stringify(error, null, 2));
    });
}

function logoutEmail() {
    console.log("Logging out of email");
    window.plugins.OneSignal.logoutEmail(function(successResponse) {
        console.log("Successfully logged out of email");
    }, function(error) {
        //alert("Failed to log out of email with error: \n" + JSON.stringify(error, null, 2));
    });
}

function setExternalId() {
   let externalId = document.getElementById("externalId").value;
   console.log("Setting external ID to " + externalId);

   window.plugins.OneSignal.setExternalUserId(externalId);
}

function removeExternalId() {
   console.log("Removing external ID");

   window.plugins.OneSignal.removeExternalUserId();
}

app.initialize();




// // Add to index.js or the first page that loads with your app.
// // For Intel XDK and please add this to your app.js.

// document.addEventListener('deviceready', function () {
//   // Enable to debug issues.
//   // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
  
//   var notificationOpenedCallback = function(jsonData) {
//     console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
//   };

//   window.plugins.OneSignal
//           .startInit("d368162e-7c4e-48b0-bc7c-b82ba80d4981")
//           .handleNotificationReceived(function(jsonData) {
//             alert("Notification received: \n" + JSON.stringify(jsonData));
//             console.log('Did I receive a notification: ' + JSON.stringify(jsonData));
//           })
//           .handleNotificationOpened(function(jsonData) {
//             alert("Notification opened: \n" + JSON.stringify(jsonData));
//             console.log('didOpenRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
//           })
//           .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.InAppAlert)
//           .iOSSettings(iosSettings)
//           .endInit();
  
//   // Call syncHashedEmail anywhere in your app if you have the user's email.
//   // This improves the effectiveness of OneSignal's "best-time" notification scheduling feature.
//   // window.plugins.OneSignal.syncHashedEmail(userEmail);
// }, false);

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');

    var oMain = new CMain({
                                    win_occurrence:30,        //WIN PERCENTAGE.SET A VALUE FROM 0 TO 100.
                                    slot_cash: 100,          //THIS IS THE CURRENT SLOT CASH AMOUNT. THE GAME CHECKS IF THERE IS AVAILABLE CASH FOR WINNINGS.
                                    min_reel_loop:2,          //NUMBER OF REEL LOOPS BEFORE SLOT STOPS  
                                    reel_delay: 6,            //NUMBER OF FRAMES TO DELAY THE REELS THAT START AFTER THE FIRST ONE
                                    time_show_win:2000,       //DURATION IN MILLISECONDS OF THE WINNING COMBO SHOWING
                                    time_show_all_wins: 2000, //DURATION IN MILLISECONDS OF ALL WINNING COMBO
                                    money:100,               //STARING CREDIT FOR THE USER
                                    
                                    /***********PAYTABLE********************/
                                    //EACH SYMBOL PAYTABLE HAS 5 VALUES THAT INDICATES THE MULTIPLIER FOR X1,X2,X3,X4 OR X5 COMBOS
                                    paytable_symbol_1: [0,0,100,150,200], //PAYTABLE FOR SYMBOL 1
                                    paytable_symbol_2: [0,0,50,100,150],  //PAYTABLE FOR SYMBOL 2
                                    paytable_symbol_3: [0,10,25,50,100],  //PAYTABLE FOR SYMBOL 3
                                    paytable_symbol_4: [0,10,25,50,100],  //PAYTABLE FOR SYMBOL 4
                                    paytable_symbol_5: [0,5,15,25,50],    //PAYTABLE FOR SYMBOL 5
                                    paytable_symbol_6: [0,2,10,20,35],    //PAYTABLE FOR SYMBOL 6
                                    paytable_symbol_7: [0,1,5,10,15],     //PAYTABLE FOR SYMBOL 7
                                    /*************************************/
                                    fullscreen:true,           //SET THIS TO FALSE IF YOU DON'T WANT TO SHOW FULLSCREEN BUTTON
                                    check_orientation:true,    //SET TO FALSE IF YOU DON'T WANT TO SHOW ORIENTATION ALERT ON MOBILE DEVICES
                                    show_credits:true,         //ENABLE/DISABLE CREDITS BUTTON IN THE MAIN SCREEN
                                    ad_show_counter:3         //NUMBER OF SPIN PLAYED BEFORE AD SHOWING
                                    // 
                                    //// THIS FEATURE  IS ACTIVATED ONLY WITH CTL ARCADE PLUGIN./////////////////////////// 
                                    /////////////////// YOU CAN GET IT AT: ///////////////////////////////////////////////////////// 
                                    // http://codecanyon.net/item/ctl-arcade-wordpress-plugin/13856421///////////

                                });

                    $(oMain).on("start_session", function (evt) {
                        if(getParamValue('ctl-arcade') === "true"){
                            parent.__ctlArcadeStartSession();
                        }
                        //...ADD YOUR CODE HERE EVENTUALLY
                    });

                    $(oMain).on("end_session", function (evt) {
                        if(getParamValue('ctl-arcade') === "true"){
                            parent.__ctlArcadeEndSession();
                        }
                        //...ADD YOUR CODE HERE EVENTUALLY
                    });
                    
                    $(oMain).on("bet_placed", function (evt, oBetInfo) {
                        var iBet = oBetInfo.bet;
                        var iTotBet = oBetInfo.tot_bet;
                        //...ADD YOUR CODE HERE EVENTUALLY
                    });
                
                    $(oMain).on("save_score", function (evt, iMoney) {
                        if(getParamValue('ctl-arcade') === "true"){
                            parent.__ctlArcadeSaveScore({score:iMoney});
                        }
                        //...ADD YOUR CODE HERE EVENTUALLY
                    });
                    
                    $(oMain).on("show_preroll_ad", function (evt) {
                        //...ADD YOUR CODE HERE EVENTUALLY
                    });
                    
                    $(oMain).on("show_interlevel_ad", function (evt) {
                        if(getParamValue('ctl-arcade') === "true"){
                            parent.__ctlArcadeShowInterlevelAD();
                        }
                        //...ADD YOUR CODE HERE EVENTUALLY
                    });

                    $(oMain).on("share_event", function(evt, iScore) {
                           if(getParamValue('ctl-arcade') === "true"){
                               parent.__ctlArcadeShareEvent({   
                                                                img: TEXT_SHARE_IMAGE,
                                                                title: TEXT_SHARE_TITLE,
                                                                msg: TEXT_SHARE_MSG1 + iScore+ TEXT_SHARE_MSG2,
                                                                msg_share: TEXT_SHARE_SHARE1 + iScore + TEXT_SHARE_SHARE1});
                           }
                    });
                     
                    if(isIOS()){
                        setTimeout(function(){sizeHandler();},200);
                    }else{
                        sizeHandler();
                    }
}
