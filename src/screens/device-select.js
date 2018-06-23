import React from 'react';
import { autobind } from 'core-decorators';
import { BleManager } from 'react-native-ble-plx';
import { StyleSheet, FlatList, View, Text, Platform, Image, TouchableNativeFeedback } from 'react-native';

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
    paddingTop: 25
  },
  listContainer: {
    paddingTop: 40,
    flex: 1
  },
  summary: {
    fontWeight: "400",
    fontSize: 14,
    paddingLeft: 30,
    paddingRight: 30
  },
  deviceContainer: {
    flex: 1,
    flexDirection: 'row',
    borderColor: 'hsla(272, 0%, 80%, 1)',
    borderBottomWidth: 1,
    padding: 15,
  },
  deviceName: {
    margin: 0,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 24,
    paddingLeft: 10
  },
  deviceService: {
    backgroundColor: '#00FF00',
    padding: 5,
    margin: 10
  }
});

@autobind
class DeviceSelect extends React.Component {
  static navigationOptions = {
    title: 'Select Device',
    headerStyle: {
      backgroundColor: 'hsla(353, 82%, 45%, 1)',
    },
    headerTintColor: '#FFF',
    headerTitleStyle: {
      fontWeight: 'bold',
    }
  };

  constructor (props) {
    super(props);

    this.state = {
      info: '',
      values: {},
      nearbyDevices: [],
      loading: false
    };

    this.deviceKeyExtractor = (device) => device.id;
  }

  componentWillUnmount () {
    this.manager.destroy();
  }

  componentWillMount () {
    this.manager = new BleManager();
    this.setState({ nearbyDevices: [] }); // Clear the list

    if (Platform.OS === 'ios') {
      const subscription = this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
          this.scanDevices();
          subscription.remove();
        }
      })
    } else {
      this.scanDevices();
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
    this.manager && this.manager.stopDeviceScan();

    if (this.connectedDevice) {
      this.manager = new BleManager();
      this.connectedDevice = null;
    }

    return this.manager.isDeviceConnected(chosenDevice.id)
      .then((isConnected) => {
        if (isConnected) {
          this.connectedDevice = chosenDevice;
          return chosenDevice.discoverAllServicesAndCharacteristics();
        } else {
          return chosenDevice.connect()
            .then((device) => {
              this.connectedDevice = device;
              return device.discoverAllServicesAndCharacteristics()
            })
        }
      });
  }

  renderDevices ({ item: device }) {
        const { navigation: { navigate } } = this.props;
        const handlePress = () => {
          this.info(`Connecting to ${device.name}`)
          
          setTimeout(() => this.setState({ loading: true }), 250);

          // TODO: Move the connection logic to the next screen as the lag of navigation
          // feels super janky
          this.connectToDevice(device, { autoConnect: true })
              .then((connectedDevice) => {
                this.setState({ loading: false });
                navigate('Home', { device: connectedDevice })
              })
              .catch(error => {
                this.setState({ loading: false });
                this.error(error);
              });
        };
        return (
          <TouchableNativeFeedback
            onPress={handlePress}
            background={TouchableNativeFeedback.SelectableBackground()}
          >
            <View style={styles.deviceContainer}>
              <Image height={24} source={require('../assets/images/bluetooth.png')} />
              <Text style={styles.deviceName}>{device.name}</Text>
            </View>
          </TouchableNativeFeedback>
        );
  }

  render() {
    const { nearbyDevices, info, loading } = this.state;
    const { navigation: { navigate } } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.summary}>Select your Wheelie Assist from the devices below.</Text>
        {!loading && (
          <FlatList
            style={styles.listContainer}
            data={nearbyDevices}
            keyExtractor={this.deviceKeyExtractor}
            renderItem={this.renderDevices}
          />
        )}
        {loading && (
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
            <Text>{info}</Text>
          </View>
        )}
      </View>
    );
  }
}

export default DeviceSelect;
