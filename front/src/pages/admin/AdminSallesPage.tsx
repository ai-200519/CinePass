import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import {
    AlertTriangle,
    Armchair,
    DoorOpen,
    Film,
    LayoutGrid,
    Pencil,
    Plus,
    Search,
    Table2,
    Theater,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { CreateSalleDto, Salle, UpdateSalleDto } from '../../features/salles/sallesApi';
import {
    selectSalles,
    selectSallesCreateState,
    selectSallesDeleteState,
    selectSallesError,
    selectSallesFetchStatus,
    selectSallesUpdateState,
} from '../../features/salles/sallesSelectors';
import { createSalle, deleteSalle, fetchSalles, updateSalle } from '../../features/salles/sallesSlice';

type ViewMode = 'grid' | 'table';
type EquipmentFilter = 'ALL' | '2D' | '3D' | 'IMAX' | 'DOLBY';

type SortKey = 'numero' | 'nom' | 'capaciteTotale' | 'equipements';
type SortDir = 'asc' | 'desc';

type FormErrors = {
  numero?: string;
  nom?: string;
  capaciteTotale?: string;
};

const EQUIPMENT_OPTIONS = ['2D', '3D', 'IMAX', 'Dolby', '4DX', 'VIP'] as const;
type EquipmentOption = (typeof EQUIPMENT_OPTIONS)[number];

const CAPACITY_MAX = 500;
const DEFAULT_CINEMA_ID = 1;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function parseEquipements(raw: string | null | undefined): EquipmentOption[] {
  if (!raw) return [];
  const tokens = raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const normalized: EquipmentOption[] = [];
  for (const token of tokens) {
    if (token.toLowerCase().includes('dolby')) {
      normalized.push('Dolby');
      continue;
    }
    const match = EQUIPMENT_OPTIONS.find((opt) => opt.toLowerCase() === token.toLowerCase());
    if (match) normalized.push(match);
  }
  return Array.from(new Set(normalized));
}

function formatEquipements(eqs: EquipmentOption[]): string {
  return eqs.join(', ');
}

function getPrimaryEquipment(eqs: EquipmentOption[]): EquipmentOption | null {
  if (eqs.includes('IMAX')) return 'IMAX';
  if (eqs.includes('Dolby')) return 'Dolby';
  if (eqs.includes('3D')) return '3D';
  if (eqs.includes('2D')) return '2D';
  if (eqs.includes('4DX')) return '4DX';
  if (eqs.includes('VIP')) return 'VIP';
  return null;
}

function bannerGradientClass(primary: EquipmentOption | null): string {
  switch (primary) {
    case '3D':
      return 'bg-gradient-to-r from-sky-500/25 via-fuchsia-600/20 to-zinc-900/20';
    case 'IMAX':
      return 'bg-gradient-to-r from-amber-400/25 via-red-600/20 to-zinc-900/20';
    case 'Dolby':
      return 'bg-gradient-to-r from-teal-500/20 via-zinc-900/20 to-black/20';
    case '4DX':
      return 'bg-gradient-to-r from-violet-500/20 via-fuchsia-600/15 to-black/20';
    case 'VIP':
      return 'bg-gradient-to-r from-amber-500/15 via-zinc-900/20 to-black/20';
    case '2D':
    default:
      return 'bg-gradient-to-r from-zinc-700/35 via-[#E50914]/15 to-black/20';
  }
}

function equipmentChipClass(eq: EquipmentOption): string {
  switch (eq) {
    case '2D':
      return 'bg-white/10 text-zinc-200 border-white/10';
    case '3D':
      return 'bg-sky-500/15 text-sky-200 border-sky-500/20';
    case 'IMAX':
      return 'bg-amber-500/15 text-amber-200 border-amber-500/20';
    case 'Dolby':
      return 'bg-teal-500/15 text-teal-200 border-teal-500/20';
    case '4DX':
      return 'bg-violet-500/15 text-violet-200 border-violet-500/20';
    case 'VIP':
      return 'bg-red-500/15 text-red-200 border-red-500/20';
    default:
      return 'bg-white/10 text-zinc-200 border-white/10';
  }
}

function capacityPercent(capacity: number): number {
  if (!capacity || capacity <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((capacity / CAPACITY_MAX) * 100)));
}

function matchEquipmentFilter(filter: EquipmentFilter, eqs: EquipmentOption[]): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'DOLBY') return eqs.includes('Dolby');
  return eqs.includes(filter);
}

function normalizeForSearch(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function matchesQuery(salle: Salle, eqs: EquipmentOption[], query: string): boolean {
  const q = normalizeForSearch(query.trim());
  if (!q) return true;

  const name = normalizeForSearch(salle.nom ?? '');
  const numero = String(salle.numero);
  const equipments = normalizeForSearch(eqs.join(' '));

  return name.includes(q) || numero.includes(q) || equipments.includes(q);
}

function sortSalles(items: Salle[], sortKey: SortKey, dir: SortDir): Salle[] {
  const sign = dir === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    if (sortKey === 'numero') return sign * (a.numero - b.numero);
    if (sortKey === 'capaciteTotale') return sign * ((a.capaciteTotale ?? 0) - (b.capaciteTotale ?? 0));
    if (sortKey === 'nom') return sign * String(a.nom ?? '').localeCompare(String(b.nom ?? ''), 'fr');
    return sign * String(a.equipements ?? '').localeCompare(String(b.equipements ?? ''), 'fr');
  });
}

type SalleDraft = {
  id: number | null;
  numero: string;
  nom: string;
  capaciteTotale: string;
  equipements: EquipmentOption[];
  active: boolean;
  rows: string;
  cols: string;
};

function makeEmptyDraft(): SalleDraft {
  return {
    id: null,
    numero: '',
    nom: '',
    capaciteTotale: '',
    equipements: ['2D'],
    active: true,
    rows: '5',
    cols: '8',
  };
}

function draftFromSalle(salle: Salle): SalleDraft {
  const eqs = parseEquipements(salle.equipements);
  const cols = 8;
  const rows = Math.max(1, Math.ceil((salle.capaciteTotale ?? 0) / cols));
  return {
    id: salle.id_salle,
    numero: String(salle.numero ?? ''),
    nom: salle.nom ?? '',
    capaciteTotale: String(salle.capaciteTotale ?? ''),
    equipements: eqs.length ? eqs : ['2D'],
    active: true,
    rows: String(rows),
    cols: String(cols),
  };
}

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function AdminSallesPage() {
  const dispatch = useAppDispatch();
  const salles = useAppSelector(selectSalles);
  const fetchStatus = useAppSelector(selectSallesFetchStatus);
  const fetchError = useAppSelector(selectSallesError);
  const updateState = useAppSelector(selectSallesUpdateState);
  const deleteState = useAppSelector(selectSallesDeleteState);
  const createState = useAppSelector(selectSallesCreateState);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>('ALL');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('numero');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Salle | null>(null);
  const [draft, setDraft] = useState<SalleDraft>(() => makeEmptyDraft());
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (fetchStatus === 'idle') {
      dispatch(fetchSalles());
    }
  }, [dispatch, fetchStatus]);

  const isLoading = fetchStatus === 'loading';
  const isMutating =
    createState.status === 'loading' || updateState.status === 'loading' || deleteState.status === 'loading';

  const sallesWithParsedEquipment = useMemo(() => {
    return salles.map((salle) => ({
      salle,
      eqs: parseEquipements(salle.equipements),
    }));
  }, [salles]);

  const stats = useMemo(() => {
    const totalSalles = salles.length;
    const capaciteTotale = salles.reduce((acc, s) => acc + (s.capaciteTotale ?? 0), 0);
    const equipmentSet = new Set<string>();
    for (const { eqs } of sallesWithParsedEquipment) {
      for (const eq of eqs) equipmentSet.add(eq);
    }
    const equipementsDisponibles = Array.from(equipmentSet);
    return {
      totalSalles,
      capaciteTotale,
      equipementsDisponibles,
    };
  }, [salles, sallesWithParsedEquipment]);

  const filteredSorted = useMemo(() => {
    const filtered = sallesWithParsedEquipment
      .filter(({ salle, eqs }) => matchEquipmentFilter(equipmentFilter, eqs))
      .filter(({ salle, eqs }) => matchesQuery(salle, eqs, query))
      .map(({ salle }) => salle);

    return sortSalles(filtered, sortKey, sortDir);
  }, [equipmentFilter, query, sallesWithParsedEquipment, sortKey, sortDir]);

  const openCreate = () => {
    setErrors({});
    setDraft(makeEmptyDraft());
    setDrawerOpen(true);
  };

  const openEdit = (salle: Salle) => {
    setErrors({});
    setDraft(draftFromSalle(salle));
    setDrawerOpen(true);
  };

  const requestDelete = (salle: Salle) => {
    setSelectedToDelete(salle);
    setDeleteOpen(true);
  };

  const validateDraft = (): boolean => {
    const next: FormErrors = {};
    const numero = Number(draft.numero);
    const capacite = Number(draft.capaciteTotale);

    if (!draft.nom.trim()) next.nom = 'Le nom est requis.';
    if (Number.isNaN(numero) || numero <= 0) next.numero = 'Numéro invalide.';
    if (Number.isNaN(capacite) || capacite < 1 || capacite > CAPACITY_MAX) {
      next.capaciteTotale = `Capacité: 1 à ${CAPACITY_MAX}.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validateDraft()) return;

    const payloadBase = {
      numero: Number(draft.numero),
      nom: draft.nom.trim(),
      capaciteTotale: Number(draft.capaciteTotale),
      equipements: formatEquipements(draft.equipements),
    };

    try {
      if (draft.id == null) {
        const payload: CreateSalleDto = {
          ...payloadBase,
          id_cinema: DEFAULT_CINEMA_ID,
        };
        await dispatch(createSalle(payload)).unwrap();
        toast.success('Salle ajoutée');
      } else {
        const payload: UpdateSalleDto = {
          ...payloadBase,
        };
        await dispatch(updateSalle({ id: draft.id, data: payload })).unwrap();
        toast.success('Salle modifiée');
      }
      setDrawerOpen(false);
    } catch {
      toast.error('Action impossible');
    }
  };

  const confirmDelete = async () => {
    if (!selectedToDelete) return;
    try {
      await dispatch(deleteSalle(selectedToDelete.id_salle)).unwrap();
      toast.error('Salle supprimée');
    } catch {
      toast.error('Suppression impossible');
    } finally {
      setDeleteOpen(false);
      setSelectedToDelete(null);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  };

  const setCapacityAndPreview = (capacityRaw: string) => {
    setDraft((current) => {
      const capacity = clampInt(Number(capacityRaw || 0), 1, CAPACITY_MAX);
      const cols = clampInt(Number(current.cols || 0), 1, 50);
      const rows = Math.max(1, Math.ceil(capacity / cols));
      return {
        ...current,
        capaciteTotale: capacityRaw,
        rows: String(rows),
      };
    });
  };

  const setRowsColsAndCapacity = (rowsRaw: string, colsRaw: string) => {
    setDraft((current) => {
      const rows = clampInt(Number(rowsRaw || 0), 1, 50);
      const cols = clampInt(Number(colsRaw || 0), 1, 50);
      const capacity = clampInt(rows * cols, 1, CAPACITY_MAX);
      return {
        ...current,
        rows: rowsRaw,
        cols: colsRaw,
        capaciteTotale: String(capacity),
      };
    });
  };

  const preview = useMemo(() => {
    const rows = clampInt(Number(draft.rows || 0), 1, 50);
    const cols = clampInt(Number(draft.cols || 0), 1, 50);
    const cells = rows * cols;
    const maxCellsToRender = 120;
    const renderCells = Math.min(cells, maxCellsToRender);
    return { rows, cols, cells, renderCells, maxCellsToRender };
  }, [draft.rows, draft.cols]);

  const equipmentTabs: { key: EquipmentFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: '2D', label: '2D' },
    { key: '3D', label: '3D' },
    { key: 'IMAX', label: 'IMAX' },
    { key: 'DOLBY', label: 'Dolby' },
  ];

  const renderEquipmentChips = (eqs: EquipmentOption[]) => {
    if (eqs.length === 0) {
      return <span className="text-xs text-zinc-500">—</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {eqs.map((eq) => (
          <span
            key={eq}
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${equipmentChipClass(eq)}`}
          >
            {eq}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Salles</h1>
          <p className="mt-2 text-zinc-400">Gestion des salles</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (nom, numéro, équipement...)"
              className="h-11 w-full rounded-full border border-white/10 bg-[#1F1F1F] pl-10 pr-4 text-sm text-zinc-100 outline-none transition focus:border-[#E50914]/50 focus:ring-2 focus:ring-[#E50914]/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                viewMode === 'grid'
                  ? 'border-[#E50914]/50 bg-[#E50914]/10 text-white'
                  : 'border-white/10 bg-[#1F1F1F] text-zinc-300 hover:bg-white/5'
              }`}
              aria-label="Vue grille"
              title="Vue grille"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                viewMode === 'table'
                  ? 'border-[#E50914]/50 bg-[#E50914]/10 text-white'
                  : 'border-white/10 bg-[#1F1F1F] text-zinc-300 hover:bg-white/5'
              }`}
              aria-label="Vue tableau"
              title="Vue tableau"
            >
              <Table2 className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#E50914] px-5 text-sm font-semibold text-white transition hover:bg-[#ff1a24]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ajouter une salle
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {equipmentTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setEquipmentFilter(tab.key)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
              equipmentFilter === tab.key
                ? 'border-[#E50914]/40 bg-[#E50914]/10 text-white'
                : 'border-white/10 bg-[#1F1F1F] text-zinc-300 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#1F1F1F] px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-zinc-500">
            <DoorOpen className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            Total salles
          </div>
          <div className="mt-1 text-xl font-black text-zinc-100">{stats.totalSalles}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#1F1F1F] px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-zinc-500">
            <Armchair className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            Capacité totale
          </div>
          <div className="mt-1 text-xl font-black text-zinc-100">{stats.capaciteTotale} places</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#1F1F1F] px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-zinc-500">
            <Film className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            Équipements disponibles
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {stats.equipementsDisponibles.length === 0 ? (
              <span className="text-sm text-zinc-400">—</span>
            ) : (
              stats.equipementsDisponibles.slice(0, 6).map((eq) => (
                <span
                  key={eq}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-200"
                >
                  {eq}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {fetchError ? (
        <div className="mb-4 rounded-2xl border border-[#E50914]/40 bg-[#E50914]/10 px-4 py-3 text-sm font-semibold text-[#ffb4b7]">
          {fetchError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">Chargement...</div>
      ) : filteredSorted.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#1F1F1F] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
            <Theater className="h-7 w-7 text-zinc-200" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-black">Aucune salle configurée</h2>
          <p className="mt-2 text-sm text-zinc-400">Créez votre première salle pour commencer.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#E50914] px-6 text-sm font-semibold text-white transition hover:bg-[#ff1a24]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter une salle
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSorted.map((salle, index) => {
            const eqs = parseEquipements(salle.equipements);
            const primary = getPrimaryEquipment(eqs);
            const percent = capacityPercent(salle.capaciteTotale ?? 0);
            return (
              <article
                key={salle.id_salle}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-[#1F1F1F] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition will-change-transform animate-in fade-in-0 slide-in-from-bottom-2 duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(229,9,20,0.35)]"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div
                  className={`relative flex h-24 items-center justify-center ${bannerGradientClass(primary)} border-b border-white/10`}
                >
                  <div className="text-4xl font-black tracking-tight text-white/90">{pad2(salle.numero)}</div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-zinc-100">{salle.nom ?? `Salle ${salle.numero}`}</div>
                      <div className="mt-1 text-sm text-zinc-400">#{salle.id_salle}</div>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-zinc-200">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                      Active
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 font-semibold text-zinc-200">
                        <Armchair className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                        Capacité
                      </div>
                      <div className="text-zinc-400">{salle.capaciteTotale} / {CAPACITY_MAX}</div>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/30">
                      <div
                        className="h-full rounded-full bg-[#E50914]/70"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5">{renderEquipmentChips(eqs)}</div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => openEdit(salle)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Modifier
                  </button>

                  <button
                    type="button"
                    onClick={() => requestDelete(salle)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E50914]/50 text-[#ffb4b7] transition hover:bg-[#E50914]/10"
                    aria-label="Supprimer"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#1F1F1F] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/20 text-xs font-black uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-4 py-3">
                  <button type="button" onClick={() => toggleSort('numero')} className="hover:text-zinc-200">
                    Numéro
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button type="button" onClick={() => toggleSort('nom')} className="hover:text-zinc-200">
                    Nom
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button type="button" onClick={() => toggleSort('capaciteTotale')} className="hover:text-zinc-200">
                    Capacité
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button type="button" onClick={() => toggleSort('equipements')} className="hover:text-zinc-200">
                    Équipements
                  </button>
                </th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSorted.map((salle, idx) => {
                const eqs = parseEquipements(salle.equipements);
                const percent = capacityPercent(salle.capaciteTotale ?? 0);
                return (
                  <tr key={salle.id_salle} className={idx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}>
                    <td className="px-4 py-4 text-zinc-200">{pad2(salle.numero)}</td>
                    <td className="px-4 py-4 text-zinc-200">{salle.nom ?? `Salle ${salle.numero}`}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-200">{salle.capaciteTotale}</span>
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-black/30">
                          <div className="h-full rounded-full bg-[#E50914]/70" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{renderEquipmentChips(eqs)}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-zinc-200">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(salle)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-200 transition hover:bg-white/5"
                          aria-label="Modifier"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(salle)}
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
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Drawer */}
      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] overflow-auto rounded-t-3xl border border-white/10 bg-[#1F1F1F] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.7)] data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4 sm:bottom-auto sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[440px] sm:rounded-none sm:rounded-l-3xl sm:data-[state=open]:slide-in-from-right-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-xl font-black text-zinc-100">
                  {draft.id == null ? 'Ajouter une salle' : 'Modifier la salle'}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-zinc-400">
                  Configurez les informations de la salle.
                </Dialog.Description>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-zinc-500">Numéro de salle</label>
                <input
                  value={draft.numero}
                  onChange={(e) => setDraft((c) => ({ ...c, numero: e.target.value }))}
                  type="number"
                  inputMode="numeric"
                  className={`h-11 w-full rounded-2xl border bg-black/20 px-4 text-sm text-zinc-100 outline-none transition ${
                    errors.numero ? 'border-[#E50914]/60' : 'border-white/10 focus:border-[#E50914]/50'
                  }`}
                />
                {errors.numero ? <p className="mt-1 text-xs font-semibold text-[#ffb4b7]">{errors.numero}</p> : null}
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-zinc-500">Nom</label>
                <input
                  value={draft.nom}
                  onChange={(e) => setDraft((c) => ({ ...c, nom: e.target.value }))}
                  type="text"
                  className={`h-11 w-full rounded-2xl border bg-black/20 px-4 text-sm text-zinc-100 outline-none transition ${
                    errors.nom ? 'border-[#E50914]/60' : 'border-white/10 focus:border-[#E50914]/50'
                  }`}
                />
                {errors.nom ? <p className="mt-1 text-xs font-semibold text-[#ffb4b7]">{errors.nom}</p> : null}
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-zinc-500">Capacité</label>
                <div className="grid gap-3">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                      <Armchair className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <input
                      value={draft.capaciteTotale}
                      onChange={(e) => setCapacityAndPreview(e.target.value)}
                      type="number"
                      min={1}
                      max={CAPACITY_MAX}
                      inputMode="numeric"
                      className={`h-11 w-full rounded-2xl border bg-black/20 pl-10 pr-4 text-sm text-zinc-100 outline-none transition ${
                        errors.capaciteTotale ? 'border-[#E50914]/60' : 'border-white/10 focus:border-[#E50914]/50'
                      }`}
                    />
                  </div>

                  <input
                    value={Number(draft.capaciteTotale || 1)}
                    onChange={(e) => setCapacityAndPreview(e.target.value)}
                    type="range"
                    min={1}
                    max={CAPACITY_MAX}
                    className="h-2 w-full cursor-pointer accent-[#E50914]"
                    aria-label="Capacité"
                  />
                </div>
                {errors.capaciteTotale ? (
                  <p className="mt-1 text-xs font-semibold text-[#ffb4b7]">{errors.capaciteTotale}</p>
                ) : (
                  <p className="mt-1 text-xs text-zinc-500">Min 1, max {CAPACITY_MAX}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-zinc-500">Équipements</label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map((eq) => {
                    const active = draft.equipements.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() =>
                          setDraft((c) => {
                            const next = active ? c.equipements.filter((x) => x !== eq) : [...c.equipements, eq];
                            return { ...c, equipements: next.length ? next : ['2D'] };
                          })
                        }
                        className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? 'border-[#E50914]/50 bg-[#E50914]/10 text-white'
                            : 'border-white/10 bg-black/20 text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        {eq}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div>
                  <div className="text-sm font-black text-zinc-100">Statut</div>
                  <div className="text-xs text-zinc-400">Active / Inactive</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-400">{draft.active ? 'Active' : 'Inactive'}</span>
                  <Switch.Root
                    checked={draft.active}
                    onCheckedChange={(checked) => setDraft((c) => ({ ...c, active: checked }))}
                    className="relative h-6 w-11 rounded-full bg-white/10 data-[state=checked]:bg-[#E50914]/70"
                  >
                    <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
                  </Switch.Root>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-zinc-100">Aperçu disposition sièges</div>
                    <div className="mt-1 text-xs text-zinc-500">Rows × Columns (auto-calc capacité)</div>
                  </div>
                  <div className="text-xs font-semibold text-zinc-400">
                    {preview.cells} sièges
                    {preview.cells > preview.maxCellsToRender ? ' (aperçu limité)' : ''}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-400">Rows</label>
                    <input
                      value={draft.rows}
                      onChange={(e) => setRowsColsAndCapacity(e.target.value, draft.cols)}
                      type="number"
                      min={1}
                      max={50}
                      className="h-10 w-full rounded-2xl border border-white/10 bg-black/20 px-3 text-sm text-zinc-100 outline-none focus:border-[#E50914]/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-400">Columns</label>
                    <input
                      value={draft.cols}
                      onChange={(e) => setRowsColsAndCapacity(draft.rows, e.target.value)}
                      type="number"
                      min={1}
                      max={50}
                      className="h-10 w-full rounded-2xl border border-white/10 bg-black/20 px-3 text-sm text-zinc-100 outline-none focus:border-[#E50914]/50"
                    />
                  </div>
                </div>

                <div
                  className="mt-4 grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${Math.min(preview.cols, 12)}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: preview.renderCells }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-[6px] bg-white/5" />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="h-11 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
                  disabled={isMutating}
                >
                  Annuler
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={handleSave}
                disabled={isMutating}
                className="h-11 rounded-full bg-[#E50914] px-6 text-sm font-semibold text-white transition hover:bg-[#ff1a24] disabled:opacity-60"
              >
                Enregistrer
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirmation */}
      <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[#1F1F1F] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.7)] data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-200">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <AlertDialog.Title className="text-lg font-black text-zinc-100">Supprimer la salle</AlertDialog.Title>
                <AlertDialog.Description className="mt-1 text-sm text-zinc-400">
                  {selectedToDelete ? (
                    <>
                      <span className="font-semibold text-zinc-200">
                        {selectedToDelete.nom ?? `Salle ${selectedToDelete.numero}`}
                      </span>
                      <span className="text-zinc-500"> — {selectedToDelete.capaciteTotale} places</span>
                    </>
                  ) : null}
                  <div className="mt-2 text-zinc-500">Toutes les séances liées seront affectées.</div>
                </AlertDialog.Description>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="h-11 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
                  disabled={deleteState.status === 'loading'}
                >
                  Annuler
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="h-11 rounded-full bg-[#E50914] px-6 text-sm font-semibold text-white transition hover:bg-[#ff1a24] disabled:opacity-60"
                  disabled={deleteState.status === 'loading'}
                >
                  Supprimer définitivement
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {(createState.status === 'failed' && createState.error) ||
      (updateState.status === 'failed' && updateState.error) ||
      (deleteState.status === 'failed' && deleteState.error) ? (
        <div className="mt-4 rounded-2xl border border-[#E50914]/40 bg-[#E50914]/10 px-4 py-3 text-sm font-semibold text-[#ffb4b7]">
          {createState.error || updateState.error || deleteState.error}
        </div>
      ) : null}

      {isMutating ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200">
          Action en cours, patientez...
        </div>
      ) : null}
    </div>
  );
}
