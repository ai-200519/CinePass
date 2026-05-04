import { call, put, takeLatest } from 'redux-saga/effects';
import { seancesApi, type Seance, type CreateSeanceDto, type UpdateSeanceDto } from './seancesApi';
import { seancesActions } from './seancesSlice';

function* fetchSeancesSaga() {
  try {
    const seances: Seance[] = yield call(seancesApi.getAll);
    yield put(seancesActions.fetchSeancesSucceeded(seances));
  } catch (error: any) {
    yield put(seancesActions.fetchSeancesFailed({ error: error?.response?.data?.message || error.message }));
  }
}

function* createSeanceSaga(action: ReturnType<typeof seancesActions.createSeanceRequested>) {
  try {
    // ✅ action.payload est déjà un CreateSeanceDto propre
    const seance: Seance = yield call(seancesApi.create, action.payload);
    yield put(seancesActions.createSeanceSucceeded(seance));
  } catch (error: any) {
    const msg = error?.response?.data?.message;
    yield put(seancesActions.createSeanceFailed({
      error: Array.isArray(msg) ? msg.join(', ') : msg || error.message,
    }));
  }
}

function* updateSeanceSaga(action: ReturnType<typeof seancesActions.updateSeanceRequested>) {
  try {
    // ✅ action.payload.seance est un UpdateSeanceDto propre
    const seance: Seance = yield call(seancesApi.update, action.payload.id, action.payload.seance);
    yield put(seancesActions.updateSeanceSucceeded(seance));
  } catch (error: any) {
    const msg = error?.response?.data?.message;
    yield put(seancesActions.updateSeanceFailed({
      error: Array.isArray(msg) ? msg.join(', ') : msg || error.message,
    }));
  }
}

function* deleteSeanceSaga(action: ReturnType<typeof seancesActions.deleteSeanceRequested>) {
  try {
    yield call(seancesApi.delete, action.payload);
    yield put(seancesActions.deleteSeanceSucceeded(action.payload));
  } catch (error: any) {
    yield put(seancesActions.deleteSeanceFailed({ error: error?.response?.data?.message || error.message }));
  }
}

export function* seancesSaga() {
  yield takeLatest(seancesActions.fetchSeancesRequested.type, fetchSeancesSaga);
  yield takeLatest(seancesActions.createSeanceRequested.type, createSeanceSaga);
  yield takeLatest(seancesActions.updateSeanceRequested.type, updateSeanceSaga);
  yield takeLatest(seancesActions.deleteSeanceRequested.type, deleteSeanceSaga);
}