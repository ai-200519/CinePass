import { all, fork } from 'redux-saga/effects';
import { authSaga } from '../features/auth/authSaga';
import { filmsSaga } from '../features/films/filmsSaga';
<<<<<<< HEAD
import { seancesSaga } from '../features/seances/seancesSaga';

export function* rootSaga() {
  yield all([fork(authSaga), fork(filmsSaga), fork(seancesSaga)]);
=======

export function* rootSaga() {
  yield all([fork(authSaga), fork(filmsSaga)]);
>>>>>>> 9100a56f4bf3c6c915e15b17f74b3caaf25caa4c
}
