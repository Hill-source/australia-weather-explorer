
"use client";

import { useMemo, useState } from "react";
import {
  CloudSun,
  CloudRain,
  Database,
  Droplets,
  MapPin,
  RotateCcw,
  Search,
  Thermometer,
  Wind,
  X,
} from "lucide-react";

import WeatherMap from "@/components/WeatherMap";

import {
  stations,
  metrics,
  getReading,
  formatReading,
  getLegend,
  colorFor,
  type Metric,
} from "@/lib/weather";

const icons = {
  temperature: Thermometer,
  humidity: Droplets,
  rainfall: CloudRain,
  wind: Wind,
};

const states = [
  "ALL",
  "ACT",
  "NSW",
  "NT",
  "QLD",
  "SA",
  "TAS",
  "VIC",
  "WA",
];

export default function Home() {
  const [metric, setMetric] = useState<Metric>("temperature");
  const [query, setQuery] = useState("");
  const [state, setState] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resetCount, setResetCount] = useState(0);

  const filtered = useMemo(() => {
    return stations.filter((station) => {
      const matchesSearch = station.name
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesState =
        state === "ALL" || station.state === state;

      return matchesSearch && matchesState;
    });
  }, [query, state]);

  const selectedStation =
    filtered.find((station) => station.id === selectedId) ?? null;

  const values = filtered.map((s) => getReading(s, metric));
  const average = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : null;

  const maximum = values.length ? Math.max(...values) : null;
  const minimum = values.length ? Math.min(...values) : null;

  const currentMetric = metrics.find((m) => m.id === metric)!;

  function resetMap() {
    setSelectedId(null);
    setResetCount((current) => current + 1);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <CloudSun size={24} />
          </div>
          <div>
            <strong>WeatherScope</strong>
            <span>AUSTRALIA</span>
          </div>
        </div>

        <div className="sidebar-intro">
          <span className="eyebrow">WEATHER EXPLORER</span>
          <h1>Weather across Australia.</h1>
          <p>
            Explore weather conditions through an interactive
            geographical dashboard.
          </p>
        </div>

        <div className="control-group">
          <label className="control-label">WEATHER ATTRIBUTE</label>

          <div className="metric-grid">
            {metrics.map((item) => {
              const Icon = icons[item.id];

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`metric-button ${
                    metric === item.id ? "active" : ""
                  }`}
                  onClick={() => setMetric(item.id)}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="control-group">
          <label className="control-label" htmlFor="station-search">
            SEARCH STATIONS
          </label>

          <div className="search-field">
            <Search size={17} />
            <input
              id="station-search"
              placeholder="Search a city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="control-group">
          <label className="control-label" htmlFor="state-select">
            STATE OR TERRITORY
          </label>

          <select
            id="state-select"
            className="state-select"
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setSelectedId(null);
            }}
          >
            {states.map((item) => (
              <option value={item} key={item}>
                {item === "ALL" ? "All Australia" : item}
              </option>
            ))}
          </select>
        </div>

        <div className="stations-section">
          <div className="stations-heading">
            <span className="control-label">STATIONS</span>
            <span className="station-count">{filtered.length}</span>
          </div>

          <div className="station-list">
            {filtered.map((station) => (
              <button
                key={station.id}
                type="button"
                className={`station-row ${
                  selectedId === station.id ? "selected" : ""
                }`}
                onClick={() => setSelectedId(station.id)}
              >
                <div className="station-name">
                  <MapPin size={15} />
                  <div>
                    <strong>{station.name}</strong>
                    <small>{station.state}</small>
                  </div>
                </div>

                <span className="station-value">
                  {formatReading(metric, getReading(station, metric))}
                </span>
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="empty-state">No matching stations.</p>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <Database size={16} />
          <div>
            <strong>Demo data</strong>
            <span>Real BOM connection coming in Stage 1B</span>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-location">
            <MapPin size={17} />
            Australia / Weather Explorer
          </div>

          <div className="status-pill">
            <span className="status-dot" />
            DEMO MODE
          </div>
        </header>

        <div className="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">GEOSPATIAL WEATHER DASHBOARD</div>
              <h2>National weather overview</h2>
              <p>
                Explore sample station observations using an interactive
                map of Australia.
              </p>
            </div>

            <button className="reset-button" onClick={resetMap}>
              <RotateCcw size={16} />
              Reset map
            </button>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <span>STATIONS DISPLAYED</span>
              <strong>{filtered.length}</strong>
              <small>Across selected regions</small>
            </div>

            <div className="stat-card">
              <span>AVERAGE {currentMetric.label.toUpperCase()}</span>
              <strong>
                {average === null
                  ? "—"
                  : formatReading(metric, average)}
              </strong>
              <small>Illustrative average</small>
            </div>

            <div className="stat-card">
              <span>MIN / MAX</span>
              <strong className="range-value">
                {minimum === null
                  ? "—"
                  : `${formatReading(metric, minimum)} / ${formatReading(
                      metric,
                      maximum!
                    )}`}
              </strong>
              <small>Selected observation range</small>
            </div>
          </div>

          <section className="map-panel">
            <WeatherMap
              stations={filtered}
              metric={metric}
              selectedId={selectedId}
              onSelect={setSelectedId}
              resetCount={resetCount}
            />

            <div className="map-layer-label">
              <span>ACTIVE MAP LAYER</span>
              <strong>{currentMetric.label}</strong>
            </div>

            <div className="map-legend">
              <strong>{currentMetric.label} legend</strong>
              <div className="legend-items">
                {getLegend(metric).map((item) => (
                  <div className="legend-item" key={item.label}>
                    <span
                      className="legend-dot"
                      style={{ background: item.color }}
                    />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {selectedStation ? (
              <div className="detail-card">
                <div className="detail-header">
                  <div>
                    <span>SELECTED STATION</span>
                    <h3>{selectedStation.name}</h3>
                    <p>{selectedStation.state}, Australia</p>
                  </div>

                  <button
                    className="close-detail"
                    aria-label="Close station details"
                    onClick={() => setSelectedId(null)}
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="detail-reading">
                  <span
                    className="reading-dot"
                    style={{
                      background: colorFor(
                        metric,
                        getReading(selectedStation, metric)
                      ),
                    }}
                  />
                  <strong>
                    {formatReading(
                      metric,
                      getReading(selectedStation, metric)
                    )}
                  </strong>
                  <span>{currentMetric.label}</span>
                </div>

                <div className="detail-grid">
                  <div>
                    <Thermometer size={15} />
                    <span>Temperature</span>
                    <strong>
                      {formatReading(
                        "temperature",
                        selectedStation.temperature
                      )}
                    </strong>
                  </div>

                  <div>
                    <Droplets size={15} />
                    <span>Humidity</span>
                    <strong>
                      {formatReading(
                        "humidity",
                        selectedStation.humidity
                      )}
                    </strong>
                  </div>

                  <div>
                    <CloudRain size={15} />
                    <span>Rainfall</span>
                    <strong>
                      {formatReading(
                        "rainfall",
                        selectedStation.rainfall
                      )}
                    </strong>
                  </div>

                  <div>
                    <Wind size={15} />
                    <span>Wind</span>
                    <strong>
                      {formatReading("wind", selectedStation.wind)}
                    </strong>
                  </div>
                </div>

                <p className="detail-note">
                  Illustrative values — not live BOM observations.
                </p>
              </div>
            ) : (
              <div className="map-hint">
                <MapPin size={16} />
                Click a station to view its readings
              </div>
            )}
          </section>

          <footer className="page-footer">
            <span>WeatherScope Australia · Frontend prototype</span>
            <span>Weather values are simulated for demonstration.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
