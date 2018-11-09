import React, {Component} from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';
import { LineChart, Grid } from 'react-native-svg-charts';
import moment from 'moment';
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';

// Where all our data is obtained
const APIurl = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=40.78756024557722&location_lng=-111.84837341308594&start=";
// TODO: get the phone's gps
// missing: "2018-07-08T15:26:05Z" &end= "2018-07-09T15:26:05Z". (timeframe)
// Added just before making the fetch.
export default class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = { data: null};
  }

  componentDidMount() {

    // Set background GPS tracking parameters
    BackgroundGeolocation.configure({
      desiredAccuracy:BackgroundGeolocation.MEDIUM_ACCURACY, // accuracy levels directly affect battery drain
      stationaryRadius:20, //  minimum distance (meters) for tracking to engage
      distanceFilter:60, // minimum distance for a location update
      startOnBoot:true, // background tracking starts when phone starts
      stopOnTerminate:false, // keeps going if app is closed
      locationProvider:BackgroundGeolocation.DISTANCE_FILTER_PROVIDER, // Uses Stationary API and elastic distance filter. Optimal battery and data usage.
      interval:60000, // minimum time (ms) between location updates
      fastestInterval:20000, // fastest time (ms) app can handle location updates
      activitiesInterval:10000 // rate at which phone movements are recognized
    });

    // Handle locations
    BackgroundGeolocation.on('location', (location) => {

      // Background tasks are necessary for long-running operations on iOS
      BackgroundGeolocation.startTask( taskKey => {
        location
        // Just starting with the last 24 hours
        today = moment().format();
        yesterday = moment().subtract(1, 'days').format();

        // Change today and yesterday to match api requirements
        today_formatted = today.substring(0, 19) + 'Z';
        yesterday_fromatted = yesterday.substring(0, 19) + 'Z';
        APIurlTotal = APIurl + yesterday_fromatted + "&end=" + today_formatted;

        // Get data from the database
        fetch(APIurlTotal)
          .then(response => response.json())
          .then(data =>{ this.setState({ data})});

        BackgroundGeolocation.endTask(taskKey);
      });

    }
    );

  }

  static navigationOptions = {
    header: null,
  };

  render() {
    if(!this.state.data) {
      // Generic loading screen
      return (
        <Text>Loading...</Text>
      );
    }
    // Gets data we've loaded from the database
    const { data } = this.state;
    pm_data = [];

    // Create an array of PM 2.5 data
    for( let i = 0; i < data.length; i++) {
      pm_data.push(data[i].pm25);
    }
    return (
      // Display the data
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

          <LineChart
          style={{ height:300 }}
            data={ pm_data }
            //xAccessor ={({data}) => data.time}
            //yAccessor = {({data}) => data.pm25}
            svg={{stroke: 'rgb(0, 0, 204)'}}
            contentInset={{ top: 20, bottom: 20 }}
            >
            <Grid />
          </LineChart>

        </ScrollView>

      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
