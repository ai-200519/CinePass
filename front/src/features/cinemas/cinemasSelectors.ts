import type { RootState } from '../../app/store';

export const selectCinemasState = (state: RootState) => state.cinemas;
export const selectCinemas = (state: RootState) => state.cinemas.cinemas;
export const selectCinemasFetchStatus = (state: RootState) => state.cinemas.fetchStatus;
export const selectCinemasError = (state: RootState) => state.cinemas.error;
export const selectCinemasCreateState = (state: RootState) => state.cinemas.createCinema;
export const selectCinemasUpdateState = (state: RootState) => state.cinemas.updateCinema;
export const selectCinemasDeleteState = (state: RootState) => state.cinemas.deleteCinema;
