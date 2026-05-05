import { useEffect, useState, useCallback } from 'react';
import {
  Building2, MapPin, Phone, Globe, Plus, Edit2, Trash2,
  X, Save, ChevronRight, Settings, User, Shield, Bell, Check,
} from 'lucide-react';
import { cinemasApi, type Cinema, type CreateCinemaDto } from '../../features/cinemas/cinemasApi';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'cinema' | 'profil' | 'notifications';

type CinemaForm = {
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  latitude: string;
  longitude: string;
};

const EMPTY_FORM: CinemaForm = {
  nom: '', adresse: '', ville: '', telephone: '', latitude: '', longitude: '',
};

const cinemaToForm = (c: Cinema): CinemaForm => ({
  nom: c.nom ?? '',
  adresse: c.adresse ?? '',
  ville: c.ville ?? '',
  telephone: c.telephone ?? '',
  latitude: c.latitude != null ? String(c.latitude) : '',
  longitude: c.longitude != null ? String(c.longitude) : '',
});

const formToDto = (f: CinemaForm): CreateCinemaDto => ({
  nom: f.nom,
  adresse: f.adresse || null,
  ville: f.ville || null,
  telephone: f.telephone || null,
  latitude: f.latitude ? parseFloat(f.latitude) : null,
  longitude: f.longitude ? parseFloat(f.longitude) : null,
});

// ─── Modal Cinema ─────────────────────────────────────────────────────────────
function CinemaModal({ open, onClose, onSave, initial, title, isLoading, error }: {
  open: boolean; onClose: () => void;
  onSave: (f: CinemaForm) => void;
  initial: CinemaForm; title: string;
  isLoading: boolean; error: string | null;
}) {
  const [form, setForm] = useState(initial);
  useEffect(() => { if (open) setForm(initial); }, [open, initial]);
  if (!open) return null;

  const set = (key: keyof CinemaForm, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const Field = ({ label, field, placeholder, type = 'text' }: {
    label: string; field: keyof CinemaForm; placeholder?: string; type?: string;
  }) => (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500">{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-zinc-800/70 px-4 py-2.5 text-sm text-white outline-none ring-red-500/50 transition placeholder:text-zinc-600 focus:ring-2"
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition"><X className="h-5 w-5" /></button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm text-red-400">{error}</div>
        )}

        <div className="space-y-4">
          <Field label="Nom du cinéma *" field="nom" placeholder="CinePass Marrakech" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ville" field="ville" placeholder="Marrakech" />
            <Field label="Téléphone" field="telephone" placeholder="+212 5XX-XXXXXX" />
          </div>
          <Field label="Adresse" field="adresse" placeholder="123 Rue exemple, Quartier..." />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" field="latitude" placeholder="31.6295" type="number" />
            <Field label="Longitude" field="longitude" placeholder="-7.9811" type="number" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white transition"
          >Annuler</button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.nom.trim() || isLoading}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Onglet Cinémas ───────────────────────────────────────────────────────────
function TabCinemas() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; cinema: Cinema | null }>({ open: false, cinema: null });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cinemasApi.getAll();
      setCinemas(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Erreur de chargement');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form: CinemaForm) => {
    setSaving(true);
    setSaveError(null);
    try {
      const dto = formToDto(form);
      if (modal.cinema) {
        await cinemasApi.update(modal.cinema.id_cinema, dto);
        showSuccess('Cinéma mis à jour avec succès');
      } else {
        await cinemasApi.create(dto);
        showSuccess('Cinéma créé avec succès');
      }
      setModal({ open: false, cinema: null });
      load();
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || e.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await cinemasApi.remove(deleteId);
      setCinemas(prev => prev.filter(c => c.id_cinema !== deleteId));
      setDeleteId(null);
      showSuccess('Cinéma supprimé');
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Cinémas</h2>
          <p className="text-sm text-zinc-500">{cinemas.length} cinéma{cinemas.length !== 1 ? 's' : ''} configuré{cinemas.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModal({ open: true, cinema: null })}
          className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          <Plus className="h-4 w-4" /> Nouveau cinéma
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <Check className="h-4 w-4" /> {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-zinc-900 border border-white/5" />)}
        </div>
      ) : cinemas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <Building2 className="h-12 w-12 text-zinc-700 mb-3" />
          <p className="text-zinc-500 font-medium">Aucun cinéma configuré</p>
          <p className="text-xs text-zinc-600 mt-1">Créez votre premier cinéma pour commencer</p>
          <button
            onClick={() => setModal({ open: true, cinema: null })}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white transition"
          >
            <Plus className="h-4 w-4" /> Créer un cinéma
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cinemas.map(cinema => (
            <article
              key={cinema.id_cinema}
              className="group flex items-center justify-between rounded-2xl border border-white/8 bg-zinc-900 px-6 py-5 transition hover:border-white/15"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/10 border border-red-500/20 text-red-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-white">{cinema.nom}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    {cinema.ville && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {cinema.ville}
                      </span>
                    )}
                    {cinema.adresse && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {cinema.adresse}
                      </span>
                    )}
                    {cinema.telephone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {cinema.telephone}
                      </span>
                    )}
                    {cinema.latitude && cinema.longitude && (
                      <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-600">
                        {cinema.latitude.toFixed(4)}, {cinema.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModal({ open: true, cinema })}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white"
                  title="Modifier"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleteId(cinema.id_cinema)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10 text-red-400 transition hover:bg-red-600/20"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <CinemaModal
        open={modal.open}
        onClose={() => setModal({ open: false, cinema: null })}
        onSave={handleSave}
        initial={modal.cinema ? cinemaToForm(modal.cinema) : EMPTY_FORM}
        title={modal.cinema ? 'Modifier le cinéma' : 'Nouveau cinéma'}
        isLoading={saving}
        error={saveError}
      />

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black">Supprimer ce cinéma ?</h3>
            <p className="mt-2 text-sm text-zinc-400">Toutes les salles associées seront également affectées.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white transition">Annuler</button>
              <button onClick={handleDelete} disabled={deleting} className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50">
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Onglet Profil ────────────────────────────────────────────────────────────
function TabProfil() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Profil administrateur</h2>
        <p className="text-sm text-zinc-500">Informations de votre compte</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <Check className="h-4 w-4" /> Profil mis à jour
        </div>
      )}

      <div className="rounded-2xl border border-white/8 bg-zinc-900 p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600/15 border border-red-500/20 text-red-400">
            <User className="h-7 w-7" />
          </div>
          <div>
            <p className="font-black text-white">Administrateur</p>
            <p className="text-sm text-zinc-500">admin@cinepass.ma</p>
          </div>
        </div>
        <hr className="border-white/8" />
        {[
          { label: 'Nom', placeholder: 'Votre nom', type: 'text' },
          { label: 'Prénom', placeholder: 'Votre prénom', type: 'text' },
          { label: 'Email', placeholder: 'admin@cinepass.ma', type: 'email' },
        ].map(({ label, placeholder, type }) => (
          <div key={label}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500">{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              className="w-full rounded-xl border border-white/10 bg-zinc-800/70 px-4 py-2.5 text-sm text-white outline-none ring-red-500/50 transition placeholder:text-zinc-600 focus:ring-2"
            />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/8 bg-zinc-900 p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-black text-white">
          <Shield className="h-4 w-4 text-zinc-500" /> Sécurité
        </div>
        {[
          { label: 'Mot de passe actuel', placeholder: '••••••••' },
          { label: 'Nouveau mot de passe', placeholder: '••••••••' },
          { label: 'Confirmer', placeholder: '••••••••' },
        ].map(({ label, placeholder }) => (
          <div key={label}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500">{label}</label>
            <input
              type="password"
              placeholder={placeholder}
              className="w-full rounded-xl border border-white/10 bg-zinc-800/70 px-4 py-2.5 text-sm text-white outline-none ring-red-500/50 transition placeholder:text-zinc-600 focus:ring-2"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
      >
        <Save className="h-4 w-4" /> Enregistrer les modifications
      </button>
    </div>
  );
}

// ─── Onglet Notifications ────────────────────────────────────────────────────
function TabNotifications() {
  const [settings, setSettings] = useState({
    newReservation: true,
    cancelReservation: true,
    dailyReport: false,
    lowOccupancy: true,
    paymentFailed: true,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof settings) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const options = [
    { key: 'newReservation' as const, label: 'Nouvelle réservation', desc: 'Notifier à chaque nouvelle réservation confirmée' },
    { key: 'cancelReservation' as const, label: 'Annulation de réservation', desc: 'Notifier quand un client annule' },
    { key: 'paymentFailed' as const, label: 'Échec de paiement', desc: 'Alerte en cas de problème de paiement' },
    { key: 'lowOccupancy' as const, label: 'Faible taux de remplissage', desc: 'Alerte si une séance est à moins de 30%' },
    { key: 'dailyReport' as const, label: 'Rapport quotidien', desc: 'Récapitulatif des activités chaque matin à 8h' },
  ];

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Notifications</h2>
        <p className="text-sm text-zinc-500">Configurez vos préférences de notification</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <Check className="h-4 w-4" /> Préférences sauvegardées
        </div>
      )}

      <div className="rounded-2xl border border-white/8 bg-zinc-900 divide-y divide-white/6">
        {options.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                settings[key] ? 'bg-red-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  settings[key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
      >
        <Save className="h-4 w-4" /> Enregistrer
      </button>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminParametresPage() {
  const [tab, setTab] = useState<Tab>('cinema');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'cinema', label: 'Cinémas', icon: <Building2 className="h-4 w-4" /> },
    { id: 'profil', label: 'Profil', icon: <User className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  ];

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-white/8">
            <Settings className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Paramètres</h1>
            <p className="text-sm text-zinc-500">Configuration de l'espace administrateur</p>
          </div>
        </div>
      </header>

      <div className="flex gap-8">
        {/* Sidebar nav */}
        <nav className="w-48 flex-none">
          <ul className="space-y-1">
            {tabs.map(({ id, label, icon }) => (
              <li key={id}>
                <button
                  onClick={() => setTab(id)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    tab === id
                      ? 'bg-red-600/15 text-red-400 border border-red-500/20'
                      : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {icon} {label}
                  </span>
                  {tab === id && <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'cinema' && <TabCinemas />}
          {tab === 'profil' && <TabProfil />}
          {tab === 'notifications' && <TabNotifications />}
        </div>
      </div>
    </div>
  );
}