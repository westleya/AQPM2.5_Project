import React from 'react';
import {
  Image,
  View,
  Picker,
  Text,
  StyleSheet,
} from 'react-native';

export default class SettingsScreen extends React.Component {
  constructor(props){
    super(props);
    this.state ={
      timeframe:'day',
      accuracy:'low',
      frequency:'5',
    }
  }

  static navigationOptions = {
    headerTitle: (
      <Image 
      style = {{alignSelf: 'center'}}
      source={require('../assets/images/title.png')}/>
      ),
  };

  render() {

    return (
      <View style={{paddingTop:20}}>
        <Text style={styles.title}>
          Settings
        </Text>
        <View style={styles.menuStyle} >
          <View style={{flex:.7}}>
            <Text style={styles.textStyle}>
              Show data from the last:
            </Text>
          </View>

          <View style={{flex:.3}}>
            <Picker
              style = {styles.picker}
              mode="dropdown"
              selectedValue={this.state.timeframe}
              itemStyle={styles.itemStyle}
              onValueChange={(itemValue, itemIndex) => this.setState({timeframe: itemValue})}>
              <Picker.Item label="day" value="day" />
              <Picker.Item label="week" value="week" />
              <Picker.Item label="month" value="month" />
              <Picker.Item label="year" value="year" />
            </Picker>
          </View>
        </View>

        <View style={styles.menuStyle} >
          <View style={{flex:.7}}>
            <Text style={styles.textStyle}>
              Location accuracy:
            </Text>
          </View>

          <View style={{flex:.3}}>
            <Picker
              style = {styles.picker}
              mode="dropdown"
              selectedValue={this.state.accuracy}
              itemStyle={styles.itemStyle}
              onValueChange={(itemValue, itemIndex) => this.setState({accuracy: itemValue})}>
              <Picker.Item label="low" value="low" />
              <Picker.Item label="medium" value="medium" />
              <Picker.Item label="high" value="high" />
            </Picker>
          </View>
        </View>

        <View style={styles.menuStyle} >
          <View style={{flex:.7}}>
            <Text style={styles.textStyle}>
              Get location every:
            </Text>
          </View>

            <View style={{flex:.3}}>
              <Picker
                style = {styles.picker}
                mode="dropdown"
                selectedValue={this.state.timeframe}
                itemStyle={styles.itemStyle}
                onValueChange={(itemValue, itemIndex) => this.setState({timeframe: itemValue})}>
                <Picker.Item label="5 minutes" value="5" />
                <Picker.Item label="10 minutes" value="10" />
                <Picker.Item label="15 minutes" value="15" />
              </Picker>
            </View>
        </View>
      </View>
    );

  }
}

const styles = StyleSheet.create({
  picker: {
    width:100,
    height: 50,
  },
  itemStyle: {
    height:50,
    fontWeight:'bold',
    color:'rgba(96,100,109, 1)',
    fontSize:20,

  },
  textStyle: {
    alignSelf:'center',
    height:25,
    fontWeight:'bold',
    color:'rgba(96,100,109, 1)',
    fontSize:20,

  },
  title: {
    fontSize: 32,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 36,
    textAlign: 'center',
    fontWeight:'bold',
  },
  menuStyle: {
    paddingRight:8,
    paddingLeft:8, 
    flexDirection:'row',
    alignItems:'center',
    flex:1,
    marginTop:75,
  },
});