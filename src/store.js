import { applyMiddleware, combineReducers, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'remote-redux-devtools';
import wheelies from './models/wheelies';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export default createStore(
  combineReducers({
    entities: combineReducers({
      wheelies
    })
  }),
  composeEnhancers(
    applyMiddleware(thunk)
  )
);
