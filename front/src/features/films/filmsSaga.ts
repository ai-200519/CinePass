import { call, put, takeLatest } from 'redux-saga/effects';
import { filmsApi, type Film } from './filmsApi';
import { filmsActions } from './filmsSlice';

function* fetchFilmsSaga() {
  try {
    const films: Film[] = yield call(filmsApi.getAll);
    yield put(filmsActions.fetchFilmsSucceeded(films));
  } catch (error) {
    yield put(filmsActions.fetchFilmsFailed({ error: (error as Error).message }));
  }
}

function* createFilmSaga(action: ReturnType<typeof filmsActions.createFilmRequested>) {
  try {
    const film: Film = yield call(filmsApi.create, action.payload);
    yield put(filmsActions.createFilmSucceeded(film));
  } catch (error) {
    yield put(filmsActions.createFilmFailed({ error: (error as Error).message }));
  }
}

function* updateFilmSaga(action: ReturnType<typeof filmsActions.updateFilmRequested>) {
  try {
    const film: Film = yield call(filmsApi.update, action.payload.id, action.payload.film);
    yield put(filmsActions.updateFilmSucceeded(film));
  } catch (error) {
    yield put(filmsActions.updateFilmFailed({ error: (error as Error).message }));
  }
}

function* deleteFilmSaga(action: ReturnType<typeof filmsActions.deleteFilmRequested>) {
  try {
    yield call(filmsApi.delete, action.payload);
    yield put(filmsActions.deleteFilmSucceeded(action.payload));
  } catch (error) {
    yield put(filmsActions.deleteFilmFailed({ error: (error as Error).message }));
  }
}

export function* filmsSaga() {
  yield takeLatest(filmsActions.fetchFilmsRequested.type, fetchFilmsSaga);
  yield takeLatest(filmsActions.createFilmRequested.type, createFilmSaga);
  yield takeLatest(filmsActions.updateFilmRequested.type, updateFilmSaga);
  yield takeLatest(filmsActions.deleteFilmRequested.type, deleteFilmSaga);
}