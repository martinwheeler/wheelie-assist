import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const sneakyLog = (meta, data) => {
  console.log(meta, data);
  return data;
};

export default class App extends React.Component {

  constructor (props) {
    super(props);
    this.manager = new BleManager();
    this.logValue = sneakyLog('Wooooo');
    this.scanAndConnect = this.scanAndConnect.bind(this);
    this.reconnect = this.reconnect.bind(this);
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
        return
      }

      // Check if it is a device you are looking for based on advertisement data
      // or other criteria.
      if (sneakyLog('SCANNING: ', device.name) === 'LE-Deep Space Fine') {

        // Stop scanning as it's not necessary if you are scanning for one device.
        this.manager.stopDeviceScan();

        // Proceed with connection.
        device.connect()
          .then((device) => {
            device.isConnected()
              .then(response => {
                sneakyLog('isConnected: ', response);
              });
            return sneakyLog('Characteristics: ', device.discoverAllServicesAndCharacteristics());
          })
          .then((device) => {
            // Do work on device with services and characteristics
            device.services()
              .then(response => {
                console.log('services: ', response[0]['_manager']['_eventEmitter']['_subscriber']['_subscriptionsForType']['hardwareBackPress']);
              });
          })
          .catch((error) => {
            // Handle errors
          });
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

  render() {
    return (
      <View style={styles.container}>
        <Text>Hello World!</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menu.</Text>
        <Button title={'reconnect'} onPress={this.reconnect}>Reconnect</Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
