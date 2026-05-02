import type { RootState } from '../../app/store';

export const selectSallesState = (state: RootState) => state.salles;
export const selectSalles = (state: RootState) => state.salles.salles;
export const selectSallesFetchStatus = (state: RootState) => state.salles.fetchStatus;
export const selectSallesError = (state: RootState) => state.salles.error;
export const selectSallesUpdateState = (state: RootState) => state.salles.updateSalle;
export const selectSallesDeleteState = (state: RootState) => state.salles.deleteSalle;
export const selectSallesCreateState = (state: RootState) => state.salles.createSalle;