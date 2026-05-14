import Header from "./components/Header";
import MetricsChart from "./components/MetricsChart";
import Alerts from "./components/Alerts";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Server Metrics
            </h2>
            <MetricsChart />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              System Status
            </h2>
            <Alerts />
          </section>
        </div>
      </main>
    </div>
  );
}
