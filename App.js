import React, {Component} from 'react';
import {AsyncStorage, Platform, StatusBar, StyleSheet, View, Alert } from 'react-native';
import {TaskManager, Constants, Location, Permissions, SQLite, WebBrowser, AppLoading, Asset, Font, Icon } from 'expo';
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

const LOCATION_TASK_NAME = 'background-location-task';

// Make/open a database. (depending on whether it already exists)
const db = SQLite.openDatabase('db.db');
// The APIurl is where all our PM data is obtained.
const APIurl = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=";
// missing: "YYYY-MM-DDTHH:MM:SSZ", "&end="", and "YYYY-MM-DDTHH:MM:SSZ" (w/o "". timeframe)
// Added just before making the fetch to acquire data from the server.

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
      location: null,
    };
  }

  componentDidMount() {
    // Create settings and locationdata tables with corresponding columns.
    AsyncStorage.getItem("alreadyLaunched").then(value => {
      if(value == null){
        AsyncStorage.setItem('alreadyLaunched', 'true'); // No need to wait for `setItem` to finish, although you might want to handle errors
          db.transaction(tx => {
            tx.executeSql('create table if not exists settings (timeframe text, accuracy text, frequency int, notifications int);');
            tx.executeSql('create table if not exists locationdata (timestamp datetime primary key, latitude double, longitude double, pm25 double);');
            // default settings can be updated by user in settings screen
            tx.executeSql('insert into settings (timeframe, accuracy, frequency, notifications) values ("day", "low", 15, 0);');
          });
      }
    });
    this.getLocationAsync();
  }

  getLocationAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 300000,
    });
  };

  componentWillUnmount() {
    // unregister all event listeners
  }

  render() {
    console.log('this');

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

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
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
    fetch(APIurlTotal)
      .then(response => response.json())
      .then(responseJson =>{ 
        console.log(JSON.stringify(responseJson));
        parameters = [];
        for(i = 0; i < responseJson.length; i++){
          parameters.push(responseJson[i].time, locations[0].coords.latitude, locations[0].coords.longitude, responseJson[i].pm25 );
          db.transaction(tx => {
            tx.executeSql('insert into locationdata (timestamp, latitude, longitude, pm25) values (' + parameters[0] + 
                      ', ' + parameters[1] + ', ' + parameters[2] + ', ' + parameters[3] + ') where timestamp != ' 
                      + parameters[0], parameters);
          });
        }   
    })
  }
})