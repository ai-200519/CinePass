import { Link } from 'react-router-dom';

type LogoProps = {
  to?: string;
  variant?: 'dark' | 'light';
};

export default function Logo({ to = '/', variant = 'dark' }: LogoProps) {
  const textClass = variant === 'light' ? 'text-zinc-900' : 'text-white';

  return (
    <Link to={to} className="inline-flex items-center gap-2" aria-label="CinePass">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-sm font-black text-white">
        C
      </span>
      <span className={`text-2xl font-extrabold leading-none ${textClass}`}>
        Cine<span className="text-red-600">Pass</span>
      </span>
    </Link>
  );
}
