import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Outlet />
    </main>
  );
}
