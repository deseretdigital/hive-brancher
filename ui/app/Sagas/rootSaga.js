import loadWhitelistSaga from 'Sagas/loadWhitelistSaga';
import saveWhitelistSaga from 'Sagas/saveWhitelistSaga';
import loadBranchesSaga from 'Sagas/loadBranchesSaga';

import Constants from 'AppConstants';

import { takeEvery } from 'redux-saga/effects';

export default function* rootSaga() {
    yield [
        takeEvery(Constants.LOAD_WHITELIST, loadWhitelistSaga),
        takeEvery(Constants.SAVE_WHITELIST, saveWhitelistSaga),
        takeEvery(Constants.LOAD_BRANCHES, loadBranchesSaga),
    ];
};
