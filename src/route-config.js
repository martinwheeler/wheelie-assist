import { createStackNavigator } from 'react-navigation';
import DeviceSelectScreen from './screens/device-select';
import HomeScreen from './screens/home';  
import Auth0Screen from './screens/auth';

export const RoutableScreens =  createStackNavigator(
    {
        Auth0: Auth0Screen,
        DeviceSelect: {
            screen: DeviceSelectScreen
        },
        Home: {
            screen: HomeScreen
        }
    },
    {
        initialRouteName: 'Auth0',
    }
);