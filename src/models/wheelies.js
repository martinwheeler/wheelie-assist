import { APP_NAME } from '../config';
import { AsyncStorage } from 'react-native';

const type = 'wheelies';
export const GET_WHEELIES = `${APP_NAME}/${type}/LOAD`;
export const GET_WHEELIES_SUCCESS = `${APP_NAME}/${type}/LOAD_SUCCESS`;
export const GET_WHEELIES_FAIL = `${APP_NAME}/${type}/LOAD_FAIL`;

export const SAVE_WHEELIE = `${APP_NAME}/${type}/SAVE`;
export const SAVE_WHEELIE_SUCCESS = `${APP_NAME}/${type}/SAVE_SUCCESS`;
export const SAVE_WHEELIE_FAIL = `${APP_NAME}/${type}/SAVE_FAIL`;

const initialState = {
  list: []
};

export default function wheelies (state = initialState, action) {
  switch (action.type) {
    case GET_WHEELIES:
      return { ...state, loading: true };
    case GET_WHEELIES_SUCCESS:
      return { ...state, loading: false, list: action.payload || [] };
    case GET_WHEELIES_FAIL:
      return {
        ...state,
        loading: false,
        error: 'Error while fetching wheelies.'
      };
    case SAVE_WHEELIE:
      return { ...state, loading: true };
    case SAVE_WHEELIE_SUCCESS:
      return { ...state, loading: false, list: action.payload };
    case SAVE_WHEELIE_FAIL:
      debugger;
      return {
        ...state,
        loading: false,
        error: 'Error while saving wheelie.'
      };
    default:
      return state;
  }
}

function fetchingWheelies () {
  return {
    type: GET_WHEELIES
  }
}

function getWheeliesSuccess (wheelies) {
  return {
    type: GET_WHEELIES_SUCCESS,
    payload: wheelies
  }
}

function getWheeliesFailed (error) {
  return {
    type: GET_WHEELIES_FAIL,
    payload: error
  }
}

export function getWheelies () {
  return dispatch => {
    dispatch(fetchingWheelies());

    const storageKey = `${type}`;
    return AsyncStorage.getItem(storageKey)
      .then(wheelies => dispatch(getWheeliesSuccess(wheelies)))
      .catch(error => dispatch(getWheeliesFailed(error)));
  }
}

export function savingWheelie () {
  return {
    type: SAVE_WHEELIE
  }
}

export function wheelieSaved (wheelies) {
  return {
    type: SAVE_WHEELIE_SUCCESS,
    payload: wheelies
  }
}

export function wheelieSaveFailed () {
  return {
    type: SAVE_WHEELIE_FAIL
  }
}

export function saveWheelie (payload) {
  return dispatch => {
    dispatch(savingWheelie());

    return AsyncStorage.setItem(type, JSON.stringify(payload))
      .then(() => dispatch(wheelieSaved(payload)))
      .catch(() => dispatch(wheelieSaveFailed()));
  }
}
