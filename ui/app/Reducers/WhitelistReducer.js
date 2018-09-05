import Constants from './../AppConstants';
import createReducer from './createReducer';
const initialState = [];

const actionHandlers = {
    [Constants.SET_WHITELIST]: (_, { payload }) => payload
};

export default createReducer(initialState, actionHandlers);
