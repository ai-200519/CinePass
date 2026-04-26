type MovieCardProps = {
  title: string;
  genre: string;
  rating: string;
  image: string;
};

export default function MovieCard({ title, genre, rating, image }: MovieCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
      <img src={image} alt={title} className="h-80 w-full object-cover" />
      <div className="space-y-3 p-4">
        <h3 className="truncate text-2xl font-bold text-white">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">{genre}</span>
          <span className="text-zinc-300">⭐ {rating}</span>
        </div>
        <button className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500">
          Réserver
        </button>
      </div>
    </article>
  );
}
