import { useEffect, useState } from 'react';
import { Search, Shield, ShieldOff, Trash2, UserCheck, UserX, ChevronDown } from 'lucide-react';
import { http } from '../../services/http';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Role = 'ADMIN' | 'STAFF' | 'CLIENT';
type Statut = 'PENDING' | 'ACTIF' | 'SUSPENDU';

interface Utilisateur {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: Role;
  statut: Statut;
  langue: string;
  dateInscription: string;
  cinema?: { id_cinema: number; nom: string } | null;
}

// ─── Helpers visuels ──────────────────────────────────────────────────────────
const STATUT_STYLE: Record<Statut, string> = {
  PENDING:  'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  ACTIF:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  SUSPENDU: 'bg-red-500/15 text-red-400 border border-red-500/30',
};

const STATUT_LABEL: Record<Statut, string> = {
  PENDING:  'En attente',
  ACTIF:    'Actif',
  SUSPENDU: 'Suspendu',
};

const ROLE_STYLE: Record<Role, string> = {
  ADMIN:  'bg-purple-500/15 text-purple-400',
  STAFF:  'bg-blue-500/15 text-blue-400',
  CLIENT: 'bg-zinc-700/50 text-zinc-400',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  // Actions en cours
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Modal suppression
  const [deleteTarget, setDeleteTarget] = useState<Utilisateur | null>(null);

  // Modal changement de rôle
  const [roleTarget, setRoleTarget] = useState<Utilisateur | null>(null);
  const [roleSelected, setRoleSelected] = useState<Role>('CLIENT');

  // ── Chargement initial ──────────────────────────────────────────────────────
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await http.get<Utilisateur[]>('/utilisateur');
      setUsers(res.data);
    } catch {
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const activer = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await http.patch<Utilisateur>(`/utilisateur/${id}/activer`);
      setUsers((prev) => prev.map((u) => (u.id_utilisateur === id ? res.data : u)));
    } catch { setError('Impossible d\'activer le compte.'); }
    finally { setActionLoading(null); }
  };

  const suspendre = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await http.patch<Utilisateur>(`/utilisateur/${id}/suspendre`);
      setUsers((prev) => prev.map((u) => (u.id_utilisateur === id ? res.data : u)));
    } catch { setError('Impossible de suspendre le compte.'); }
    finally { setActionLoading(null); }
  };

  const confirmerSuppression = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id_utilisateur);
    try {
      await http.delete(`/utilisateur/${deleteTarget.id_utilisateur}`);
      setUsers((prev) => prev.filter((u) => u.id_utilisateur !== deleteTarget.id_utilisateur));
      setDeleteTarget(null);
    } catch { setError('Impossible de supprimer l\'utilisateur.'); }
    finally { setActionLoading(null); }
  };

  const confirmerRole = async () => {
    if (!roleTarget) return;
    setActionLoading(roleTarget.id_utilisateur);
    try {
      const res = await http.patch<Utilisateur>(`/utilisateur/${roleTarget.id_utilisateur}/role`, { role: roleSelected });
      setUsers((prev) => prev.map((u) => (u.id_utilisateur === roleTarget.id_utilisateur ? res.data : u)));
      setRoleTarget(null);
    } catch { setError('Impossible de changer le rôle.'); }
    finally { setActionLoading(null); }
  };

  // ── Filtrage ─────────────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatut = !filterStatut || u.statut === filterStatut;
    return matchSearch && matchRole && matchStatut;
  });

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Total', value: users.length, color: 'text-white' },
    { label: 'Actifs', value: users.filter((u) => u.statut === 'ACTIF').length, color: 'text-emerald-400' },
    { label: 'En attente', value: users.filter((u) => u.statut === 'PENDING').length, color: 'text-amber-400' },
    { label: 'Suspendus', value: users.filter((u) => u.statut === 'SUSPENDU').length, color: 'text-red-400' },
  ];

  return (
    <div className="relative">
      {/* ── Header ── */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Utilisateurs</h1>
          <p className="mt-2 text-zinc-400">Gestion des comptes utilisateurs</p>
        </div>
      </header>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── Stats ── */}
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <article key={s.label} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{s.label}</p>
            <p className={`mt-2 text-3xl font-black tracking-tight ${s.color}`}>{s.value}</p>
          </article>
        ))}
      </section>

      {/* ── Filtres ── */}
      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-800/70 py-2.5 pl-9 pr-4 text-sm text-white outline-none ring-red-500/60 transition focus:ring-2"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2.5 text-sm text-white outline-none ring-red-500/60 transition focus:ring-2"
        >
          <option value="">Tous les rôles</option>
          <option value="ADMIN">Admin</option>
          <option value="STAFF">Staff</option>
          <option value="CLIENT">Client</option>
        </select>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2.5 text-sm text-white outline-none ring-red-500/60 transition focus:ring-2"
        >
          <option value="">Tous statuts</option>
          <option value="PENDING">En attente</option>
          <option value="ACTIF">Actif</option>
          <option value="SUSPENDU">Suspendu</option>
        </select>

        {(search || filterRole || filterStatut) && (
          <button
            onClick={() => { setSearch(''); setFilterRole(''); setFilterStatut(''); }}
            className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-zinc-400 transition hover:text-white"
          >
            Effacer
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950/40 shadow-2xl">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {['Utilisateur', 'Email', 'Rôle', 'Statut', 'Inscription', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-widest text-zinc-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-zinc-500">Chargement...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-zinc-500">Aucun utilisateur trouvé</td>
              </tr>
            ) : (
              filtered.map((user) => {
                const isActing = actionLoading === user.id_utilisateur;
                return (
                  <tr key={user.id_utilisateur} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition">
                    {/* Nom + Prénom */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-300">
                          {user.prenom[0]}{user.nom[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {user.prenom} {user.nom}
                          </p>
                          {user.telephone && (
                            <p className="text-xs text-zinc-500">{user.telephone}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4 text-zinc-300">{user.email}</td>

                    {/* Rôle */}
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ROLE_STYLE[user.role]}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUT_STYLE[user.statut]}`}>
                        {STATUT_LABEL[user.statut]}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-zinc-400 text-xs">
                      {fmtDate(user.dateInscription)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {/* Activer */}
                        {user.statut !== 'ACTIF' && (
                          <button
                            onClick={() => activer(user.id_utilisateur)}
                            disabled={isActing}
                            title="Activer"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-40"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Suspendre */}
                        {user.statut !== 'SUSPENDU' && (
                          <button
                            onClick={() => suspendre(user.id_utilisateur)}
                            disabled={isActing}
                            title="Suspendre"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-40"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Changer rôle */}
                        <button
                          onClick={() => { setRoleTarget(user); setRoleSelected(user.role); }}
                          disabled={isActing}
                          title="Changer le rôle"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 transition hover:bg-purple-500/20 disabled:opacity-40"
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </button>

                        {/* Supprimer */}
                        <button
                          onClick={() => setDeleteTarget(user)}
                          disabled={isActing}
                          title="Supprimer"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-600/10 text-red-400 transition hover:bg-red-600/20 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* ── Modal Supprimer ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black">Supprimer cet utilisateur ?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              <span className="font-semibold text-white">{deleteTarget.prenom} {deleteTarget.nom}</span>
              <br />
              Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-400 transition hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={confirmerSuppression}
                disabled={actionLoading === deleteTarget.id_utilisateur}
                className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {actionLoading === deleteTarget.id_utilisateur ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Changer rôle ── */}
      {roleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black">Changer le rôle</h3>
                <p className="text-sm text-zinc-400">{roleTarget.prenom} {roleTarget.nom}</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Nouveau rôle
              </label>
              <div className="relative">
                <select
                  value={roleSelected}
                  onChange={(e) => setRoleSelected(e.target.value as Role)}
                  className="w-full appearance-none rounded-2xl border border-white/10 bg-zinc-800/70 px-4 py-3 text-white outline-none ring-purple-500/60 transition focus:ring-2"
                >
                  <option value="CLIENT">CLIENT</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setRoleTarget(null)}
                className="rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-400 transition hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={confirmerRole}
                disabled={actionLoading === roleTarget.id_utilisateur || roleSelected === roleTarget.role}
                className="rounded-2xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-40"
              >
                {actionLoading === roleTarget.id_utilisateur ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}