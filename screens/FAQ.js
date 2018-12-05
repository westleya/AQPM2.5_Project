import renderIf from './renderif';
import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AppRegistry,
  TouchableHighlight,
} from 'react-native';


export default class FAQ extends Component {
  constructor(props){
    super(props);
    this.state ={
      status:false
    }
  }
  
  static navigationOptions = {
    title: 'app.json',
  };

  toggleStatus(){
    this.setState({
      status:!this.state.status
    });
    console.log('toggle button handler: '+ this.state.status);
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight onPress={()=>this.toggleStatus()}>
          <Text style={styles.welcome}>
            touchme
          </Text>
        </TouchableHighlight>
        {renderIf(this.state.status)(
          <Text >
            I am dynamic text View
          </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight:'bold',
  },
});
