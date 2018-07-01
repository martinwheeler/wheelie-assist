import { APP_COLOR } from '../config';
import { autobind } from 'core-decorators';
import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
  StatusBar
} from 'react-native';
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'wheelie-assist.au.auth0.com',
  clientId: 'a3Esov3tdCq7HtBapXFvuKDiqonZoG6F'
});

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
  buttonWrapper: {
    backgroundColor: 'hsla(195, 100%, 44%, 1)',
    // borderWidth: 1,
    borderRadius: 3,
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 15,
    paddingBottom: 15
  },
  buttonLabel: {
    color: '#FFFFFF',
    margin: 0,
    fontWeight: "600",
    fontSize: 16
  }
});

@autobind
class DeviceSelect extends React.Component {
  static navigationOptions = {
    title: 'Wheelie Assist'
  };

  state = {
    loading: false
  };

  componentWillMount () {
    this.attemptAuth();
  }

  async attemptAuth () {
    const { navigation: { navigate } } = this.props;
    this.setState({ loading: true });

    await AsyncStorage.getItem('authCredentials')
      .then((credentials) => {
        const parsedCredentials = JSON.parse(credentials);
        const currentTimestamp = +(new Date().getTime() / 1000).toFixed(0);
        let hasExpired = false;

        if (parsedCredentials) {
          hasExpired = (parsedCredentials.expireTimestamp || 0) < currentTimestamp;
        }

        if (!parsedCredentials || hasExpired) {
          auth0
            .webAuth
            .authorize({
              scope: 'openid profile email',
              audience: 'https://wheelie-assist.au.auth0.com/userinfo'
            })
            .then(async (credentials) => {
              if (credentials) {
                credentials.expireTimestamp = currentTimestamp + credentials.expiresIn;

                await AsyncStorage.setItem('authCredentials', JSON.stringify(credentials));
                navigate('DeviceSelect');
                this.resetLoading();
              }
            })
            .catch(error => console.log(error));
        } else if (parsedCredentials && !hasExpired) {
          navigate('DeviceSelect');
          this.resetLoading();
        }
      });
  }

  resetLoading () {
    setTimeout(() => this.setState({ loading: false }), 420);
  }

  render () {
    const { loading } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={APP_COLOR}
          barStyle="light-content"
        />
        {!loading && (
          <TouchableNativeFeedback
            onPress={this.attemptAuth}
            background={TouchableNativeFeedback.SelectableBackground()}
          >
            <View style={styles.buttonWrapper}>
              <Text style={styles.buttonLabel}>LOGIN</Text>
            </View>
          </TouchableNativeFeedback>
        )}
        {loading && (
          <ActivityIndicator size="large" color="hsla(195, 100%, 44%, 1)"/>
        )}
      </View>
    );
  }
}

export default DeviceSelect;
