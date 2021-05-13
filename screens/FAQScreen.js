import renderIf from './renderif';
import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AppRegistry,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
} from 'react-native';


export default class FAQScreen extends Component {
  constructor(props){
    super(props);
    this.state ={
      statusPM:false,
      statusAQ:false,
      statusReport:false,
      statusData:false
    }
  }

  //AQ&U logo at the top-center of screen
  static navigationOptions = {
    headerTitle: (
    <Image 
    style = {{alignSelf: 'center'}}
    source={require('../assets/images/title.png')}/>
    ),
  };

  toggleStatusPM(){
    this.setState({
      statusPM:!this.state.statusPM,
      statusAQ:false,
      statusReport:false,
      statusData:false
    });
    console.log('toggle button handler: '+ this.state.statusPM);
  }

  toggleStatusAQ(){
    this.setState({
      statusPM:false,
      statusAQ:!this.state.statusAQ,
      statusReport:false,
      statusData:false
    });
    console.log('toggle button handler: '+ this.state.statusAQ);
  }

  toggleStatusReport(){
    this.setState({
      statusPM:false,
      statusAQ:false,
      statusReport:!this.state.statusReport,
      statusData:false
    });
    console.log('toggle button handler: '+ this.state.statusReport);
  }

  toggleStatusData(){
    this.setState({
      statusPM:false,
      statusAQ:false,
      statusReport:false,
      statusData:!this.state.statusData
    });
    console.log('toggle button handler: '+ this.state.statusData);
  }

  render() {
    return (
      <ScrollView style={{paddingTop:8}}>
        <Text style={styles.title}>
          FAQ
        </Text>

        <TouchableOpacity onPress={()=>this.toggleStatusPM()}>
          <View style={styles.break}>
            <Text style={styles.welcome}>
              PM2.5
            </Text>
          </View>
        </TouchableOpacity>
        {renderIf(this.state.statusPM)(
          <View style={styles.categories}>
            <Text >
              &emsp;PM2.5 is the mass of particulate matter that is smaller than 2.5 µm in diameter, and it is about 1/10th the size of a human hair. This is one of the key pollutants that the US EPA measures because of its potential for adverse health effects, and the Wasatch Front experiences elevated levels of PM2.5 during our wintertime inversions as well as periodically because of dust storms, wild-fires and fireworks. To understand the potential health impacts of PM2.5 concentrations, you can use the following EPA guidance. 24-hour average PM2.5 concentrations greater than:
              {"\n\n"}&emsp;35 µg/m3 are considered unhealthy for sensitive groups
              {"\n"}&emsp;55 µg/m3 are considered unhealthy
              {"\n"}&emsp;150 µg/m3 are considered very unhealthy
              {"\n\n"}&emsp;You can get more information on the health effects of PM2.5 on EPA’s AirNow site.
              </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.airnow.gov')}>
              <Text style={{alignSelf: 'center', color: 'blue'}}>
                {"\n"}AirNow
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={()=>this.toggleStatusAQ()}>
        <View style={styles.break}>
            <Text style={styles.welcome}>
              AQ&U Program
            </Text>
        </View>
        </TouchableOpacity>
        {renderIf(this.state.statusAQ)(
        <View style={styles.categories}>
          <Text >
            &emsp;Over the last few years, low-cost commodity sensors have hit the markets allowing — for the first time — the ability to measure hyperlocal air quality conditions outside of our homes. At the University of Utah, we are building infrastructure that utilizes these new sensors to create accurate measurements of air quality microclimates. 
            {"\n\n"}&emsp;Our Outdoor Air Quality project leverages existing government and community-based air quality efforts to build a dense network of sensors across Salt Lake City. 
            {"\n\n"}&emsp;This project utilizes our research in sensor design, air quality science, computational modeling, and communication of data; furthermore, it relies on citizens to engage, promote, and facilitate science. We are currently looking for Salt Lake City residents to be part of building our outdoor network by hosting sensors at their homes. Want to get involved? 
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('http://www.aqandu.org/request_sensor')}>
              <Text style={{alignSelf: 'center', color: 'blue'}}>
                {"\n"}sign-up here
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('http://www.aqandu.org/airu_sensor')}>
              <Text style={{alignSelf: 'center', color: 'blue'}}>
                {"\n"}learn more
              </Text>
            </TouchableOpacity>
        </View>          
        )}

        <TouchableOpacity onPress={()=>this.toggleStatusReport()}>
        <View style={styles.break}>
            <Text style={styles.welcome}>
              Your Data Report
            </Text>
        </View>
        </TouchableOpacity>
        {renderIf(this.state.statusReport)(
        <View style={styles.categories}>
          <Text style={{alignSelf: 'center', fontWeight:'bold'}}>
            Total Exposure
          </Text>
          <Text >
            {"\n"}&emsp;Total Exposure is a gross estimate of how much PM2.5 you’ve breathed in. Your actual exposure will vary based on breathing rate, level of exertion, body composition and whether you are out-of-doors. Additionally, the data acquired is from a model of PM2.5 concentrations based on readings from nearby sensors. 
            {"\n\n"}&emsp;Total Exposure is calculated using your location data and an assumed respiratory rate of 6 L/min. (.0001 m^3/s)
          </Text>
          <Text style={{alignSelf: 'center', fontWeight:'bold'}}>
            {"\n"}Average PM2.5 Level
          </Text>
          <Text>
            {"\n"}&emsp;The average PM2.5 Level is the average of all PM2.5 data over the reporting period displayed on your exposure graph.
          </Text>
        </View>          
        )}

        <TouchableOpacity onPress={()=>this.toggleStatusData()}>
        <View style={styles.break}>
            <Text style={styles.welcome}>
              Your Location Data
            </Text>
        </View>
        </TouchableOpacity>
        {renderIf(this.state.statusData)(
        <View style={styles.categories}>
          <Text >
            {"\n"}&emsp;We use your phone’s location data only for obtaining PM2.5 data from our servers. The phone’s coordinates and a timestamp for each set of coordinates are saved and stored in a database locally, on your phone.{"\n"}
            {"\n"}&emsp;Your location data will not be sufficient to properly report your exposure until the app has been on your phone for the  specified time frame. Until then, the app will fill in missing data on the graph using your oldest recorded location.{"\n"}
            {"\n"}&emsp;This app currently only services the wasatch front. Location data will not be stored for time spent outside of that range and your exposure report will show concentration levels of 0 for the period.
          </Text>
        </View>          
        )}
        <View style={styles.break}></View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 20,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight:'bold',
    paddingBottom:6,
    paddingTop:6,
  },
  title: {
    fontSize: 32,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 36,
    textAlign: 'center',
    fontWeight:'bold',
    paddingBottom:6,
  },
  categories: {
    borderTopWidth:1,
    borderTopColor:'rgba(96,100,109, 1)',
    padding:6,
    marginTop:6,
    marginBottom:6,
  },
  break: {
    borderTopWidth:1,
    borderTopColor:'rgba(96,100,109, 1)',
    margin:2,
  }
});