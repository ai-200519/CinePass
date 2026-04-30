import type { RootState } from '../../app/store';

export const selectSeances = (state: RootState) => state.seances.seances;
export const selectFetchSeancesStatus = (state: RootState) => state.seances.fetchSeances.status;
export const selectFetchSeancesError = (state: RootState) => state.seances.fetchSeances.error;
export const selectCreateSeanceStatus = (state: RootState) => state.seances.createSeance.status;
export const selectCreateSeanceError = (state: RootState) => state.seances.createSeance.error;
export const selectUpdateSeanceStatus = (state: RootState) => state.seances.updateSeance.status;
export const selectUpdateSeanceError = (state: RootState) => state.seances.updateSeance.error;
export const selectDeleteSeanceStatus = (state: RootState) => state.seances.deleteSeance.status;
export const selectDeleteSeanceError = (state: RootState) => state.seances.deleteSeance.error;
