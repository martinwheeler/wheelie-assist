import React from 'react';
import { autobind } from 'core-decorators';
import { BleManager } from 'react-native-ble-plx';
import { StyleSheet, FlatList, View, Text, Platform } from 'react-native';
import base64 from 'base-64';
import { RoutableScreens } from './src/route-config';


const sneakyLog = (meta) => (data) => {
  console.log(meta, data);
  return data;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: {
    backgroundColor: '#32b3ff',
    padding: 5,
    margin: 10
  },
  deviceService: {
    backgroundColor: '#00FF00',
    padding: 5,
    margin: 10
  }
});

@autobind
class App extends React.Component {
  constructor (props) {
    super(props);
  }

  render() {
    return (
      <RoutableScreens />
    )
  }
}

export default App;
