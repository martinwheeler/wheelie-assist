import { autobind } from 'core-decorators';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';

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
  settingsButtonWrapper: {},
  settingsButtonContainer: {
    padding: 15
  }
});

@autobind
class Settings extends React.Component {
  static navigationOptions = {
    title: `Settings`
  };

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <View style={styles.container}>
        <Text>Settings go here.</Text>
      </View>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
