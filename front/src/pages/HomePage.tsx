import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

const upcomingMovies = [
  {
    title: 'Les Ombres du Passé',
    genre: 'Thriller',
    image:
      'https://images.unsplash.com/photo-1619347903021-4d286ec4e8f1?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Royaume des Étoiles',
    genre: 'Fantaisie',
    image:
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Apocalypse Stellaire',
    genre: 'Science-Fiction',
    image:
      'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'La Dernière Séance',
    genre: 'Drame',
    image:
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Légende Urbaine',
    genre: 'Action',
    image:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Logo showText={false} size="md" />
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/30"
            >
              Se connecter
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">Prochainement</h1>
            <p className="text-zinc-300">
              Découvrez les films à venir et consultez les séances dans votre cinéma.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto pb-6">
            <div className="flex w-max gap-6">
              {upcomingMovies.map((movie) => (
                <article
                  key={movie.title}
                  className="group w-[240px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
                >
                  <div className="relative">
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="h-[340px] w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="flex flex-col gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                        <button className="rounded-xl border border-white/30 bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/70">
                          Bande annonce
                        </button>
                        <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500">
                          Les séances
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-lg font-bold">{movie.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{movie.genre}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-4xl font-bold">Pourquoi nous ?</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
              <h3 className="text-2xl font-bold">Réservation rapide</h3>
              <p className="mt-3 text-zinc-300">
                Trouvez un film et réservez votre place en quelques clics.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
              <h3 className="text-2xl font-bold">Tickets instantanés</h3>
              <p className="mt-3 text-zinc-300">
                Recevez votre confirmation immédiatement après la réservation.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
              <h3 className="text-2xl font-bold">Choix des sièges</h3>
              <p className="mt-3 text-zinc-300">
                Sélectionnez les meilleurs sièges disponibles pour votre séance.
              </p>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
