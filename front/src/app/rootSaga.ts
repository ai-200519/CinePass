import { all, fork } from 'redux-saga/effects';
import { authSaga } from '../features/auth/authSaga';
import { filmsSaga } from '../features/films/filmsSaga';

export function* rootSaga() {
  yield all([fork(authSaga), fork(filmsSaga)]);
}
