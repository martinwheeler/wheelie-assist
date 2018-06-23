import { createStackNavigator } from 'react-navigation';
import DeviceSelectScreen from './screens/device-select';
import HomeScreen from './screens/home';  

export const RoutableScreens =  createStackNavigator(
    {
        DeviceSelect: {
            screen: DeviceSelectScreen
        },
        Home: {
            screen: HomeScreen
        }
    },
    {
        initialRouteName: 'DeviceSelect',
    }
);