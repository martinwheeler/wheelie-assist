import React from 'react';
import { autobind } from 'core-decorators';
import { BleManager } from 'react-native-ble-plx';
import { StyleSheet, FlatList, View, Text } from 'react-native';
import base64 from 'base-64';

const sneakyLog = (meta, data) => {
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
      nearbyDevices: [],
      deviceServices: [],
      serviceCharacteristics: [],
      chosenService: null,
      characteristicValue: 'Nothing read yet...'
    };

    this.connectedDevice = null;

    this.manager = new BleManager();
    this.deviceKeyExtractor = (device) => device.id;
    this.serviceKeyExtractor = (service) => service.uuid;
    this.characteristicKeyExtractor = (characteristic) => characteristic.uuid;
  }

  componentWillUnmount () {
    this.manager.destroy();
  }

  componentWillMount () {
    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        this.scanAndConnect();
        subscription.remove();
      }
    }, true);
  }

  scanAndConnect() {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        return;
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

  reconnect() {
    this.manager.destroy();
    this.manager = new BleManager();

    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        this.scanAndConnect();
        subscription.remove();
      }
    }, true);
  }

  connectToDevice (currentDevice) {
    // alert(currentDevice.name);
    this.manager.stopDeviceScan();
    this.manager.connectToDevice(currentDevice.id)
      .then(connectedDevice => {

          connectedDevice.discoverAllServicesAndCharacteristics()
            .then((device) => {
              this.connectedDevice = device;
              // Do work on device with services and characteristics
              device.services()
                .then(services => {
                  this.setState({
                    deviceServices: services
                  });
                })
            })
            .catch((error) => {
              // Handle errors
            });
      });

  }

  getServiceCharacteristics (service) {
    this.connectedDevice.characteristicsForService(service.uuid)
      .then(characteristics => {
        this.setState({ serviceCharacteristics: characteristics })
      })
  }

  readCharacteristic (characteristicId) {
    const { chosenService } = this.state;
    this.connectedDevice.readCharacteristicForService(chosenService.uuid, sneakyLog('NATIVE_APP ID', characteristicId))
      .then(response => {
        this.setState({ characteristicValue: sneakyLog('NATIVE_APP Response', base64.decode(response.value)) });
      })
  }

  renderDevices ({ item: device }) {
    const handlePress = () => this.connectToDevice(device);
    return (
      <Text onPress={handlePress} style={styles.deviceName}>{device.name}</Text>
    );
  }

  renderDeviceServices ({ item: service }) {
    const handlePress = () => {
      this.setState({ chosenService: service });
      this.getServiceCharacteristics(service)
    };
    return (
      <Text onPress={handlePress} style={styles.deviceService}>{service.uuid}</Text>
    );
  }

  renderServiceCharacteristics ({ item: characteristic }) {
    const handlePress = () => {
      this.readCharacteristic(characteristic.uuid);
    };
    return (
      <Text onPress={handlePress} style={styles.deviceService}>{Object.keys(characteristic)}</Text>
    );
  }

  render() {
    const { nearbyDevices, deviceServices, serviceCharacteristics, characteristicValue } = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          data={nearbyDevices}
          keyExtractor={this.deviceKeyExtractor}
          renderItem={this.renderDevices}
        />

        <FlatList
          data={deviceServices}
          keyExtractor={this.serviceKeyExtractor}
          renderItem={this.renderDeviceServices}
        />

        <FlatList
          data={serviceCharacteristics}
          keyExtractor={this.characteristicKeyExtractor}
          renderItem={this.renderServiceCharacteristics}
        />

        <Text>{characteristicValue}</Text>
      </View>
    );
  }
}

export default App;
