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
    yield call(authApi.register, {
      nom: action.payload.nom,
      prenom: action.payload.prenom,
      email: action.payload.email,
      motDePasse: action.payload.password,
      telephone: action.payload.telephone || undefined,
    });
    yield put(authActions.registerSucceeded({ requiresOtp: true }));
  } catch (err) {
    yield put(authActions.registerFailed({ error: getErrorMessage(err) }));
  }
}

function* registerOtpWorker(
  action: ReturnType<typeof authActions.registerOtpRequested>,
): Generator {
  try {
    const data: Awaited<ReturnType<typeof authApi.verifyOtp>> = yield call(authApi.verifyOtp, {
      email: action.payload.email,
      otp: action.payload.otp,
    });
    if (data?.access_token) {
      tokenStorage.set(data.access_token);
      yield put(authActions.loginSucceeded({ token: data.access_token }));
    }
    yield put(authActions.registerOtpSucceeded());
  } catch (err) {
    yield put(authActions.registerOtpFailed({ error: getErrorMessage(err) }));
  }
}

function* logoutWorker(): Generator {
  tokenStorage.clear();
}

function* forgotPasswordWorker(
  action: ReturnType<typeof authActions.forgotPasswordRequested>,
): Generator {
  try {
    yield call(authApi.forgotPassword, { email: action.payload.email });
    yield put(authActions.forgotPasswordSucceeded());
  } catch (err) {
    yield put(authActions.forgotPasswordFailed({ error: getErrorMessage(err) }));
  }
}

function* resetPasswordWorker(
  action: ReturnType<typeof authActions.resetPasswordRequested>,
): Generator {
  try {
    yield call(authApi.resetPassword, {
      email: action.payload.email,
      otp: action.payload.otp,
      newPassword: action.payload.newPassword,
    });
    yield put(authActions.resetPasswordSucceeded());
  } catch (err) {
    yield put(authActions.resetPasswordFailed({ error: getErrorMessage(err) }));
  }
}

export function* authSaga(): Generator {
  yield takeLatest(authActions.loginRequested.type, loginWorker);
  yield takeLatest(authActions.registerRequested.type, registerWorker);
  yield takeLatest(authActions.registerOtpRequested.type, registerOtpWorker);
  yield takeLatest(authActions.logout.type, logoutWorker);
  yield takeLatest(authActions.forgotPasswordRequested.type, forgotPasswordWorker);
  yield takeLatest(authActions.resetPasswordRequested.type, resetPasswordWorker);
}
