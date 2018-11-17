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
import moment from 'moment';
import { MonoText } from '../components/StyledText';
import { AreaChart, LineChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';
import {G, Line, LinearGradient, Stop, Defs} from 'react-native-svg';
import * as scale from 'd3-scale';
//import BackgroundGeolocation from 'react-native-background-geolocation';

// Where all our data is obtained
const APIurl = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=40.78756024557722&location_lng=-111.84837341308594&start=";
// TODO: get the phone's gps
// missing: "2018-07-08T15:26:05Z" &end= "2018-07-09T15:26:05Z". (timeframe)
// Added just before making the fetch.

export default class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data:null};

  }

  componentDidMount() {
    // Just starting with the last 24 hours
    today = moment().format();
    yesterday = moment().subtract(1, 'days').format();
          
    // Change today and yesterday to match api requirements
    today_formatted = today.substring(0, 19) + 'Z';
    yesterday_fromatted = yesterday.substring(0, 19) + 'Z';
    APIurlTotal = APIurl + yesterday_fromatted + "&end=" + today_formatted;
          
    // Get data from the database
    return fetch(APIurlTotal)
          .then(response => response.json())
          .then(data =>{ this.setState({ data})});
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
    // Gets data we've loaded from the AQ&U API
    const { data } = this.state;

    pm_data = [];
    time_data = [];

    const Gradient = () => (
      <Defs key={'gradient'}>
        <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
          <Stop offset={'0%'} stopColor={'rgb(255, 98, 98)'}/>
          <Stop offset={'100%'} stopColor={'rgb(162, 89, 255)'}/>
        </LinearGradient>
      </Defs>
    )
    // Create an array of PM 2.5 data
    for( let i = 0; i < data.length; i++) {
      pm_data.push(data[i].pm25);
      time_data.push(moment(data[i].time, "YYYY-MM-DD-HH:mm:ss").format("HH:mm"));
    }
    console.log(time_data);
    return (
      // Display the data
      <View style={{height:260, flexDirection: 'row', margin: 20, marginTop:60}}>
          <YAxis
          data={pm_data}
          numberOfTicks={10}
          svg={{fill:'black',
                fontSize:12,
          }}
          formatLabel={value => ' ' + value + ' '}
          contentInset={{ top: 10, bottom: 10 }}
          />

          <XAxis
              data={ time_data }
              svg={{
                fill: 'black',
                fontSize: 8,
                fontWeight: 'bold',
              }}
              //scale = {scale.scaleBand}
              numberOfTicks={ 6 }
              contentInset={{ left: 10, right: 25 }}
              formatLabel={ (value) => value }
              
          />

          <LineChart
          style={{ flex: 1, marginLeft: 8 }}
            data={ pm_data }
            svg={{stroke: 'url(#gradient)', strokeWidth:2}}
            contentInset={{ top: 10, bottom: 10 }}
            >
            <Gradient/>
          </LineChart>


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
