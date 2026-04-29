import type { AxiosError } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { authApi } from '../../services/authApi';
import { tokenStorage } from '../../services/tokenStorage';
import { authActions } from './authSlice';

function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<any>;
  const message =
    axiosError?.response?.data?.message ??
    axiosError?.response?.data?.error ??
    axiosError?.message ??
    'Unexpected error';

  return Array.isArray(message) ? message.join(', ') : String(message);
}

function* loginWorker(action: ReturnType<typeof authActions.loginRequested>): Generator {
  try {
    const data: Awaited<ReturnType<typeof authApi.login>> = yield call(authApi.login, {
      email: action.payload.email,
      motDePasse: action.payload.password,
    });
    tokenStorage.set(data.access_token);
    yield put(authActions.loginSucceeded({ token: data.access_token }));
  } catch (err) {
    yield put(authActions.loginFailed({ error: getErrorMessage(err) }));
  }
}

function* registerWorker(action: ReturnType<typeof authActions.registerRequested>): Generator {
  try {
    const data: Awaited<ReturnType<typeof authApi.register>> = yield call(authApi.register, {
      nom: action.payload.nom,
      prenom: action.payload.prenom,
      email: action.payload.email,
      motDePasse: action.payload.password,
      telephone: action.payload.telephone || undefined,
    });
    tokenStorage.set(data.access_token);
    yield put(authActions.loginSucceeded({ token: data.access_token }));
    yield put(authActions.registerSucceeded());
  } catch (err) {
    yield put(authActions.registerFailed({ error: getErrorMessage(err) }));
  }
}

function* logoutWorker(): Generator {
  tokenStorage.clear();
}

export function* authSaga(): Generator {
  yield takeLatest(authActions.loginRequested.type, loginWorker);
  yield takeLatest(authActions.registerRequested.type, registerWorker);
  yield takeLatest(authActions.logout.type, logoutWorker);
}
