import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import type { LeafletEvent, Map as LeafletMap, Marker as LeafletMarker, LeafletMouseEvent } from 'leaflet';
import L from 'leaflet';
import {
  Building2,
  Crosshair,
  LayoutGrid,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Table2,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { Cinema, CreateCinemaDto, UpdateCinemaDto } from '../../features/cinemas/cinemasApi';
import {
  selectCinemas,
  selectCinemasCreateState,
  selectCinemasDeleteState,
  selectCinemasError,
  selectCinemasFetchStatus,
  selectCinemasUpdateState,
} from '../../features/cinemas/cinemasSelectors';
import { createCinema, deleteCinema, fetchCinemas, updateCinema } from '../../features/cinemas/cinemasSlice';

const emptyFormState = {
  id_cinema: 0,
  nom: '',
  adresse: '',
  ville: '',
  telephone: '',
  latitude: '',
  longitude: '',
};

type CinemaFormState = typeof emptyFormState;

const toFormState = (cinema: Cinema): CinemaFormState => ({
  id_cinema: cinema.id_cinema,
  nom: cinema.nom,
  adresse: cinema.adresse ?? '',
  ville: cinema.ville ?? '',
  telephone: cinema.telephone ?? '',
  latitude: cinema.latitude?.toString() ?? '',
  longitude: cinema.longitude?.toString() ?? '',
});

type ViewMode = 'grid' | 'table';

type SortKey = 'id' | 'nom' | 'adresse' | 'ville' | 'telephone';
type SortDir = 'asc' | 'desc';

function formatCoord(n: number | null) {
  if (n == null) return '—';
  return n.toFixed(6);
}

const redPinIcon = L.divIcon({
  className: 'cinema-pin',
  html: '<div class="cinema-pin__dot"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapClick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CinemaMapPicker({
  latitude,
  longitude,
  onPick,
}: {
  latitude: string;
  longitude: string;
  onPick: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<LeafletMap | null>(null);
  const [query, setQuery] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const latNum = Number(latitude);
  const lngNum = Number(longitude);
  const hasMarker = Number.isFinite(latNum) && Number.isFinite(lngNum);
  const markerPos = hasMarker ? ([latNum, lngNum] as [number, number]) : null;

  const defaultCenter: [number, number] = markerPos ?? [33.5731, -7.5898];

  const flyTo = (lat: number, lng: number, zoom = 14) => {
    mapRef.current?.flyTo([lat, lng], zoom, { duration: 0.6 });
  };

  const onSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setGeoLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      const first = data?.[0];
      if (!first) {
        toast.error('Aucun résultat pour cette recherche');
        return;
      }
      const lat = Number(first.lat);
      const lng = Number(first.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      flyTo(lat, lng, 13);
    } catch {
      toast.error('Recherche impossible');
    } finally {
      setGeoLoading(false);
    }
  };

  const onLocate = async () => {
    if (!('geolocation' in navigator)) {
      toast.error("Géolocalisation non disponible");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        flyTo(lat, lng, 15);
        onPick(lat, lng);
      },
      () => toast.error('Impossible de récupérer votre position'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void onSearch();
            }}
            placeholder="Rechercher une ville…"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 text-sm font-semibold text-zinc-200 outline-none focus:border-white/20"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void onSearch()}
            disabled={geoLoading}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white/5 px-4 text-sm font-black text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.10)] transition hover:bg-white/10 disabled:opacity-60"
          >
            {geoLoading ? '…' : 'Aller'}
          </button>
          <button
            type="button"
            onClick={() => void onLocate()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.10)] transition hover:bg-white/10"
            aria-label="Me localiser"
            title="Me localiser"
          >
            <Crosshair className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <MapContainer
          ref={mapRef}
          center={defaultCenter}
          zoom={markerPos ? 15 : 11}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClick
            onPick={(lat, lng) => {
              onPick(lat, lng);
              flyTo(lat, lng, 15);
            }}
          />
          {markerPos ? (
            <Marker
              position={markerPos}
              icon={redPinIcon}
              draggable
              eventHandlers={{
                dragend: (e: LeafletEvent) => {
                  const marker = e.target as LeafletMarker;
                  const ll = marker.getLatLng();
                  onPick(ll.lat, ll.lng);
                },
              }}
            />
          ) : null}
        </MapContainer>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-black uppercase tracking-wide text-zinc-400">Latitude</label>
          <input
            value={latitude}
            readOnly
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 font-mono text-sm font-semibold text-zinc-200"
          />
        </div>
        <div>
          <label className="text-xs font-black uppercase tracking-wide text-zinc-400">Longitude</label>
          <input
            value={longitude}
            readOnly
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 font-mono text-sm font-semibold text-zinc-200"
          />
        </div>
      </div>
    </div>
  );
}

function SummaryChip({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-black text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <Icon className="h-4 w-4 text-[#E50914]" aria-hidden="true" />
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-100">{value}</span>
    </div>
  );
}

export default function AdminCinemasPage() {
  const dispatch = useAppDispatch();
  const cinemas = useAppSelector(selectCinemas);
  const fetchStatus = useAppSelector(selectCinemasFetchStatus);
  const fetchError = useAppSelector(selectCinemasError);
  const createState = useAppSelector(selectCinemasCreateState);
  const updateState = useAppSelector(selectCinemasUpdateState);
  const deleteState = useAppSelector(selectCinemasDeleteState);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');

  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingCinemaId, setEditingCinemaId] = useState<number | null>(null);
  const [formState, setFormState] = useState<CinemaFormState>(emptyFormState);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Cinema | null>(null);

  useEffect(() => {
    if (fetchStatus === 'idle') {
      dispatch(fetchCinemas());
    }
  }, [dispatch, fetchStatus]);

  const openCreate = () => {
    setSubmitAttempted(false);
    setDrawerMode('create');
    setEditingCinemaId(null);
    setFormState(emptyFormState);
    setDrawerOpen(true);
  };

  const openEdit = (cinema: Cinema) => {
    setSubmitAttempted(false);
    setDrawerMode('edit');
    setEditingCinemaId(cinema.id_cinema);
    setFormState(toFormState(cinema));
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleFormChange = (key: keyof CinemaFormState, value: string) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  const parseNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const requiredErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!formState.nom.trim()) errs.nom = 'Requis';
    if (!formState.adresse.trim()) errs.adresse = 'Requis';
    if (!formState.ville.trim()) errs.ville = 'Requis';
    if (!formState.telephone.trim()) errs.telephone = 'Requis';
    return errs;
  }, [formState]);

  const canSubmit = useMemo(() => Object.keys(requiredErrors).length === 0, [requiredErrors]);

  const submit = async () => {
    setSubmitAttempted(true);
    if (!canSubmit) {
      toast.error('Veuillez remplir les champs requis');
      return;
    }

    const payloadCommon = {
      nom: formState.nom.trim(),
      adresse: formState.adresse.trim() || null,
      ville: formState.ville.trim() || null,
      telephone: formState.telephone.trim() || null,
      latitude: parseNumber(formState.latitude),
      longitude: parseNumber(formState.longitude),
    };

    try {
      if (drawerMode === 'create') {
        const payload: CreateCinemaDto = {
          nom: payloadCommon.nom,
          adresse: payloadCommon.adresse,
          ville: payloadCommon.ville,
          telephone: payloadCommon.telephone,
          latitude: payloadCommon.latitude,
          longitude: payloadCommon.longitude,
        };
        await dispatch(createCinema(payload)).unwrap();
        toast.success('Cinéma enregistré');
      } else if (editingCinemaId != null) {
        const payload: UpdateCinemaDto = payloadCommon;
        await dispatch(updateCinema({ id: editingCinemaId, data: payload })).unwrap();
        toast.success('Cinéma enregistré');
      }
      closeDrawer();
    } catch {
      toast.error('Action impossible');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteCinema(deleteTarget.id_cinema)).unwrap();
      toast.error('Cinéma supprimé');
      setDeleteTarget(null);
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const isLoading = fetchStatus === 'loading';
  const isActionLoading =
    createState.status === 'loading' || updateState.status === 'loading' || deleteState.status === 'loading';

  const stats = useMemo(() => {
    const total = cinemas.length;
    const cities = new Set(cinemas.map((c) => (c.ville ?? '').trim()).filter(Boolean));
    const active = cinemas.filter((c) => c.latitude != null && c.longitude != null).length;
    const inactive = total - active;
    return { total, citiesCount: cities.size, active, inactive };
  }, [cinemas]);

  const cinemasFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? cinemas.filter((c) => {
          const name = (c.nom ?? '').toLowerCase();
          const city = (c.ville ?? '').toLowerCase();
          return name.includes(q) || city.includes(q);
        })
      : cinemas;
    return list;
  }, [cinemas, search]);

  const cinemasSorted = useMemo(() => {
    const list = cinemasFiltered.slice();
    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const av =
        sortKey === 'id'
          ? a.id_cinema
          : sortKey === 'nom'
            ? a.nom
            : sortKey === 'adresse'
              ? a.adresse ?? ''
              : sortKey === 'ville'
                ? a.ville ?? ''
                : a.telephone ?? '';
      const bv =
        sortKey === 'id'
          ? b.id_cinema
          : sortKey === 'nom'
            ? b.nom
            : sortKey === 'adresse'
              ? b.adresse ?? ''
              : sortKey === 'ville'
                ? b.ville ?? ''
                : b.telephone ?? '';

      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), 'fr', { sensitivity: 'base' }) * dir;
    });
    return list;
  }, [cinemasFiltered, sortDir, sortKey]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const empty = !isLoading && cinemasSorted.length === 0;

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Cinémas</h1>
            <p className="mt-2 text-zinc-400">Gestion des cinémas</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou ville…"
                className="h-11 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm font-semibold text-zinc-200 outline-none focus:border-white/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode((v) => (v === 'grid' ? 'table' : 'grid'))}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/5 px-4 text-sm font-black text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.10)] transition hover:bg-white/10"
              >
                {viewMode === 'grid' ? (
                  <>
                    <Table2 className="h-4 w-4" aria-hidden="true" />
                    Table
                  </>
                ) : (
                  <>
                    <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                    Cartes
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#E50914] px-5 text-sm font-black text-white transition hover:brightness-110"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Ajouter un cinéma
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <SummaryChip icon={Building2} label="Total" value={String(stats.total)} />
          <SummaryChip icon={MapPin} label="Villes" value={String(stats.citiesCount)} />
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Actifs {stats.active}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-black text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <span className="h-2 w-2 rounded-full bg-zinc-500" />
            Inactifs {stats.inactive}
          </div>
        </div>
      </header>

      {fetchError ? (
        <div className="rounded-2xl border border-[#E50914]/40 bg-[#E50914]/10 p-4 text-sm font-semibold text-zinc-100">
          {fetchError}
        </div>
      ) : null}

      {(createState.status === 'failed' || updateState.status === 'failed' || deleteState.status === 'failed') && (
        <div className="rounded-2xl border border-[#E50914]/40 bg-[#E50914]/10 p-4 text-sm font-semibold text-zinc-100">
          {createState.error || updateState.error || deleteState.error}
        </div>
      )}

      {viewMode === 'grid' ? (
        <section>
          {empty ? (
            <div className="rounded-3xl border border-white/10 bg-[#1F1F1F] p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-[#E50914]">
                <MapPin className="h-8 w-8" aria-hidden="true" />
              </div>
              <div className="mt-4 text-xl font-black">Aucun cinéma trouvé</div>
              <div className="mt-2 text-sm font-semibold text-zinc-400">Essayez une autre recherche ou ajoutez un cinéma.</div>
              <button
                type="button"
                onClick={openCreate}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#E50914] px-5 text-sm font-black text-white transition hover:brightness-110"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Ajouter un cinéma
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-3xl bg-[#1F1F1F] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                    >
                      <div className="mt-5 h-6 w-2/3 rounded bg-white/5" />
                      <div className="mt-3 h-4 w-full rounded bg-white/5" />
                      <div className="mt-2 h-4 w-5/6 rounded bg-white/5" />
                      <div className="mt-6 h-10 rounded-xl bg-white/5" />
                    </div>
                  ))
                : cinemasSorted.map((cinema, idx) => {
                    return (
                      <article
                        key={cinema.id_cinema}
                        className="animate-seat-in overflow-hidden rounded-3xl bg-[#1F1F1F] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(229,9,20,0.35),0_0_26px_rgba(229,9,20,0.10)]"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xl font-black text-white">{cinema.nom}</div>
                              <div className="mt-2 text-sm font-semibold text-zinc-300">
                                {cinema.adresse || '—'}
                              </div>
                            </div>
                            <div className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-black text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                              {cinema.ville || '—'}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
                            <Phone className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                            <span>{cinema.telephone || '—'}</span>
                          </div>

                          <div className="mt-3 text-xs font-semibold text-zinc-500">
                            <span className="font-mono">{formatCoord(cinema.latitude)}</span>
                            <span className="mx-2">/</span>
                            <span className="font-mono">{formatCoord(cinema.longitude)}</span>
                          </div>

                          <div className="mt-6 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(cinema)}
                              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/0 px-3 text-sm font-black text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(cinema)}
                              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E50914]/50 bg-white/0 px-3 text-sm font-black text-[#ffb4b7] transition hover:bg-[#E50914]/10"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
            </div>
          )}
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#1F1F1F] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-black/20 text-xs font-black uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => setSort('id')} className="inline-flex items-center gap-1">
                      ID {sortKey === 'id' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => setSort('nom')} className="inline-flex items-center gap-1">
                      Nom {sortKey === 'nom' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => setSort('adresse')} className="inline-flex items-center gap-1">
                      Adresse {sortKey === 'adresse' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => setSort('ville')} className="inline-flex items-center gap-1">
                      Ville {sortKey === 'ville' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => setSort('telephone')} className="inline-flex items-center gap-1">
                      Téléphone {sortKey === 'telephone' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th className="px-4 py-3">Localisation</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-zinc-300" colSpan={7}>
                      Chargement…
                    </td>
                  </tr>
                ) : cinemasSorted.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-zinc-400" colSpan={7}>
                      Aucun cinéma trouvé.
                    </td>
                  </tr>
                ) : (
                  cinemasSorted.map((c, idx) => {
                    const zebra = idx % 2 === 0 ? 'bg-black/10' : 'bg-[#1a1a1a]';
                    const canShow = c.latitude != null && c.longitude != null;
                    return (
                      <tr key={c.id_cinema} className={`${zebra} transition hover:bg-white/5`}>
                        <td className="px-4 py-4 font-mono text-xs text-zinc-300">{c.id_cinema}</td>
                        <td className="px-4 py-4 font-black text-zinc-100">{c.nom}</td>
                        <td className="px-4 py-4 text-zinc-300">{c.adresse || '—'}</td>
                        <td className="px-4 py-4 text-zinc-300">{c.ville || '—'}</td>
                        <td className="px-4 py-4 text-zinc-300">{c.telephone || '—'}</td>
                        <td className="px-4 py-4">
                          {canShow ? (
                            <Popover.Root>
                              <Popover.Trigger asChild>
                                <button type="button" className="text-sm font-black text-[#ffb4b7] hover:underline">
                                  📍 Voir sur la carte
                                </button>
                              </Popover.Trigger>
                              <Popover.Portal>
                                <Popover.Content
                                  sideOffset={10}
                                  className="z-50 w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#1F1F1F] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
                                >
                                  <div className="h-[180px] overflow-hidden rounded-xl border border-white/10">
                                    <MapContainer
                                      center={[c.latitude!, c.longitude!]}
                                      zoom={15}
                                      scrollWheelZoom={false}
                                      dragging={false}
                                      doubleClickZoom={false}
                                      zoomControl={false}
                                      className="h-full w-full"
                                    >
                                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                      <Marker position={[c.latitude!, c.longitude!]} icon={redPinIcon} />
                                    </MapContainer>
                                  </div>
                                  <div className="mt-3 text-xs font-semibold text-zinc-400">
                                    <span className="font-mono">{formatCoord(c.latitude)}</span>
                                    <span className="mx-2">/</span>
                                    <span className="font-mono">{formatCoord(c.longitude)}</span>
                                  </div>
                                </Popover.Content>
                              </Popover.Portal>
                            </Popover.Root>
                          ) : (
                            <span className="text-xs font-semibold text-zinc-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-200 transition hover:bg-white/5"
                              aria-label="Modifier"
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(c)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E50914]/50 text-[#ffb4b7] transition hover:bg-[#E50914]/10"
                              aria-label="Supprimer"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Drawer Add/Edit */}
      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className="fixed z-50 w-full overflow-hidden border border-white/10 bg-[#141414] shadow-[0_30px_120px_rgba(0,0,0,0.75)] outline-none transition data-[state=open]:duration-300 data-[state=closed]:duration-200 data-[state=closed]:ease-in data-[state=open]:ease-out
              inset-x-0 bottom-0 h-[92vh] rounded-t-3xl translate-y-full data-[state=open]:translate-y-0
              sm:inset-y-0 sm:right-0 sm:inset-x-auto sm:h-full sm:w-[560px] sm:rounded-none sm:rounded-l-3xl sm:translate-y-0 sm:translate-x-full sm:data-[state=open]:translate-x-0"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
                <div>
                  <Dialog.Title className="text-2xl font-black">
                    {drawerMode === 'create' ? 'Ajouter un cinéma' : 'Modifier le cinéma'}
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm font-semibold text-zinc-400">
                    Renseignez les informations et sélectionnez la localisation sur la carte.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200"
                    aria-label="Fermer"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-auto px-6 py-6">
                <div className="grid gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wide text-zinc-400">Nom *</label>
                    <input
                      value={formState.nom}
                      onChange={(e) => handleFormChange('nom', e.target.value)}
                      className={`mt-2 h-11 w-full rounded-xl border bg-white/5 px-3 text-sm font-semibold text-zinc-200 outline-none ${
                        submitAttempted && requiredErrors.nom
                          ? 'border-[#E50914]/60'
                          : 'border-white/10 focus:border-white/20'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wide text-zinc-400">Adresse *</label>
                    <input
                      value={formState.adresse}
                      onChange={(e) => handleFormChange('adresse', e.target.value)}
                      className={`mt-2 h-11 w-full rounded-xl border bg-white/5 px-3 text-sm font-semibold text-zinc-200 outline-none ${
                        submitAttempted && requiredErrors.adresse
                          ? 'border-[#E50914]/60'
                          : 'border-white/10 focus:border-white/20'
                      }`}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-black uppercase tracking-wide text-zinc-400">Ville *</label>
                      <input
                        value={formState.ville}
                        onChange={(e) => handleFormChange('ville', e.target.value)}
                        className={`mt-2 h-11 w-full rounded-xl border bg-white/5 px-3 text-sm font-semibold text-zinc-200 outline-none ${
                          submitAttempted && requiredErrors.ville
                            ? 'border-[#E50914]/60'
                            : 'border-white/10 focus:border-white/20'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-wide text-zinc-400">Téléphone *</label>
                      <input
                        value={formState.telephone}
                        onChange={(e) => handleFormChange('telephone', e.target.value)}
                        className={`mt-2 h-11 w-full rounded-xl border bg-white/5 px-3 text-sm font-semibold text-zinc-200 outline-none ${
                          submitAttempted && requiredErrors.telephone
                            ? 'border-[#E50914]/60'
                            : 'border-white/10 focus:border-white/20'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wide text-zinc-400">Localisation</label>
                    <div className="mt-3">
                      <CinemaMapPicker
                        latitude={formState.latitude}
                        longitude={formState.longitude}
                        onPick={(lat, lng) => {
                          handleFormChange('latitude', lat.toFixed(6));
                          handleFormChange('longitude', lng.toFixed(6));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-5">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-white/0 px-4 text-sm font-black text-zinc-300 transition hover:bg-white/5"
                  >
                    Annuler
                  </button>
                </Dialog.Close>
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={isActionLoading}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#E50914] px-5 text-sm font-black text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirmation */}
      <AlertDialog.Root open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[#1F1F1F] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.7)] data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95">
            <AlertDialog.Title className="text-xl font-black">Supprimer ce cinéma ?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm font-semibold text-zinc-400">
              <span className="text-zinc-200">{deleteTarget?.nom}</span>
              <span className="mx-2">·</span>
              Cette action est irréversible.
            </AlertDialog.Description>

            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-white/0 px-4 text-sm font-black text-zinc-300 transition hover:bg-white/5"
                >
                  Annuler
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  onClick={() => void confirmDelete()}
                  disabled={isActionLoading}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#E50914] px-5 text-sm font-black text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  Supprimer
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
