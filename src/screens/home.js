import React from 'react';
import { autobind } from 'core-decorators';
import { BleManager } from 'react-native-ble-plx';
import { StyleSheet, FlatList, View, Text, Platform, Image } from 'react-native';
import base64 from 'base-64';
import { serviceUUID, characteristicUUID } from '../config';

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
class Home extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: `Connected to ${navigation.getParam('device', 'Unknown').name}`,
      headerStyle: {
        backgroundColor: 'hsla(353, 82%, 45%, 1)',
      },
      headerTintColor: '#FFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    };
  };

  constructor (props) {
    super(props);

    this.state = {
      angle: 0,
      error: null,
      values: {}
    };
  }

  componentWillUnmount () {
    this.manager.cancelDeviceConnection(this.connectedDevice.id)
    this.manager.destroy();
    clearInterval(this.pollingInterval);
  }

  componentWillMount () {
    this.connectedDevice = this.props.navigation.getParam('device', null);
    this.manager = new BleManager();

    if (this.connectedDevice && this.manager) {
      this.manager.onDeviceDisconnected(this.connectedDevice.id, (error, device) => this.error('The Wheelie Assist has lost connection. Re-connecting...'));
      this.setupNotifications(this.connectedDevice);
    } else {
      this.error('Please re-select your Wheelie Assist device from settings.');
    }
  }

  angle (value) {
    // Short-circuit to prevent unwanted updates to the angle
    if (!value) return;

    this.setState({ angle: value })
  }

  error(message) {
    this.setState({ error: "ERROR: " + message })
  }

  handleDeviceDisconnection (error, device) {
    // TODO: Attempt to reconnect to device after disconnection
    this.error('The wheelie device has lost connection! Attempting to reconnect...');
  }

  setupNotifications(device) {
      device.readCharacteristicForService(serviceUUID, characteristicUUID)
        .then(characteristic => {
          this.connectedCharacteristic = characteristic;
          this.startPollingValue();
        });
  }

  startPollingValue () {
    this.pollingInterval = setInterval(() => {
      this.connectedCharacteristic.read()
        .then(newValue => {
          this.angle(parseInt(base64.decode(newValue.value)));
        });
    }, 500);
  }

  motorcycleStyles () {
    const { angle } = this.state;

    return {
      transform: [{ rotate: `-${angle}deg` }]
    }
  }

  render() {
    const { error, angle } = this.state;

    return (
      <View style={styles.container}>
        {
          [
            angle >= 0 && !error && (
              <Image style={this.motorcycleStyles()} source={require('../assets/images/motorcycle.png')} />
            ),
            error && (
              <Text>{error}</Text>
            )
          ].filter(Boolean)
        }
      </View>
    );
  }
}

export default Home;
