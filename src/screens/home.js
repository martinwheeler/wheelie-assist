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
      info: '',
      values: {}
    };
  }

  componentWillUnmount () {
    this.manager.cancelDeviceConnection(this.connectedDevice.id)
    this.manager.destroy();
  }

  componentWillMount () {
    this.connectedDevice = this.props.navigation.getParam('device', null);
    this.manager = new BleManager();

    // this.manager.connectedDevices([serviceUUID])
    //   .then(devices => {
    //     console.log('NATIVE_APP', devices);
    //     const [myDevice] = devices;
    //     myDevice.isConnected()
    //       .then(response => {
    //         if (!response) return myDevice.connect();
    //       })
    //       .then(() => {
    //         console.log('NATIVE_APP Connected', response)
    //       })
    //   })

    if (this.connectedDevice && this.manager) {
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
          this.startPollingValue();
        });
  }

  startPollingValue () {
    this.pollingInterval = setInterval(() => {
      this.connectedCharacteristic.read()
        .then(newValue => {
          this.info(base64.decode(newValue.value));
        });
    }, 500);
  }

  render() {
    const { info } = this.state;
    return (
      <View style={styles.container}>
        <Text>Wheelie Angle: {info || '0'} degrees</Text>
      </View>
    );
  }
}

export default Home;
