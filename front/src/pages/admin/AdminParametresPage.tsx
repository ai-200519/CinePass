import {
  Bell, Check,
  ChevronRight,
  Save,
  Shield,
  User,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'profil' | 'notifications';

// ─── Onglet Profil ────────────────────────────────────────────────────────────
function TabProfil() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="mx-auto max-w-xl space-y-6">
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
    <div className="mx-auto max-w-xl space-y-6">
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
  const [tab, setTab] = useState<Tab>('profil');

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: 'profil', label: 'Profil', icon: <User className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  ];

  return (
    <div>
      <header className="mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Paramètres</h1>
          <p className="text-sm text-zinc-500">Configuration de l'espace administrateur</p>
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
          {tab === 'profil' && <TabProfil />}
          {tab === 'notifications' && <TabNotifications />}
        </div>
      </div>
    </div>
  );
}