import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo asset="logo" showText={false} size="lg" />
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Films, horaires et reservation cinema en quelques clics.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Cinema</h4>
          <ul className="mt-3 space-y-2 text-zinc-400">
            <li>Films a l affiche</li>
            <li>Prochainement</li>
            <li>Avant premieres</li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Aide</h4>
          <ul className="mt-3 space-y-2 text-zinc-400">
            <li>Tarifs</li>
            <li>Contact</li>
            <li>FAQ</li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Legal</h4>
          <ul className="mt-3 space-y-2 text-zinc-400">
            <li>CGU</li>
            <li>Confidentialite</li>
            <li>Cookies</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
