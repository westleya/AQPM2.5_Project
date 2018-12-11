import React from 'react';
import {  StyleSheet, Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import ReportScreen from '../screens/ReportScreen';
import FAQScreen from '../screens/FAQScreeen';
import SettingsScreen from '../screens/SettingsScreen';

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
          ? `ios-stats${focused ? '' : '-outline'}`
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
      name={Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}` : 'md-options'}
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
      name={Platform.OS === 'ios' ? `ios-information-circle${focused ? '' : '-outline'}` 
      : 'md-information-circle'}
    />
  ),
};

export default createBottomTabNavigator({
  ReportStack,
  SettingsStack,
  FAQStack,
},{ tabBarOptions: {
  style: {
    backgroundColor:"#2B2B2B"
  },
}});
