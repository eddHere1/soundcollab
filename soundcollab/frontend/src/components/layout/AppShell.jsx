import Navbar from './Navbar';
import MusicPlayerBar from './MusicPlayerBar';

export default function AppShell({ children, fullWidth = false }) {
  return (
    <div className="flex min-h-screen flex-col bg-base">
      <Navbar />
      <div className="relative flex flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-50" />
        <main
          className={`relative flex-1 overflow-y-auto animate-fade-in ${
            fullWidth ? '' : 'mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8'
          }`}
        >
          {children}
        </main>
        <MusicPlayerBar />
      </div>
    </div>
  );
}
