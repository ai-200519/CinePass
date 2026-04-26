import { Link } from 'react-router-dom';
import iconPng from '../assets/icon.png';

type LogoProps = {
  to?: string;
  variant?: 'dark' | 'light';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export default function Logo({
  to = '/',
  size = 'sm',
}: LogoProps) {
  const imageSizeClass =
    size === 'lg' ? 'h-16 w-16' : size === 'md' ? 'h-12 w-12' : 'h-9 w-9';

  return (
    <Link
      to={to}
      aria-label="CinePass"
      className="inline-flex items-center"
    >
      <img
        src={iconPng}
        alt=""
        className={`${imageSizeClass} rounded-md object-contain`}
        loading="eager"
      />
    </Link>
  );
}
