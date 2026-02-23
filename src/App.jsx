import { SearchBar } from '@/components/SearchBar';
import { AIReport } from '@/components/AIReport';
import { CurrentWeather } from '@/components/CurrentWeather';
import { RadarMap } from '@/components/RadarMap';
import { HourlyForecast } from '@/components/HourlyForecast';
import { DailyForecast } from '@/components/DailyForecast';
import { WeatherAlerts } from '@/components/WeatherAlerts';
import { useWeather } from '@/hooks/useWeather';
import { useLocationHistory } from '@/hooks/useLocationHistory';
import { motion } from 'framer-motion';
import { CloudSun, Loader2, RefreshCw } from 'lucide-react';

function Welcome() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 sm:py-24 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <CloudSun className="w-14 h-14 sm:w-16 sm:h-16 text-primary/60 mb-4" />
      </motion.div>
      <h1 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight mb-2">Weather</h1>
      <p className="text-muted-foreground text-sm max-w-xs px-4">
        Search for a city or allow location access to get started.
      </p>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 sm:py-24 gap-4 text-muted-foreground">
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

  const { history, addToHistory, clearHistory } = useLocationHistory();

  const handleSelect = (loc) => {
    selectLocation(loc);
    addToHistory(loc);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 min-h-screen flex flex-col">
      <div className="max-w-[720px] mx-auto w-full mb-6 relative z-50">
        <SearchBar
          onSelect={handleSelect}
          units={units}
          onToggleUnits={toggleUnits}
          history={history}
          onClearHistory={clearHistory}
        />
      </div>

      {loading && <LoadingState />}

      {!loading && !weather && <Welcome />}

      {!loading && weather && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 w-full"
        >
          {/* Alerts — full width */}
          <WeatherAlerts alerts={alerts} />

          {/* AI Report — full width under search bar */}
          <div className="mb-4 sm:mb-6">
            <AIReport report={report} units={units} />
          </div>

          {/* 3-column grid: Current | Hourly | Daily */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">

            {/* Left Column (Current Weather + Radar) */}
            <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
              <CurrentWeather weather={weather} location={location} units={units} />
              {location && <RadarMap lat={location.lat} lon={location.lon} />}
            </div>

            {/* Middle Column (Hourly) */}
            <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
              <HourlyForecast weather={weather} />
            </div>

            {/* Right Column (Daily Forecast) */}
            <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6 md:col-span-2 lg:col-span-4">
              <DailyForecast weather={weather} />
            </div>

          </div>



          {/* Refresh button */}
          <div className="flex justify-center py-8">
            <button
              onClick={loadWeather}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Data
            </button>
          </div>
        </motion.main>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <footer className="text-center py-4 sm:py-6 mt-auto text-muted-foreground text-xs">
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
