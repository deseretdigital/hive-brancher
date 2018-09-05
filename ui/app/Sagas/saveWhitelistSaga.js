import { call, put } from 'redux-saga/effects';
import { post } from 'qwest';

import Constants from 'AppConstants';

export default function* saveWhitelistSaga({ payload: whitelist }) {
    yield call(saveWhitelist, whitelist);
    yield put({ type: Constants.SET_WHITELIST, payload: whitelist });
}

function saveWhitelist(whitelist) {
    return post(`/save-whitelist`, { whitelist }).then((xhr, resp) => resp);
}
