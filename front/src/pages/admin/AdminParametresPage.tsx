import { Check, Save, Shield, User } from "lucide-react";
import { useState } from "react";

function AdminProfileSettings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Profil administrateur</h2>
        <p className="text-sm text-zinc-500">Informations de votre compte</p>
      </div>

      {saved ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <Check className="h-4 w-4" />
          Profil mis à jour
        </div>
      ) : null}

      <div className="space-y-4 rounded-2xl border border-white/8 bg-zinc-900 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-600/15 text-red-400">
            <User className="h-7 w-7" />
          </div>
          <div>
            <p className="font-black text-white">Administrateur</p>
            <p className="text-sm text-zinc-500">admin@cinepass.ma</p>
          </div>
        </div>

        <hr className="border-white/8" />

        {[
          { label: "Nom", placeholder: "Votre nom", type: "text" },
          { label: "Prénom", placeholder: "Votre prénom", type: "text" },
          { label: "Email", placeholder: "admin@cinepass.ma", type: "email" },
        ].map(({ label, placeholder, type }) => (
          <div key={label}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {label}
            </label>
            <input
              type={type}
              placeholder={placeholder}
              className="w-full rounded-xl border border-white/10 bg-zinc-800/70 px-4 py-2.5 text-sm text-white outline-none ring-red-500/50 transition placeholder:text-zinc-600 focus:ring-2"
            />
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-white/8 bg-zinc-900 p-6">
        <div className="flex items-center gap-2 text-sm font-black text-white">
          <Shield className="h-4 w-4 text-zinc-500" />
          Sécurité
        </div>

        {[
          { label: "Mot de passe actuel", placeholder: "••••••••" },
          { label: "Nouveau mot de passe", placeholder: "••••••••" },
          { label: "Confirmer", placeholder: "••••••••" },
        ].map(({ label, placeholder }) => (
          <div key={label}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {label}
            </label>
            <input
              type="password"
              placeholder={placeholder}
              className="w-full rounded-xl border border-white/10 bg-zinc-800/70 px-4 py-2.5 text-sm text-white outline-none ring-red-500/50 transition placeholder:text-zinc-600 focus:ring-2"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
      >
        <Save className="h-4 w-4" />
        Enregistrer les modifications
      </button>
    </div>
  );
}

export default function AdminParametresPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-white">
          Paramètres
        </h1>
        <p className="text-sm text-zinc-500">
          Configuration de l'espace administrateur
        </p>
      </header>

      <AdminProfileSettings />
    </div>
  );
}
