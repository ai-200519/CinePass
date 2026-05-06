import { ChevronRight, Clock3, Play, Star, Ticket } from 'lucide-react';

type MovieCardProps = {
  title: string;
  genre: string;
  rating: string;
  image: string;
  age?: string;
  language?: string;
  format?: string;
  badge?: string;
  duration?: string;
  times?: string[];
  onDetails?: () => void;
};

export default function MovieCard({
  title,
  genre,
  rating,
  image,
  age = 'TP',
  language = 'VF',
  format = '2D',
  badge,
  duration = '2h00',
  times = [],
  onDetails,
}: MovieCardProps) {
  const ratingNumber = Number(rating);
  const safeRating = Number.isFinite(ratingNumber) ? ratingNumber : 0;

  return (
    <article className="group overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-red-500/40">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-800">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

        {badge && (
          <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2.5 py-1 text-xs font-black uppercase text-white shadow-lg">
            {badge}
          </span>
        )}

        <button
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-950 shadow-lg transition hover:scale-105"
          aria-label={`Voir la bande annonce de ${title}`}
        >
          <Play className="h-4 w-4 fill-zinc-950" />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="rounded-md bg-white px-2 py-1 text-xs font-black text-zinc-950">{format}</span>
            <span className="rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-white backdrop-blur">
              {language}
            </span>
            <span className="rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-white backdrop-blur">
              {age}
            </span>
          </div>
          <h3 className="line-clamp-2 text-2xl font-black leading-tight text-white">{title}</h3>
        </div>
      </div>

      <div className="relative space-y-4 overflow-hidden p-4">
        <img
          src={image}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-10 blur-sm"
          loading="lazy"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-950/95 via-zinc-950/70 to-zinc-950/95" />

        <div className="flex items-center justify-between gap-3">
          <span className="rounded-md bg-white/5 px-3 py-1.5 text-sm font-bold text-zinc-300">{genre}</span>
          <span className="inline-flex items-center gap-2 rounded-md bg-black/70 px-2.5 py-1 text-sm font-black text-amber-300 backdrop-blur">
            <Star className="h-4 w-4 fill-amber-300 text-amber-300" aria-hidden="true" />
            {safeRating.toFixed(1)}/10
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Clock3 className="h-4 w-4 text-red-400" />
          <span>{duration}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {times.slice(0, 3).map((time) => (
            <button
              key={time}
              className="h-10 rounded-md border border-white/10 bg-zinc-950 text-sm font-black text-white transition hover:border-red-500 hover:text-red-300"
            >
              {time}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2 pt-1">
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-500">
            <Ticket className="h-4 w-4" />
            Reserver
          </button>
          <button
            type="button"
            onClick={onDetails}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 text-zinc-300 transition hover:border-white/30 hover:text-white"
            aria-label={`Voir les details de ${title}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
