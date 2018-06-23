import React from 'react';
import { autobind } from 'core-decorators';
import { BleManager } from 'react-native-ble-plx';
import { StyleSheet, FlatList, View, Text, Platform, Button } from 'react-native';
import base64 from 'base-64';

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

    this.state = {
      info: '',
      values: {},
      nearbyDevices: []
    };

    this.manager = new BleManager();
    this.deviceKeyExtractor = (device) => device.id;
  }

  componentWillUnmount () {
    this.manager && this.manager.destroy();
  }

  componentWillMount () {
    if (Platform.OS === 'ios') {
      this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') this.scanDevices()
      })
    } else {
      this.scanDevices()
    }
  }

  info(message) {
    this.setState({info: message})
  }

  error(message) {
    this.setState({info: "ERROR: " + message})
  }

  scanDevices() {
    this.manager.startDeviceScan(
      null,
      null,
      (error, device) => {
        this.info("Scanning...")

        if (error) {
          this.error(error.message)
          return
        }

        if (device.name) {
          const containsDevice = this.state.nearbyDevices.find(currentDevice => device.name === currentDevice.name);
  
          if (!containsDevice) {
            this.setState({
              nearbyDevices: [
                ...new Set([
                  ...this.state.nearbyDevices,
                  device
                ]),
              ]
            });
          }
        }
      });
  }

  connectToDevice (chosenDevice, args) {
    this.info(`Connecting to ${chosenDevice.name}`);
    this.manager.stopDeviceScan();

    // chosenDevice.onDisconnected(this.handleDeviceDisconnection);
    return chosenDevice.connect(args)
      .then((device) => {
        this.connectedDevice = device;
        this.info("Discovering services and characteristics")
        return device.discoverAllServicesAndCharacteristics()
      });
  }

  renderDevices ({ item: device }) {
        const { navigation: { navigate } } = this.props;
        const handlePress = () => {
            this.connectToDevice(device, { autoConnect: true })
                .then((connectedDevice) => navigate('Home', { device: connectedDevice }));
        };
        return (
            <Text onPress={handlePress} style={styles.deviceName}>{device.name}</Text>
        );
  }

  render() {
    const { nearbyDevices, info } = this.state;
    const { navigation: { navigate } } = this.props;
    return (
      <View style={styles.container}>
        <Text>Select the Wheelie Assist from the devices below.</Text>
        <FlatList
          data={nearbyDevices}
          keyExtractor={this.deviceKeyExtractor}
          renderItem={this.renderDevices}
        />
        <Text>{info}</Text>
      </View>
    );
  }
}

export default App;
