import React, {Component} from 'react';
import {AsyncStorage, Platform, StatusBar, StyleSheet, View, Alert } from 'react-native';
import Expo, {TaskManager, Constants, Location, Permissions, SQLite, WebBrowser, AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import moment, {diff} from 'moment';
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';

// Make/open a database depending on whether it already exists
const db = SQLite.openDatabase('db.db');
// Where all our PM data is obtained
// Will be made use of once Expo rolls out their background location tracking
const APIurl = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=";
// missing: "YYYY-MM-DDTHH:MM:SSZ" &end= "YYYY-MM-DDTHH:MM:SSZ" (timeframe)
// Added just before making the fetch to acquire data from the server.


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingComplete: false,
    };
  }

  // this code will be added once expo rolls out background tracking:
  // present = moment().format().substring(0, 19) + 'Z';
  // past = moment().subtract(BackgroundGeolocation.activitiesInterval / 1000, 'seconds').
  //        format().substring(0,19) + 'Z';
  // APIurlTotal = APIurl + location.latitude + "&location_lng=" + 
  //               location.longitude + "&start=" + past + "&end=" + present;
  // fetch(APIurlTotal)
  // .then(response => response.json())
  // .then(responseJson =>{ 
  //   console.log(JSON.stringify(responseJson));
  //   parameters = [];
  //   for(i = 0; i < responseJson.length; i++){
  //     parameters.push(responseJson[i].time, location.latitude, location.longitude, responseJson[i].pm25 );
  //     db.transaction(tx => {
  //       tx.executeSql('insert into locationdata (timestamp, latitude, longitude, pm25) values (' + parameters[0] + 
  //                     ', ' + parameters[1] + ', ' + parameters[2] + ', ' + parameters[3] + ') where timestamp != ' 
  //                     + parameters[0], parameters);
  //     });
  //   }
  componentDidMount() {
    // Create settings and locationdata tables with corresponding columns.
    AsyncStorage.getItem("alreadyLaunched").then(value => {
      if(value == null){
           AsyncStorage.setItem('alreadyLaunched', 'true'); // No need to wait for `setItem` to finish, although you might want to handle errors
           db.transaction(tx => {
            tx.executeSql('create table if not exists settings (timeframe text, accuracy text, frequency int, notifications int);');
            tx.executeSql('create table if not exists locationdata (timestamp datetime, latitude double, longitude double, pm25 double);');
            // default settings can be updated by user in settings screen
            tx.executeSql('insert into settings (timeframe, accuracy, frequency, notifications) values ("day", "low", 15, 0);');
          });
      }
      });

  }

  componentWillUnmount() {
    // unregister all event listeners
  }

  render() {
    console.log('this');

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
          'select * from settings',
          [],(_,{rows:{_array}}) => console.log(JSON.stringify(_array))
        )}
      );
          
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
  },
});
