import Navbar from '@/components/Navbar';
import WatchlistPanel from '@/components/WatchlistPanel';
import SectorHeatmap from '@/components/SectorHeatmap';
import HoldingsPanel from '@/components/HoldingsPanel';
import AlertsPanel from '@/components/AlertsPanel';
import MorningBrief from '@/components/MorningBrief';
import Footer from '@/components/Footer';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-whale-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Top row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WatchlistPanel />
          </div>
          <div className="lg:col-span-2">
            <SectorHeatmap />
          </div>
        </div>

        {/* Morning brief */}
        <MorningBrief />

        {/* Holdings */}
        <HoldingsPanel />

        {/* Alerts */}
        <AlertsPanel />

        <Footer />
      </main>
    </div>
  );
}
