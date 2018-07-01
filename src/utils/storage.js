import { autobind } from 'core-decorators';
import { AsyncStorage } from 'react-native';

@autobind
class LocalStorage {
  static getItem (key) {
    return AsyncStorage.getItem(key);
  }

  static setItem (key, payload) {
    return AsyncStorage.setItem(key, JSON.stringify(payload));
  }
}

export default LocalStorage;
