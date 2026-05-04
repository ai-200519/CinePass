import type { RootState } from '../../app/store';

export const selectReservations = (state: RootState) => 
  state.reservations?.reservations ?? [];

export const selectReservationsFetchStatus = (state: RootState) => 
  state.reservations?.fetchStatus ?? 'idle';

export const selectReservationsFetchError = (state: RootState) => 
  state.reservations?.fetchError ?? null;

export const selectUpdateReservationState = (state: RootState) => 
  state.reservations?.updateReservation ?? { status: 'idle', error: null };

export const selectDeleteReservationState = (state: RootState) => 
  state.reservations?.deleteReservation ?? { status: 'idle', error: null };