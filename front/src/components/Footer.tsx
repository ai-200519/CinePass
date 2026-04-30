import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-900">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <Logo asset="logo" showText={false} size="lg" />
          <p className="mt-4 text-sm text-zinc-400">
            Réservez vos places de cinéma en quelques clics.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">À propos</h4>
          <ul className="mt-3 space-y-2 text-zinc-400">
            <li>Qui sommes-nous</li>
            <li>Contact</li>
            <li>FAQ</li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Informations légales</h4>
          <ul className="mt-3 space-y-2 text-zinc-400">
            <li>CGU</li>
            <li>Confidentialité</li>
            <li>Cookies</li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Suivez-nous</h4>
          <p className="mt-3 text-zinc-400">Facebook · Instagram · X</p>
        </div>
      </div>
    </footer>
  );
}
