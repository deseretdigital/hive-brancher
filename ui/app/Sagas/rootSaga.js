import loadWhitelistSaga from 'Sagas/loadWhitelistSaga';
import saveWhitelistSaga from 'Sagas/saveWhitelistSaga';

import Constants from 'AppConstants';

import { takeEvery } from 'redux-saga/effects';

export default function* rootSaga() {
    yield [
        takeEvery(Constants.LOAD_WHITELIST, loadWhitelistSaga),
        takeEvery(Constants.SAVE_WHITELIST, saveWhitelistSaga)
    ];
};
