import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { routerReducer } from 'react-router-redux';

import app from './app';
import userlogin from './userlogin';
import routers from './routers';
import product from './product';
import device from './devices';
import vote from './vote';
import realtimealarm from './realtimealarm';
import historydevice from './historydevice';

export default combineReducers({
  	app,
    device,
    historydevice,
    realtimealarm,
  	userlogin,
    vote,
    product,
  	form: formReducer,
  	router: routerReducer,
  	routers,
});
