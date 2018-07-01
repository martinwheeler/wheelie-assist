import base64 from 'base-64';
import { autobind } from 'core-decorators';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { characteristicUUID, serviceUUID } from '../config';
import { getWheelies, saveWheelie } from '../models/wheelies';

const sneakyLog = (meta) => (data) => {
  console.log(meta, data);
  return data;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
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
  },
  settingsButtonWrapper: {
  },
  settingsButtonContainer: {
    padding: 15
  }
});

@autobind
class Home extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: `Connected to ${navigation.getParam('device', 'Unknown').name}`,
      headerRight: (
        <View style={{ borderRadius: 100, overflow: 'hidden' }}>
          <TouchableNativeFeedback
            onPress={() => navigation.navigate('Settings')}
            background={TouchableNativeFeedback.SelectableBackground()}
            style={styles.settingsButtonWrapper}
          >
            <View style={styles.settingsButtonContainer}>
              <Icon
                name='settings'
                color='#FFFFFF'
              />
            </View>
          </TouchableNativeFeedback>
        </View>
      )
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
    this.props.getWheelies();

    if (this.connectedDevice && this.manager) {
      this.manager.onDeviceDisconnected(
        this.connectedDevice.id,
        (error, device) => this.error('The Wheelie Assist has lost connection. Re-connecting...')
      );
      this.setupNotifications(this.connectedDevice);
    } else {
      this.error('Please re-select your Wheelie Assist device from settings.');
    }
  }

  angle (value) {
    // Short-circuit to prevent unwanted updates to the angle
    if (!value) return;
    const { saveWheelie, wheelies } = this.props;
    const newRecord = { angle: value, created: new Date().getTime() };

    saveWheelie([ ...wheelies.list, newRecord ]);
    this.setState({ angle: value });
  }

  error (message) {
    this.setState({ error: "ERROR: " + message })
  }

  handleDeviceDisconnection (error, device) {
    // TODO: Attempt to reconnect to device after disconnection
    this.error('The wheelie device has lost connection! Attempting to reconnect...');
  }

  setupNotifications (device) {
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
      transform: [ { rotate: `-${angle}deg` } ]
    }
  }

  render () {
    const { error, angle } = this.state;
    const { list } = this.props.wheelies;

    return (
      <View style={styles.container}>
        {
          [
            angle >= 0 && !error && (
              <Image key={'wheelie-picture'} style={this.motorcycleStyles()}
                     source={require('../assets/images/motorcycle.png')}/>
            ),
            error && (
              <Text key={'error-message'}>{error}</Text>
            ),
            list.length === -1 && (
              <ScrollView key={'scroll-view'} style={{ height: 50 }}>
                {list.map(wheelie => (
                  <Text>{wheelie.angle} - {wheelie.created}</Text>
                ))}
              </ScrollView>
            )
          ].filter(Boolean)
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({
  wheelies: state.entities.wheelies
});

const mapDispatchToProps = dispatch => ({
  getWheelies: () => dispatch(getWheelies()),
  saveWheelie: payload => dispatch(saveWheelie(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
