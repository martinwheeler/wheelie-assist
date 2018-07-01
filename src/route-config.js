import { createStackNavigator } from 'react-navigation';
import Auth0Screen from './screens/auth';
import DeviceSelectScreen from './screens/device-select';
import HomeScreen from './screens/home';
import SettingsScreen from './screens/settings';
import { Button } from 'react-native';
import React from 'react';

export const RoutableScreens = createStackNavigator(
  {
    Auth0: Auth0Screen,
    DeviceSelect: DeviceSelectScreen,
    Home: HomeScreen,
    Settings: SettingsScreen
  },
  {
    initialRouteName: 'Auth0',
    navigationOptions: {
      headerStyle: {
        backgroundColor: 'hsla(353, 82%, 45%, 1)'
      },
      headerTintColor: '#FFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }
  }
);
