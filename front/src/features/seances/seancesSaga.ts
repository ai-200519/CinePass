import { call, put, takeLatest } from 'redux-saga/effects';
import { seancesApi, type Seance } from './seancesApi';
import { seancesActions } from './seancesSlice';

function* fetchSeancesSaga() {
  try {
    const seances: Seance[] = yield call(seancesApi.getAll);
    yield put(seancesActions.fetchSeancesSucceeded(seances));
  } catch (error) {
    yield put(seancesActions.fetchSeancesFailed({ error: (error as Error).message }));
  }
}

function* createSeanceSaga(action: ReturnType<typeof seancesActions.createSeanceRequested>) {
  try {
    const seance: Seance = yield call(seancesApi.create, action.payload);
    yield put(seancesActions.createSeanceSucceeded(seance));
  } catch (error) {
    yield put(seancesActions.createSeanceFailed({ error: (error as Error).message }));
  }
}

function* updateSeanceSaga(action: ReturnType<typeof seancesActions.updateSeanceRequested>) {
  try {
    const seance: Seance = yield call(seancesApi.update, action.payload.id, action.payload.seance);
    yield put(seancesActions.updateSeanceSucceeded(seance));
  } catch (error) {
    yield put(seancesActions.updateSeanceFailed({ error: (error as Error).message }));
  }
}

function* deleteSeanceSaga(action: ReturnType<typeof seancesActions.deleteSeanceRequested>) {
  try {
    yield call(seancesApi.delete, action.payload);
    yield put(seancesActions.deleteSeanceSucceeded(action.payload));
  } catch (error) {
    yield put(seancesActions.deleteSeanceFailed({ error: (error as Error).message }));
  }
}

export function* seancesSaga() {
  yield takeLatest(seancesActions.fetchSeancesRequested.type, fetchSeancesSaga);
  yield takeLatest(seancesActions.createSeanceRequested.type, createSeanceSaga);
  yield takeLatest(seancesActions.updateSeanceRequested.type, updateSeanceSaga);
  yield takeLatest(seancesActions.deleteSeanceRequested.type, deleteSeanceSaga);
}
