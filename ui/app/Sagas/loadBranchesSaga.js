import { call, put } from 'redux-saga/effects';
import { get } from 'qwest';
import { delay } from 'redux-saga';

import Constants from 'AppConstants';

export default function* loadBranchesSaga() {
  let tries = 0;
  let branches = [];
  do {
    yield call(delay, 1000);
    try {
      branches = yield call(fetchBranches);
    } catch(err) {}
    tries++;
  } while (branches.length === 0 && tries < 10);
  yield put({ type: Constants.SET_BRANCHES, payload: branches });
}

function fetchBranches() {
  return get(`/branches`).then((xhr, resp) => resp);
}
