import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import Expo, { Constants, Location, Permissions, SQLite, WebBrowser, AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';
//import BackgroundGeolocation from 'react-native-background-geolocation';

// Make/open a database depending on whether it already exists
const db = SQLite.openDatabase('db.db');
// class LocationData extends React.Component {

// }


export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  
  };

  // console.log(JSON.stringify(_array));
  // if( _array[0].count < 1) { 
  //   db.transaction(tx => {
  //   tx.executeSql(';');
  //   });
  // };
  componentDidMount() {
    // Create settings and locationdata tables with corresponding columns.
    db.transaction(tx => {
      tx.executeSql('create table if not exists settings (timeframe text, accuracy text, frequency int, notifications int);');
      tx.executeSql('create table if not exists locationdata (timestamp datetime, latitude double, longitude double);');
      tx.executeSql('insert into settings (timeframe, accuracy, frequency, notifications) values ("day", "low", 15, 0) where {select count(*) from settings} < 1;');
    });
  }
  // Code pulled from https://www.npmjs.com/package/react-native-background-geolocation
  componentWillMount() {

    /*
    //
    // 1.  Wire up event-listeners
    //
 
    // This handler fires whenever bgGeo receives a location update.
    BackgroundGeolocation.onLocation(this.onLocation, this.onError);
 
    // This handler fires when movement states changes (stationary->moving; moving->stationary)
    BackgroundGeolocation.onMotionChange(this.onMotionChange);
 
    // This event fires when a change in motion activity is detected
    BackgroundGeolocation.oActivityChange(this.onActivityChange);
 
    // This event fires when the user toggles location-services authorization
    BackgroundGeolocation.onProviderChange(this.onProviderChange);
 
    //
    // 2.  Execute #ready method (required)
    //
    BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM,
      distanceFilter: 10,
      // Activity Recognition
      stopTimeout: 1,
      // Application config
      debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
      // HTTP / SQLite config
      url: 'http://yourserver.com/locations',
      batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
      headers: {              // <-- Optional HTTP headers
        "X-FOO": "bar"
      },
      params: {               // <-- Optional HTTP params
        "auth_token": "maybe_your_server_authenticates_via_token_YES?"
      }
    }, (state) => {
      console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
 
      if (!state.enabled) {
        //
        // 3. Start tracking!
        //
        BackgroundGeolocation.start(function() {
          console.log("- Start success");
        });
      }
    });*/
  }

  // You must remove listeners when your component unmounts
  /*
  componentWillUnmount() {
    BackgroundGeolocation.removeAllListeners();
  }
  onLocation(location) {
    console.log('[location] -', location);
  }
  onError(error) {
    console.warn('[location] ERROR -', error);
  }
  onActivityChange(event) {
    console.log('[activitychange] -', event);  // eg: 'on_foot', 'still', 'in_vehicle'
  }
  onProviderChange(provider) {
    console.log('[providerchange] -', provider.enabled, provider.status);
  }
  onMotionChange(event) {
    console.log('[motionchange] -', event.isMoving, event.location);
  }*/

  render() {
      if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {

      db.transaction(tx=>
        {tx.executeSql(
          'select * from settings;',
          [],(_,{rows:{_array}}) => 
          console.log(JSON.stringify(_array)))});
          
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <AppNavigator />
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/title.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fillColor: '#2B2B2B',
  },
});
