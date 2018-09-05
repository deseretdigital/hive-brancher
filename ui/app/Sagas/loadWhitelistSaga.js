import { call, put } from 'redux-saga/effects';
import { get } from 'qwest';

import Constants from 'AppConstants';

export default function* loadWhitelistSaga() {
    const whitelist = yield call(fetchWhitelist);
    yield put({ type: Constants.SET_WHITELIST, payload: whitelist });
}

function fetchWhitelist() {
    return get(`/whitelist`).then((xhr, resp) => resp);
}
