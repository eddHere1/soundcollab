import Navbar from './Navbar';
import MusicPlayerBar from './MusicPlayerBar';

export default function AppShell({ children, fullWidth = false }) {
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-base">
      <Navbar />
      <div className="relative flex flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-50" />
        <main
          className={`relative flex-1 overflow-y-auto overflow-x-hidden animate-fade-in pb-player ${
            fullWidth ? 'px-0' : 'mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8'
          }`}
        >
          {children}
        </main>
        <MusicPlayerBar />
      </div>
    </div>
  );
}
