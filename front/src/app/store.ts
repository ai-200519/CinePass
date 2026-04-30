import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { authActions, authReducer } from '../features/auth/authSlice';
import { filmsReducer } from '../features/films/filmsSlice';
import { seancesReducer } from '../features/seances/seancesSlice';
import { tokenStorage } from '../services/tokenStorage';
import { rootSaga } from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    films: filmsReducer,
    seances: seancesReducer,
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
