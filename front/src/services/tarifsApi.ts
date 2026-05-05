import { http } from './http';

export type TypePublic = 'NORMAL' | 'ETUDIANT' | 'ENFANT' | 'SENIOR' | string;

export type Tarif = {
  id_tarif: number;
  typePublic: TypePublic;
  prix: number;
};

export type CreateTarifDto = {
  typePublic: TypePublic;
  prix: number;
  id_seance: number;
};

export type UpdateTarifDto = {
  prix?: number;
};

export const tarifsApi = {
  bySeance: (idSeance: number) => http.get<Tarif[]>(`/tarif/seance/${idSeance}`).then((r) => r.data),
  create: (dto: CreateTarifDto) => http.post('/tarif', dto).then((r) => r.data),
  update: (idTarif: number, dto: UpdateTarifDto) => http.put(`/tarif/${idTarif}`, dto).then((r) => r.data),
  remove: (idTarif: number) => http.delete(`/tarif/${idTarif}`).then((r) => r.data),
};
