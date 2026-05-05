import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { Seance } from '../../features/seances/seancesApi';
import {
    selectFetchSeancesError,
    selectFetchSeancesStatus,
    selectSeances,
} from '../../features/seances/seancesSelectors';
import { seancesActions } from '../../features/seances/seancesSlice';
import { tarifsApi, type CreateTarifDto, type Tarif, type TypePublic } from '../../services/tarifsApi';

function formatMoneyDh(n: number) {
  return `${Math.round(n).toLocaleString('fr-FR')} DH`;
}

const CARD_CLASS =
  'rounded-2xl bg-[#1F1F1F] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]';

const TYPE_PUBLIC_OPTIONS: Array<{ value: TypePublic; label: string }> = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'ETUDIANT', label: 'Étudiant' },
  { value: 'ENFANT', label: 'Enfant' },
  { value: 'SENIOR', label: 'Senior' },
];

function fmtSeanceOption(s: Seance) {
  const dt = new Date(s.dateHeure);
  const date = dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const heure = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const film = s.film?.title ?? '—';
  const salle = s.salle?.numero != null ? `Salle ${s.salle.numero}` : 'Salle —';
  return `#${s.id_seance} · ${film} · ${salle} · ${date} ${heure}`;
}

type DarkSelectOption = { value: string; label: string; disabled?: boolean };

function DarkSelect({
  value,
  onValueChange,
  placeholder,
  options,
  triggerClassName,
  disabled,
  ariaLabel,
}: {
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  options: DarkSelectOption[];
  triggerClassName: string;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <Select.Root
      value={value.trim() === '' ? undefined : value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Select.Trigger
        className={triggerClassName}
        aria-label={ariaLabel}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="text-zinc-400">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className="z-50 overflow-hidden rounded-xl border border-white/10 bg-[#1F1F1F] shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
        >
          <Select.Viewport className="p-1">
            {options.map((o) => (
              <Select.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className="relative flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-200 outline-none data-[disabled]:opacity-40 data-[highlighted]:bg-white/10"
              >
                <Select.ItemIndicator className="inline-flex h-4 w-4 items-center justify-center text-[#E50914]">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </Select.ItemIndicator>
                <Select.ItemText>{o.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export default function AdminTarificationPage() {
  const dispatch = useAppDispatch();
  const seances = useAppSelector(selectSeances);
  const seancesStatus = useAppSelector(selectFetchSeancesStatus);
  const seancesError = useAppSelector(selectFetchSeancesError);

  const [selectedSeanceId, setSelectedSeanceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [tarifs, setTarifs] = useState<Tarif[]>([]);

  const [createTypePublic, setCreateTypePublic] = useState<TypePublic>('NORMAL');
  const [createPrix, setCreatePrix] = useState<string>('');

  const [editPrixById, setEditPrixById] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (seancesStatus === 'idle') dispatch(seancesActions.fetchSeancesRequested());
  }, [dispatch, seancesStatus]);

  const seancesSorted = useMemo(() => {
    const list = seances.slice();
    list.sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
    return list;
  }, [seances]);

  const canLoad = useMemo(() => {
    const n = Number(selectedSeanceId);
    return Number.isFinite(n) && n > 0;
  }, [selectedSeanceId]);

  const loadTarifs = async (seanceId: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await tarifsApi.bySeance(seanceId);
      setTarifs(data);
      setEditPrixById((prev) => {
        const next = { ...prev };
        for (const t of data) {
          if (next[t.id_tarif] == null) next[t.id_tarif] = String(t.prix ?? '');
        }
        return next;
      });
    } catch (e: any) {
      setError(e?.message ? String(e.message) : 'Erreur lors du chargement des tarifs');
    } finally {
      setLoading(false);
    }
  };

  const load = async () => {
    if (!canLoad) return;
    await loadTarifs(Number(selectedSeanceId));
  };

  useEffect(() => {
    setTarifs([]);
    setEditPrixById({});
    setError(null);
    setSuccess(null);
    if (canLoad) {
      void loadTarifs(Number(selectedSeanceId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeanceId]);

  const onCreate = async () => {
    if (!canLoad) return;

    const seanceId = Number(selectedSeanceId);
    const prix = Number(createPrix);
    if (!Number.isFinite(prix) || prix <= 0) {
      setError('Prix invalide');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const dto: CreateTarifDto = {
      id_seance: seanceId,
      typePublic: createTypePublic,
      prix,
    };

    try {
      await tarifsApi.create(dto);
      setSuccess('Tarif créé');
      setCreatePrix('');
      await loadTarifs(seanceId);
    } catch (e: any) {
      setError(e?.response?.status === 409 ? 'Tarif déjà existant pour ce type' : e?.message ? String(e.message) : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (t: Tarif) => {
    const prixStr = editPrixById[t.id_tarif];
    const prix = Number(prixStr);
    if (!Number.isFinite(prix) || prix <= 0) {
      setError('Prix invalide');
      return;
    }

    setBusyId(t.id_tarif);
    setError(null);
    setSuccess(null);
    try {
      await tarifsApi.update(t.id_tarif, { prix });
      setSuccess('Tarif mis à jour');
      if (canLoad) await loadTarifs(Number(selectedSeanceId));
    } catch (e: any) {
      setError(e?.message ? String(e.message) : 'Erreur lors de la mise à jour');
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (t: Tarif) => {
    const ok = window.confirm(`Supprimer le tarif ${t.typePublic} ?`);
    if (!ok) return;

    setBusyId(t.id_tarif);
    setError(null);
    setSuccess(null);
    try {
      await tarifsApi.remove(t.id_tarif);
      setSuccess('Tarif supprimé');
      if (canLoad) await loadTarifs(Number(selectedSeanceId));
    } catch (e: any) {
      setError(e?.message ? String(e.message) : 'Erreur lors de la suppression');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Tarif</h1>
          <p className="mt-2 text-zinc-400">Grille tarifaire par séance</p>
        </div>
      </header>

      {(error || success) && (
        <div
          className={`rounded-2xl border p-4 text-sm font-semibold ${
            error
              ? 'border-[#E50914]/40 bg-[#E50914]/10 text-zinc-100'
              : 'border-emerald-500/40 bg-emerald-500/10 text-zinc-100'
          }`}
        >
          {error ?? success}
        </div>
      )}

      <section className={CARD_CLASS}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-zinc-200">Séance</label>
            <DarkSelect
              value={selectedSeanceId}
              onValueChange={setSelectedSeanceId}
              placeholder="Sélectionner une séance…"
              ariaLabel="Séance"
              triggerClassName="inline-flex h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-white/15 sm:w-[520px]"
              options={seancesSorted.map((s) => ({
                value: String(s.id_seance),
                label: fmtSeanceOption(s),
              }))}
            />
            {seancesStatus === 'loading' ? (
              <div className="text-xs font-semibold text-zinc-500">Chargement des séances…</div>
            ) : seancesStatus === 'failed' ? (
              <div className="text-xs font-semibold text-[#ffb4b7]">
                Impossible de charger les séances{seancesError ? `: ${seancesError}` : ''}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={load}
            disabled={!canLoad || loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 text-sm font-black text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.10)] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Charger
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full">
            <thead className="bg-white/5 text-left text-xs font-black uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-sm font-semibold text-zinc-300" colSpan={3}>
                    Chargement…
                  </td>
                </tr>
              ) : tarifs.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm font-semibold text-zinc-400" colSpan={3}>
                    Aucune donnée. Sélectionnez une séance.
                  </td>
                </tr>
              ) : (
                tarifs.map((t) => {
                  const isBusy = busyId === t.id_tarif;
                  return (
                    <tr key={t.id_tarif} className="bg-black/10">
                      <td className="px-4 py-4 text-sm font-black text-zinc-200">{t.typePublic}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <input
                            value={editPrixById[t.id_tarif] ?? ''}
                            onChange={(e) => setEditPrixById((p) => ({ ...p, [t.id_tarif]: e.target.value }))}
                            inputMode="decimal"
                            className="h-10 w-32 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-200 outline-none"
                          />
                          <div className="text-xs font-bold text-zinc-500">({formatMoneyDh(t.prix)})</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onSave(t)}
                            disabled={isBusy}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-3 text-sm font-black text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Save className="h-4 w-4" aria-hidden="true" />
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(t)}
                            disabled={isBusy}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#E50914]/15 px-3 text-sm font-black text-[#ffb4b7] shadow-[0_0_0_1px_rgba(229,9,20,0.25)] transition hover:bg-[#E50914]/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Supprimer
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

      <section className={CARD_CLASS}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black">Créer un tarif</h2>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-black text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <Plus className="h-4 w-4" aria-hidden="true" />
            ADMIN
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-black text-zinc-200">Type de public</label>
            <div className="mt-2">
              <DarkSelect
                value={String(createTypePublic)}
                onValueChange={(v) => setCreateTypePublic(v as TypePublic)}
                placeholder="Choisir…"
                ariaLabel="Type de public"
                triggerClassName="inline-flex h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-white/15"
                options={TYPE_PUBLIC_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-black text-zinc-200">Prix (DH)</label>
            <input
              value={createPrix}
              onChange={(e) => setCreatePrix(e.target.value)}
              inputMode="decimal"
              placeholder="Ex: 50"
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-200 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={onCreate}
              disabled={!canLoad || loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 text-sm font-black text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ajouter
            </button>
          </div>
        </div>

        {!canLoad ? (
          <div className="mt-4 text-xs font-semibold text-zinc-400">
            Sélectionnez une séance ci-dessus avant de créer un tarif.
          </div>
        ) : null}
      </section>
    </div>
  );
}
