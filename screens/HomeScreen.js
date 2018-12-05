import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AppRegistry,
} from 'react-native';
import moment from 'moment';
import { AreaChart, LineChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';
import {G, Line, LinearGradient, Stop, Defs} from 'react-native-svg';

// https://github.com/JesperLekland/react-native-svg-charts-examples/blob/master/storybook/stories/both-axes.js

// Where all our data is obtained
const breathing_rate = .0001; // in cubic meters per second.
const APIurl = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=40.78756024557722&location_lng=-111.84837341308594&start=";
// TODO: get the phone's gps
// missing: "2018-07-08T15:26:05Z" &end= "2018-07-09T15:26:05Z". (timeframe)
// Added just before making the fetch.

export default class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      total_exposure_text: "Total Exposure: ",
      average_exposure_text:"Average PM 2.5 Level: ",
      current_exposure_text:"Current PM 2.5 Level: ",
      data:null};

  }

  static navigationOptions = {
    headerTitle: (
    <Image 
    style = {{alignSelf: 'center'}}
    source={require("./assets/title.png")}/>
    ),
  };

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
    //day_data = [];
    hour_data = [];
    const axesSvg = { fontSize: 10, fill: 'grey' };
    const verticalContentInset = { top: 10, bottom: 10 }
    const xAxisHeight = 30

    const Gradient = () => (
      <Defs key={'gradient'}>
        <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
          <Stop offset={'0%'} stopColor={'rgb(255, 98, 98)'}/>
          <Stop offset={'100%'} stopColor={'rgb(162, 89, 255)'}/>
        </LinearGradient>
      </Defs>
    )
    // Create an array of PM 2.5 data and time data. The data object passed from
    // the AQ&U api is from most recent data to least recent. So, I have to invert the order.
    length_data = data.length;
    total_exposure = 0.0;
    average_exposure = 0.0;

    for( let i = length_data - 1; i >= 0; i--) {
      pm_25 = data[i].pm25;
      total_exposure += pm_25 * breathing_rate * 60;
      average_exposure += pm_25;
      pm_data.push(pm_25);
      if(i % (length_data / 6) == 0) {
        hour_data.push(moment(data[i].time, "YYYY-MM-DD-HH:mm:ss").format("hh:mm"));
        //day_data.push(moment(data[i].time, "YYYY-MM-DD-HH:mm:ss").format("MMM DD"));
      }
    }
    average_exposure = average_exposure / length_data;
    console.log(data);    
    return (
      // Display the data
      <View style={{padding:20, marginTop:60}}>
          <Text style = {styles.getStartedText} >
            {"PM 2.5 Concentration (µg / m³)"}
          </Text>
      <View style={{height:250, flexDirection: 'row'}}>
          <YAxis
          data={pm_data}
          style={{marginBottom:xAxisHeight}}
          numberOfTicks={8}
          svg={axesSvg}
          formatLabel={value => ' ' + value + ' '}
          contentInset={verticalContentInset}
          >
          </YAxis>

          <View style={{flex:1, marginLeft:10, marginRight:10}}>
          <LineChart
          style={{ flex: 1}}
            data={ pm_data }
            svg={{stroke: 'url(#gradient)', strokeWidth:2}}
            contentInset={verticalContentInset}
            >
            <Gradient/>
          </LineChart>

          <XAxis
              style={{marginHorizontal:-10, height:xAxisHeight}}
              data={ hour_data }
              svg={axesSvg}
              numberOfTicks={ 6 }
              contentInset={{ left: 15, right: 15 }}              
              formatLabel={ (_, index) => (hour=parseInt(hour_data[index].substring(0,2))) + ":00"}
          >
          </XAxis>
          </View>
      </View>

      <Text/>
      <Text/>
      <Text style = {styles.getStartedText} >
          {this.state.total_exposure_text}
          {Math.round(total_exposure * 10) / 10} 
          {" µg"}
      </Text>
      <Text/>
      <Text/>
      <Text style = {styles.getStartedText} >
          {this.state.average_exposure_text}
          {Math.round(average_exposure * 10) / 10} 
          {" µg / m³"}
      </Text>
      <Text/>
      <Text/>
      <Text style = {styles.getStartedText} >
          {this.state.current_exposure_text}
          {Math.round(pm_data[length_data - 1] * 10) / 10} 
          {" µg / m³"}
      </Text>
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
    fontWeight:'bold',
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

AppRegistry.registerComponent('TextInANest', () => TextInANest);