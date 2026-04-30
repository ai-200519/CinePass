import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { authActions, authReducer } from '../features/auth/authSlice';
import { filmsActions, filmsReducer } from '../features/films/filmsSlice';
import { tokenStorage } from '../services/tokenStorage';
import { rootSaga } from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    films: filmsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

// Bootstrap auth token (browser only)
const initialToken = typeof window !== 'undefined' ? tokenStorage.get() : null;
store.dispatch(authActions.hydrateFromStorage({ token: initialToken }));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
