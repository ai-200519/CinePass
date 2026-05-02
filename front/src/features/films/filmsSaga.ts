import { call, put, takeLatest } from 'redux-saga/effects';
import { filmsApi, type Film } from './filmsApi';
import { filmsActions } from './filmsSlice';

function* fetchFilmsSaga() {
  try {
    const films: Film[] = yield call(filmsApi.getAll);
    yield put(filmsActions.fetchFilmsSucceeded(films));
  } catch (error: any) {
    yield put(filmsActions.fetchFilmsFailed({ error: error?.response?.data?.message || error.message }));
  }
}

function* createFilmSaga(action: ReturnType<typeof filmsActions.createFilmRequested>) {
  try {
    // filmsApi.create() fait POST puis retourne getAll()
    const films: Film[] = yield call(filmsApi.create, action.payload);
    yield put(filmsActions.createFilmSucceeded(films));
  } catch (error: any) {
    const msg = error?.response?.data?.message;
    yield put(filmsActions.createFilmFailed({
      error: Array.isArray(msg) ? msg.join(', ') : msg || error.message,
    }));
  }
}

function* updateFilmSaga(action: ReturnType<typeof filmsActions.updateFilmRequested>) {
  try {
    // filmsApi.update() fait PATCH puis retourne getById()
    const film: Film = yield call(filmsApi.update, action.payload.id, action.payload.film);
    yield put(filmsActions.updateFilmSucceeded(film));
  } catch (error: any) {
    const msg = error?.response?.data?.message;
    yield put(filmsActions.updateFilmFailed({
      error: Array.isArray(msg) ? msg.join(', ') : msg || error.message,
    }));
  }
}

function* deleteFilmSaga(action: ReturnType<typeof filmsActions.deleteFilmRequested>) {
  try {
    yield call(filmsApi.delete, action.payload);
    yield put(filmsActions.deleteFilmSucceeded(action.payload));
  } catch (error: any) {
    yield put(filmsActions.deleteFilmFailed({ error: error?.response?.data?.message || error.message }));
  }
}

export function* filmsSaga() {
  yield takeLatest(filmsActions.fetchFilmsRequested.type, fetchFilmsSaga);
  yield takeLatest(filmsActions.createFilmRequested.type, createFilmSaga);
  yield takeLatest(filmsActions.updateFilmRequested.type, updateFilmSaga);
  yield takeLatest(filmsActions.deleteFilmRequested.type, deleteFilmSaga);
}