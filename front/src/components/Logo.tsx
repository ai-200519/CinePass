import { Link } from 'react-router-dom';
import iconPng from '../assets/icon.png';
import logoPng from '../assets/logo.png';

type LogoProps = {
  to?: string;
  variant?: 'dark' | 'light';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  asset?: 'icon' | 'logo';
};

export default function Logo({
  to = '/',
  size = 'sm',
  asset = 'icon',
}: LogoProps) {
  const imageSizeClass =
    asset === 'logo'
      ? size === 'lg'
        ? 'h-12 w-auto'
        : size === 'md'
          ? 'h-10 w-auto'
          : 'h-8 w-auto'
      : size === 'lg'
        ? 'h-16 w-16'
        : size === 'md'
          ? 'h-12 w-12'
          : 'h-9 w-9';

  return (
    <Link
      to={to}
      aria-label="CinePass"
      className="inline-flex items-center"
    >
      <img
        src={asset === 'logo' ? logoPng : iconPng}
        alt=""
        className={`${imageSizeClass} ${asset === 'logo' ? '' : 'rounded-md'} object-contain`}
        loading="eager"
      />
    </Link>
  );
}
