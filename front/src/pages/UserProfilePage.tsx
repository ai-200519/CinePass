import {
  Calendar,
  Camera,
  ChevronRight,
  Edit3,
  History,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Ticket,
  User,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import Navbar from '../components/Navbar';
import { selectAuthUser, selectIsAuthenticated } from '../features/auth/authSelectors';
import { authActions } from '../features/auth/authSlice';
import { utilisateurApi, type UtilisateurMe, type UpdateUtilisateurDto } from '../services/utilisateurApi';

// ─── Types ──────────────────────────────────────────────────────────────────
type EditableFields = {
  nom: string;
  prenom: string;
  telephone: string;
  ville: string;
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const getInitials = (prenom?: string, nom?: string): string => {
  const p = (prenom?.[0] ?? '').toUpperCase();
  const n = (nom?.[0] ?? '').toUpperCase();
  return `${p}${n}` || '??';
};

const formatJoinDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

// ─── Sub-components ─────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/8 bg-white/4 px-5 py-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  editing,
  field,
  onChange,
  placeholder,
  readOnly = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  field: keyof EditableFields;
  onChange: (field: keyof EditableFields, value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/4 p-4 transition hover:border-white/15">
      <span className="mt-0.5 text-red-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
        {editing && !readOnly ? (
          <input
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2 text-sm font-semibold text-white placeholder:text-zinc-600 outline-none ring-red-500/50 transition focus:ring-2"
          />
        ) : (
          <p className="truncate text-sm font-semibold text-zinc-100">{value || '—'}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authUser = useAppSelector(selectAuthUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [profile, setProfile] = useState<UtilisateurMe | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<EditableFields>({
    nom: '',
    prenom: '',
    telephone: '',
    ville: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  // Load full profile from API
  useEffect(() => {
    if (!isAuthenticated) return;
    utilisateurApi
      .me()
      .then((data) => {
        setProfile(data);
        setFields({
          nom: data.nom ?? '',
          prenom: data.prenom ?? '',
          telephone: data.telephone ?? '',
          ville: data.ville ?? '',
        });
      })
      .catch(() => {
        // Fallback to Redux store data
        if (authUser) {
          setFields({ nom: authUser.nom ?? '', prenom: authUser.prenom ?? '', telephone: '', ville: '' });
        }
      })
      .finally(() => setLoadingProfile(false));
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof EditableFields, value: string) =>
    setFields((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const dto: UpdateUtilisateurDto = {
        nom: fields.nom || undefined,
        prenom: fields.prenom || undefined,
        telephone: fields.telephone || undefined,
        ville: fields.ville || undefined,
      };
      const updated = await utilisateurApi.update(dto);
      setProfile(updated);
      setEditing(false);
      toast.success('Profil mis à jour avec succès.', { icon: <CheckCircle2 className="h-4 w-4" /> });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Erreur lors de la mise à jour.';
      toast.error(msg, { icon: <AlertCircle className="h-4 w-4" /> });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFields({
        nom: profile.nom ?? '',
        prenom: profile.prenom ?? '',
        telephone: profile.telephone ?? '',
        ville: profile.ville ?? '',
      });
    }
    setAvatarPreview(null);
    setEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: upload to /utilisateur/me/avatar when endpoint is ready
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    dispatch(authActions.logout());
    navigate('/login', { replace: true });
  };

  if (!isAuthenticated || (!profile && loadingProfile)) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center text-zinc-500">
          Chargement du profil…
        </div>
      </div>
    );
  }

  const displayUser = profile ?? authUser;
  const fullName = [fields.prenom, fields.nom].filter(Boolean).join(' ') || displayUser?.email || '—';
  const initials = getInitials(fields.prenom, fields.nom);
  const avatarSrc = avatarPreview ?? displayUser?.avatarUrl ?? null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl" />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-red-400">Mon compte</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight">Profil</h1>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-zinc-300 transition hover:bg-white/8"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-zinc-200 transition hover:bg-white/8"
              >
                <Edit3 className="h-4 w-4" />
                Modifier
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Left: Avatar card */}
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-white/8 bg-zinc-950 p-6 text-center">
              {/* Avatar */}
              <div className="relative mx-auto mb-4 h-28 w-28">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={fullName}
                    className="h-full w-full rounded-full object-cover ring-2 ring-red-500/50 ring-offset-2 ring-offset-zinc-950"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-3xl font-black ring-2 ring-red-500/50 ring-offset-2 ring-offset-zinc-950">
                    {initials}
                  </div>
                )}
                {editing && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-950 bg-red-600 text-white shadow-lg transition hover:bg-red-500"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </div>

              <h2 className="text-lg font-black leading-tight">{fullName}</h2>
              <p className="mt-1 text-xs font-bold text-zinc-500">{displayUser?.email}</p>

              <div className="mt-4 rounded-xl border border-white/8 bg-white/4 px-3 py-2">
                <p className="text-xs font-bold text-zinc-500">Rôle</p>
                <p className="text-sm font-black text-red-400">{displayUser?.role ?? 'CLIENT'}</p>
              </div>

              {profile?.statut && (
                <div className="mt-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2">
                  <p className="text-xs font-bold text-zinc-500">Statut</p>
                  <p
                    className={`text-sm font-black ${
                      profile.statut === 'ACTIF'
                        ? 'text-green-400'
                        : profile.statut === 'BANNI'
                          ? 'text-red-400'
                          : 'text-amber-400'
                    }`}
                  >
                    {profile.statut}
                  </p>
                </div>
              )}
            </div>

            {/* Quick links */}
            <nav className="rounded-3xl border border-white/8 bg-zinc-950 p-3">
              {[
                { to: '/reservations', icon: <Ticket className="h-4 w-4" />, label: 'Mes réservations' },
                { to: '/historique', icon: <History className="h-4 w-4" />, label: 'Historique' },
                { to: '/forgot-password', icon: <Lock className="h-4 w-4" />, label: 'Changer mot de passe' },
              ].map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-zinc-300 transition hover:bg-white/6 hover:text-white"
                >
                  <span className="text-red-400">{icon}</span>
                  {label}
                  <ChevronRight className="ml-auto h-4 w-4 text-zinc-600" />
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-xl border-t border-white/6 px-3 py-3 text-sm font-bold text-zinc-400 transition hover:bg-red-600/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
                <ChevronRight className="ml-auto h-4 w-4 text-zinc-600" />
              </button>
            </nav>
          </div>

          {/* Right: Info + Security */}
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                label="Réservations"
                value={profile?.nbReservations ?? '—'}
                icon={<Ticket className="h-3.5 w-3.5" />}
              />
              <StatCard
                label="Films vus"
                value={profile?.nbFilmsVus ?? '—'}
                icon={<History className="h-3.5 w-3.5" />}
              />
              <StatCard
                label="Membre depuis"
                value={formatJoinDate(profile?.createdAt)}
                icon={<Calendar className="h-3.5 w-3.5" />}
              />
            </div>

            {/* Personal info */}
            <section className="rounded-3xl border border-white/8 bg-zinc-950 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500">
                <User className="h-3.5 w-3.5 text-red-400" />
                Informations personnelles
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow
                  icon={<User className="h-4 w-4" />}
                  label="Prénom"
                  field="prenom"
                  value={fields.prenom}
                  editing={editing}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                />
                <InfoRow
                  icon={<User className="h-4 w-4" />}
                  label="Nom"
                  field="nom"
                  value={fields.nom}
                  editing={editing}
                  onChange={handleChange}
                  placeholder="Votre nom"
                />
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  field="prenom" // email is read-only
                  value={displayUser?.email ?? ''}
                  editing={false}
                  readOnly
                  onChange={handleChange}
                />
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Téléphone"
                  field="telephone"
                  value={fields.telephone}
                  editing={editing}
                  onChange={handleChange}
                  placeholder="+212 6 XX XX XX XX"
                />
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Ville"
                  field="ville"
                  value={fields.ville}
                  editing={editing}
                  onChange={handleChange}
                  placeholder="Casablanca, Rabat…"
                />
              </div>
            </section>

            {/* Security */}
            <section className="rounded-3xl border border-white/8 bg-zinc-950 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500">
                <Shield className="h-3.5 w-3.5 text-red-400" />
                Sécurité
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-zinc-200">Mot de passe</p>
                  <p className="text-xs text-zinc-500">Réinitialisable par email</p>
                </div>
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-zinc-300 transition hover:bg-white/8 hover:text-white"
                >
                  <Lock className="h-4 w-4 text-red-400" />
                  Modifier le mot de passe
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}