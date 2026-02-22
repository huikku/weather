import { SearchBar } from '@/components/SearchBar';
import { AIReport } from '@/components/AIReport';
import { CurrentWeather } from '@/components/CurrentWeather';
import { HourlyForecast } from '@/components/HourlyForecast';
import { DailyForecast } from '@/components/DailyForecast';
import { WeatherAlerts } from '@/components/WeatherAlerts';
import { useWeather } from '@/hooks/useWeather';
import { motion } from 'framer-motion';
import { CloudSun, Loader2, RefreshCw } from 'lucide-react';

function Welcome() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <CloudSun className="w-16 h-16 text-primary/60 mb-4" />
      </motion.div>
      <h1 className="font-heading font-bold text-3xl tracking-tight mb-2">Weather</h1>
      <p className="text-muted-foreground text-sm max-w-xs">
        Search for a city or allow location access to get started.
      </p>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm">Fetching weather...</p>
    </div>
  );
}

export default function App() {
  const {
    location, weather, alerts, report,
    loading, error, units,
    selectLocation, toggleUnits, loadWeather,
  } = useWeather();

  return (
    <div className="max-w-[720px] mx-auto px-4 py-5 min-h-screen flex flex-col">
      <SearchBar
        onSelect={selectLocation}
        units={units}
        onToggleUnits={toggleUnits}
      />

      {loading && <LoadingState />}

      {!loading && !weather && <Welcome />}

      {!loading && weather && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1"
        >
          <WeatherAlerts alerts={alerts} />
          <AIReport report={report} />
          <CurrentWeather weather={weather} location={location} units={units} />
          <HourlyForecast weather={weather} />
          <DailyForecast weather={weather} />

          {/* Refresh button */}
          <div className="flex justify-center py-4">
            <button
              onClick={loadWeather}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </motion.main>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <footer className="text-center py-6 mt-auto text-muted-foreground text-xs">
        Weather data by{' '}
        <a href="https://open-meteo.com" target="_blank" rel="noopener" className="text-primary hover:underline">
          Open-Meteo
        </a>
        {' & '}
        <a href="https://weather.gov" target="_blank" rel="noopener" className="text-primary hover:underline">
          NWS
        </a>
        {' · No ads, no tracking'}
      </footer>
    </div>
  );
}
