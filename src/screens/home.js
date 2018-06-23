import React from 'react';
import { autobind } from 'core-decorators';
import { BleManager } from 'react-native-ble-plx';
import { StyleSheet, FlatList, View, Text, Platform } from 'react-native';
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
class App extends React.Component {
  constructor (props) {
    super(props);

    // this.manager = new BleManager()
    // this.state = {}

    this.state = {
      info: 'Default',
      values: {},
      nearbyDevices: [],
      deviceServices: [],
      serviceCharacteristics: [],
      chosenService: null,
      // characteristicValue: 'Nothing read yet...'
    };

    this.prefixUUID = "f000aa"
    this.suffixUUID = "-0451-4000-b000-000000000000"
    this.sensors = {
      0: "Temperature",
      1: "Accelerometer",
      2: "Humidity",
      3: "Magnetometer",
      4: "Barometer",
      5: "Gyroscope"
    }

    this.connectedDevice = this.props.navigation.getParam('device', null);
    this.manager = new BleManager();
  }

  componentWillUnmount () {
    this.manager && this.manager.destroy();
  }

  componentWillMount () {
    if (this.connectedDevice) {
      this.manager.onDeviceDisconnected(this.connectedDevice.id, (error, device) => this.error('The Wheelie Assist has lost connection. Re-connecting...'));
      this.setupNotifications(this.connectedDevice);
    } else {
      this.error('Please re-select your Wheelie Assist device from settings.');
    }
  }

  info(message) {
    this.setState({info: message})
  }

  error(message) {
    this.setState({info: "ERROR: " + message})
  }

  handleDeviceDisconnection (error, device) {
    // TODO: Attempt to reconnect to device after disconnection
    this.error('The wheelie device has lost connection! Attempting to reconnect...');
  }

  setupNotifications(device) {
      device.readCharacteristicForService(serviceUUID, characteristicUUID)
        .then(characteristic => {
          this.connectedCharacteristic = characteristic;
          this.info('Setting value');
          sneakyLog('NATIVE_APP')(base64.decode(characteristic.value));
          // characteristic && characteristic.value && this.info(base64.decode(characteristic.value));
          this.startPollingValue();
        });
  }

  startPollingValue () {
    this.pollingInterval = setInterval(() => {
      // this

      this.connectedCharacteristic.read()
        .then(newValue => {
          this.info(base64.decode(newValue.value));
        });
    }, 500);
  }

  renderDevices ({ item: device }) {
    const handlePress = () => this.connectToDevice(device, { autoConnect: true });
    return (
      <Text onPress={handlePress} style={styles.deviceName}>{device.name}</Text>
    );
  }

  render() {
    const { nearbyDevices, info } = this.state;
    return (
      <View style={styles.container}>
        <Text>Home</Text>
        <Text>{info}</Text>
      </View>
    );
  }
}

export default App;
