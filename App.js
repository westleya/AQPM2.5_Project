import React, {Component} from 'react';
import {AsyncStorage, Platform, StatusBar, StyleSheet, View, Alert } from 'react-native';
import {BackgroundFetch, TaskManager, Constants, Location, Permissions, SQLite, WebBrowser,
   AppLoading, Asset, Font, Icon, NetInfo } from 'expo';
import {
  createStackNavigator,
  createAppContainer,
  createBottomTabNavigator 
} from 'react-navigation';
import moment, {diff} from 'moment';
import TabBarIcon from './components/TabBarIcon';
import ReportScreen from './screens/ReportScreen';
import FAQScreen from './screens/FAQScreeen';
import SettingsScreen from './screens/SettingsScreen';

// Required name(s) for task manager. The app receives periodic location updates
// and makes requests for air quality data to the server in the background.
const LOCATION_TASK_NAME = 'background-location-task';
// Make/open a database. (depending on whether it already exists)
const db = SQLite.openDatabase('db.db');
// The APIurl is where all our PM data is obtained.
const APIurl = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=";
// missing: "YYYY-MM-DDTHH:MM:SSZ", "&end="", and "YYYY-MM-DDTHH:MM:SSZ" (w/o "". timeframe)
// Added just before making the fetch to acquire data from the server.

// The app only works for the wasatch front. So, there's a Long/Lat 
// limit on its viability. The min/max for both are set at the outer
// edge of the greatest concentration of sensors. While sensors exist
// outside the wasatch front they're not supported by the app.
const LONG_MAX = -111.0;
const LONG_MIN = -112.6;
const LAT_MAX = 41.9;
const LAT_MIN =  39.9;


////////////////// TAB NAVIGATION //////////////////////
// The following section is for navigating from screen//
// to screen. The newest version of React Native has  //
// moved navigation out of its own folder and into the//
// App.js file.                                       //
// An icon and a button is created that will pull up  //
// the corresponding screen when pressed.             //
////////////////////////////////////////////////////////

const ReportStack = createStackNavigator({
  Report: ReportScreen,
});

ReportStack.navigationOptions = {
  tabBarLabel: 'Report',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-stats`
          : 'md-stats'
      }
    />
  ),
};

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-settings` : 'md-settings'}
    />
  ),
};

const FAQStack = createStackNavigator({
  FAQ: FAQScreen,
});

FAQStack.navigationOptions = {
  tabBarLabel: 'FAQ',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-information-circle` 
      : 'md-information-circle'}
    />
  ),
};

const AppNavigator = createBottomTabNavigator({
  ReportStack,
  SettingsStack,
  FAQStack,
},{ tabBarOptions: {
  style: {
    backgroundColor:"#2B2B2B"
  },
}});

const AppContainer = createAppContainer(AppNavigator);

/////////// END TAB NAVIGATION ////////////

////////////// APP CREATION ///////////////
// App creation includes implementation  //
// of any code (e.g. database creation)  //
// that's desired to only run once. Most //
// of said code is implemented in the    //
// componentDidMount() method.           //
// The render() method creates a frame/  //
// skeleton of the app for the screens to//
// fill in. It's also responsible for the//
// loading screen and the app's icon.    //
///////////////////////////////////////////

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingComplete: false,
    };
  }

  componentDidMount() {
    // Create settings and locationdata tables with corresponding columns.
    AsyncStorage.getItem("alreadyLaunched").then(value => {
      if(value == null){
        AsyncStorage.setItem('alreadyLaunched', 'true'); // No need to wait for `setItem` to finish, although you might want to handle errors
          db.transaction(tx => {
            tx.executeSql('create table if not exists settings (timeframe text, accuracy text, frequency int, notifications int);');
            // All timestamps will be unique
            tx.executeSql('create table if not exists locationdata (timestamp datetime primary key, latitude double, longitude double, pm25 double);');
            // default settings can be updated by user in settings screen
            tx.executeSql('insert into settings (timeframe, accuracy, frequency, notifications) values ("day", "low", 15, 0);');
          });
      }
    });
    this.getPermissionAsync();
  }

  getPermissionAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
      return;
    }
    
    Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 60000,
      distanceInterval: 0,
    });
  }

  componentWillUnmount() {
    // unregister all event listeners
  }

  render() {

    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppContainer
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
      <AppContainer>
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        </View>
      </AppContainer>
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
/////////////// END APP CREATION //////////////

// Checks for internet access - required to get air quality data - 
// and checks that the location is within a certain range. The U
// currently only servesthe wasatch front. So, latitude and 
// longitude ranges are confined to that area.

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    console.log(error.message);
    return;
  }
  if (data) {
    const { locations } = data;

    console.log(locations);
    console.log(locations[0]);
    console.log(locations[0].coords);
    console.log(locations[0].coords.latitude);

    present = moment().format().substring(0, 19) + 'Z';
    past = moment().subtract(300, 'seconds').
         format().substring(0,19) + 'Z';
    APIurlTotal = APIurl + locations[0].coords.latitude + "&location_lng=" + 
          locations[0].coords.longitude + "&start=" + past + "&end=" + present;
    console.log(APIurlTotal);

    // Check for internet access. Check location is in bounds.
    NetInfo.getConnectionInfo().then((connectionInfo) => {

      parameters = [];
      length_arr = locations.length;

      for( i = 0; i < length_arr; i++) {

        LAT_CURR = locations[i].coords.latitude;
        LONG_CURR = loations[i].coords.longitude;

        // If location(s) is/are out-of-bounds set air quality data to 0.
        // Else, set the location with timestamp in the db if no internet access. (or unknown)
        // We can get air quality data for the location later.
        // Otherwise get data from the server and add it to the db.
        if(LAT_CURR > LAT_MAX || LAT_CURR < LAT_MIN || LONG_CURR > LONG_MAX || LONG_CURR < LONG_MIN) {
          parameters.push(locations[i].timestamp, LAT_CURR, LONG_CURR, 0.0);
          db.transaction(tx => {
            tx.executeSql('insert into locationdata (timestamp, latitude, longitude, pm25) values (' + parameters[0] + 
                    ', ' + parameters[1] + ', ' + parameters[2] + ', ' + parameters[3] + ') where timestamp != ' 
                    + parameters[0], parameters);
          });
        }
        else if(connectionInfo.type == 'none' || connectionInfo.type == 'unknown'){
          parameters.push(locations[i].timestamp, LAT_CURR, LONG_CURR, null);
          db.transaction(tx => {
            tx.executeSql('insert into locationdata (timestamp, latitude, longitude, pm25) values (' + parameters[0] + 
                    ', ' + parameters[1] + ', ' + parameters[2] + ', ' + parameters[3] + ') where timestamp != ' 
                    + parameters[0], parameters);
          });
        }
        else {
          
        }
      }
    });
    // fetch(APIurlTotal)
    //   .then(response => response.json())
    //   .then(responseJson =>{ 
    //     console.log(JSON.stringify(responseJson));
    //     for(i = 0; i < responseJson.length; i++){
    //       parameters.push(responseJson[i].time, locations[0].coords.latitude, locations[0].coords.longitude, responseJson[i].pm25 );
    //       db.transaction(tx => {
    //         tx.executeSql('insert into locationdata (timestamp, latitude, longitude, pm25) values (' + parameters[0] + 
    //                   ', ' + parameters[1] + ', ' + parameters[2] + ', ' + parameters[3] + ') where timestamp != ' 
    //                   + parameters[0], parameters);
    //       });
    //     }   
    // });
  }
})