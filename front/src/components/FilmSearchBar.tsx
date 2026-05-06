import { Search, X, Film, Clock3, Star } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectFilms } from '../features/films/filmsSelectors';
import type { Film as FilmType } from '../features/films/filmsApi';

const fallbackPoster =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=200&q=60';

const formatDuration = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`;
};

type FilmSearchBarProps = {
  /** Valeur de recherche contrôlée depuis le parent (HomePage) */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Afficher les suggestions dropdown */
  showSuggestions?: boolean;
};

export default function FilmSearchBar({
  value,
  onChange,
  placeholder = 'Rechercher un film, un genre, un réalisateur…',
  className = '',
  showSuggestions = true,
}: FilmSearchBarProps) {
  const navigate = useNavigate();
  const films = useAppSelector(selectFilms);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Filtrage local des suggestions ── */
  const suggestions: FilmType[] = value.trim().length >= 1
    ? films
        .filter((f) => {
          const q = value.toLowerCase();
          return (
            f.title.toLowerCase().includes(q) ||
            f.genre?.toLowerCase().includes(q) ||
            f.director?.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  /* ── Fermeture au clic extérieur ── */
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  /* ── Navigation clavier ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || !isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === 'Enter') {
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          navigate(`/films/${suggestions[highlightedIndex].id}`);
          setIsOpen(false);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
      }
    },
    [highlightedIndex, isOpen, navigate, showSuggestions, suggestions],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (film: FilmType) => {
    navigate(`/films/${film.id}`);
    setIsOpen(false);
    onChange('');
  };

  const showDropdown = showSuggestions && isOpen && value.trim().length >= 1;

  return (
    <div ref={containerRef} className={`relative ${className}`} role="combobox" aria-expanded={showDropdown} aria-haspopup="listbox">
      {/* ── Input ── */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-autocomplete="list"
          aria-controls="film-search-suggestions"
          value={value}
          onChange={handleChange}
          onFocus={() => value.trim().length >= 1 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-12 w-full rounded-lg border border-white/10 bg-zinc-900 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
          autoComplete="off"
          spellCheck={false}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Effacer la recherche"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-500 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Dropdown suggestions ── */}
      {showDropdown && (
        <div
          id="film-search-suggestions"
          role="listbox"
          aria-label="Suggestions de films"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60"
        >
          {suggestions.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-4 text-sm text-zinc-400">
              <Film className="h-4 w-4 shrink-0 text-zinc-600" aria-hidden="true" />
              Aucun film trouvé pour &laquo;&nbsp;{value}&nbsp;&raquo;
            </div>
          ) : (
            <ul>
              {suggestions.map((film, index) => (
                <li key={film.id} role="option" aria-selected={index === highlightedIndex}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(film)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                      index === highlightedIndex
                        ? 'bg-white/8 text-white'
                        : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    {/* Miniature */}
                    <img
                      src={film.poster || fallbackPoster}
                      alt=""
                      loading="lazy"
                      className="h-12 w-9 shrink-0 rounded-md object-cover"
                    />

                    {/* Infos */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{film.title}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
                        <span className="truncate">{film.genre}</span>
                        {film.duration > 0 && (
                          <>
                            <span className="text-zinc-700">·</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3 w-3" aria-hidden="true" />
                              {formatDuration(film.duration)}
                            </span>
                          </>
                        )}
                        {film.note > 0 && (
                          <>
                            <span className="text-zinc-700">·</span>
                            <span className="inline-flex items-center gap-1 text-amber-400">
                              <Star className="h-3 w-3 fill-amber-400" aria-hidden="true" />
                              {Number(film.note).toFixed(1)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Badge statut */}
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-black uppercase ${
                        film.isShowing
                          ? 'bg-red-600/20 text-red-400'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {film.isShowing ? 'Affiche' : 'A venir'}
                    </span>
                  </button>

                  {/* Séparateur */}
                  {index < suggestions.length - 1 && (
                    <div className="mx-4 h-px bg-white/5" />
                  )}
                </li>
              ))}

              {/* Lien "voir tous les résultats" */}
              <li role="option" aria-selected={false}>
                <div className="border-t border-white/5 px-4 py-2">
                  <p className="text-xs text-zinc-500">
                    {suggestions.length} résultat{suggestions.length > 1 ? 's' : ''} · Appuyez sur{' '}
                    <kbd className="rounded border border-white/10 bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                      Entrée
                    </kbd>{' '}
                    pour sélectionner
                  </p>
                </div>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}