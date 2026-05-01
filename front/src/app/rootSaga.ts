import { all, fork } from 'redux-saga/effects';
import { authSaga } from '../features/auth/authSaga';
import { filmsSaga } from '../features/films/filmsSaga';
import { seancesSaga } from '../features/seances/seancesSaga';

export function* rootSaga() {
  yield all([fork(authSaga), fork(filmsSaga), fork(seancesSaga)]);
}
