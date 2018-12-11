import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AppRegistry,
  Image,
} from 'react-native';
import moment, {diff} from 'moment';
import { AreaChart, LineChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';
import {G, Line, LinearGradient, Stop, Defs} from 'react-native-svg';
import {SQLite,} from 'expo';

// Documentation for the svg charts I used to show the data:
// https://github.com/JesperLekland/react-native-svg-charts-examples/blob/master/storybook/stories/both-axes.js

const breathing_rate = .0001; // in cubic meters per second.
// Where all our data is obtained
const APIurl = "https://air.eng.utah.edu/dbapi/api/getEstimatesForLocation?location_lat=40.78756024557722&location_lng=-111.84837341308594&start=";
// missing: "2018-07-08T15:26:05Z" &end= "2018-07-09T15:26:05Z". (timeframe)
// Added just before making the fetch, acquired from the db.
// Open the database
const db = SQLite.openDatabase('db.db');

// TODO: get the phone's gps


export default class ReportScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      total_exposure_text: "Total Exposure: ",
      average_pm25_level_text:"Average PM2.5 Level: ",
      current_exposure_text:"Current PM2.5 Level: ",
      timeframe:"",
      data:null};

  }

  //AQ&U logo
  static navigationOptions = {
    headerTitle: (
    <Image 
    style = {{alignSelf: 'center'}}
    source={require('../assets/images/title.png')}/>
    ),
  };

  componentDidMount() {

    present = moment().format();
    present_formatted = present.substring(0, 19) + 'Z';
    past = "";
    APIurlTotal = "";

    //Get data from the server. It's ordered most recent to least recent
    return db.transaction(tx=>
      {tx.executeSql(
        'select timeframe from settings;',
        [],(_,{rows:{_array}}) => 
        {this.state.timeframe = _array[0].timeframe;
          past = moment().subtract(1, this.state.timeframe).format();
          past_formatted = past.substring(0, 19) + 'Z';
          APIurlTotal = APIurl + past_formatted + "&end=" + present_formatted;
          fetch(APIurlTotal)
          .then(response => response.json())
          .then(responseJson =>{ this.setState({ data: responseJson})});
        });
      });
  }

  render() {
    if(!this.state.data) {
      // Generic loading screen
      return (
        <Text style={{alignSelf:'center', paddingTop:250, fontSice:20}}>Loading...</Text>
      );
    }
    // Gets data we've loaded from the AQ&U API
    const { data } = this.state;

    // Arrays for axis ticks and chart data
    pm_data = [];
    timeframe_data = [];

    // Chart constants
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
    average_pm25_level = 0.0;
    time_in_sec = moment(data[0].time, "YYYY-MM-DD-HH:mm:ss").
    diff(moment(data[length_data - 1].time, "YYYY-MM-DD-HH:mm:ss")) / 1000;

    for( let i = length_data - 1; i >= 0; i--) {

      pm_25 = data[i].pm25;
      pm_data.push(pm_25);
      curr_time = moment(data[i].time, "YYYY-MM-DD-HH:mm:ss");

      if( i > 0){
        total_exposure += ((pm_25 + data[i-1].pm25) / 2) * breathing_rate * (
                          moment(moment(data[i - 1].time, "YYYY-MM-DD-HH:mm:ss").diff(curr_time) / 1000));
      }

      if(i % (length_data / 6) == 0) {
        if(this.state.timeframe === 'day'){
          timeframe_data.push(parseInt(curr_time.format("hh")) + ':00');
        }
        else if(this.state.timeframe === 'week') {
          timeframe_data.push(curr_time.format("ddd"));
        }
        else if(this.state.timeframe === 'month'){
          timeframe_data.push(parseInt(curr_time.format("DD")));
        }
        else{
          timeframe_data.push(curr_time.format("MMM"));
        }
      }
    }
    average_pm25_level = total_exposure / (time_in_sec * breathing_rate);
    // console.log(data);  
    // console.log(time_in_sec);
  
    return (
      // Display the data
      <View style={{padding:20, marginTop:20 }}>
          <Text style = {styles.getStartedText} >
            {"PM2.5 Concentration (µg / m³)"}
          </Text>
      <View style={{height:250, flexDirection: 'row'}}>
          <YAxis
          data={pm_data}
          style={{marginBottom:xAxisHeight - 1, borderRightWidth:1, borderColor: 'rgba(96,100,109, 1)'}}
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
              style={{paddingTop:5, marginHorizontal:-10, height:xAxisHeight, borderTopWidth:1, borderColor: 'rgba(96,100,109, 1)'}}
              data={ timeframe_data }
              svg={axesSvg}
              numberOfTicks={ 6 }
              contentInset={{ left: 15, right: 15 }}              
              formatLabel={ (_, index) => (hour=timeframe_data[index])}
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
          {this.state.average_pm25_level_text}
          {Math.round(average_pm25_level * 10) / 10} 
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

AppRegistry.registerComponent("Personal Air Quality Exposure", () => ReportScreen);