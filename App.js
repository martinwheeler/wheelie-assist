import { autobind } from 'core-decorators';
import React from 'react';
import { Provider } from 'react-redux';
import { RoutableScreens } from './src/route-config';
import store from './src/store';

@autobind
class App extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <Provider store={store}>
        <RoutableScreens/>
      </Provider>
    )
  }
}

export default App;
