
export type Metric =
  | "temperature"
  | "humidity"
  | "rainfall"
  | "wind";

export type WeatherStation = {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  wind: number;
};

// DEMO DATA - Not real BOM observations
export const stations: WeatherStation[] = [
  { id: "darwin", name: "Darwin", state: "NT", latitude: -12.46, longitude: 130.84, temperature: 32, humidity: 64, rainfall: 1.8, wind: 20 },
  { id: "alice", name: "Alice Springs", state: "NT", latitude: -23.70, longitude: 133.87, temperature: 31, humidity: 27, rainfall: 0, wind: 16 },
  { id: "perth", name: "Perth", state: "WA", latitude: -31.95, longitude: 115.86, temperature: 25, humidity: 43, rainfall: 0, wind: 22 },
  { id: "broome", name: "Broome", state: "WA", latitude: -17.96, longitude: 122.24, temperature: 33, humidity: 60, rainfall: 0, wind: 27 },
  { id: "adelaide", name: "Adelaide", state: "SA", latitude: -34.93, longitude: 138.60, temperature: 24, humidity: 48, rainfall: 0.4, wind: 18 },
  { id: "melbourne", name: "Melbourne", state: "VIC", latitude: -37.81, longitude: 144.96, temperature: 19, humidity: 61, rainfall: 2.1, wind: 23 },
  { id: "sydney", name: "Sydney", state: "NSW", latitude: -33.87, longitude: 151.21, temperature: 23, humidity: 69, rainfall: 5.4, wind: 17 },
  { id: "canberra", name: "Canberra", state: "ACT", latitude: -35.28, longitude: 149.13, temperature: 16, humidity: 53, rainfall: 0.1, wind: 12 },
  { id: "brisbane", name: "Brisbane", state: "QLD", latitude: -27.47, longitude: 153.03, temperature: 28, humidity: 70, rainfall: 1.1, wind: 20 },
  { id: "cairns", name: "Cairns", state: "QLD", latitude: -16.92, longitude: 145.77, temperature: 30, humidity: 76, rainfall: 9.2, wind: 14 },
  { id: "townsville", name: "Townsville", state: "QLD", latitude: -19.26, longitude: 146.82, temperature: 29, humidity: 66, rainfall: 2.7, wind: 19 },
  { id: "hobart", name: "Hobart", state: "TAS", latitude: -42.88, longitude: 147.33, temperature: 14, humidity: 73, rainfall: 4.4, wind: 28 },
];

export const metrics: {
  id: Metric;
  label: string;
  unit: string;
}[] = [
  { id: "temperature", label: "Temperature", unit: "°C" },
  { id: "humidity", label: "Humidity", unit: "%" },
  { id: "rainfall", label: "Rainfall", unit: "mm" },
  { id: "wind", label: "Wind speed", unit: "km/h" },
];

export function getReading(
  station: WeatherStation,
  metric: Metric
): number {
  return station[metric];
}

export function formatReading(
  metric: Metric,
  value: number
): string {
  const unit =
    metrics.find((m) => m.id === metric)?.unit ?? "";

  const decimals = metric === "rainfall" ? 1 : 0;

  return `${value.toFixed(decimals)} ${unit}`;
}

export function colorFor(
  metric: Metric,
  value: number
): string {
  if (metric === "temperature") {
    if (value < 16) return "#4285d4";
    if (value < 25) return "#37b9a1";
    if (value < 31) return "#f0b24d";
    return "#e86c55";
  }

  if (metric === "humidity") {
    if (value < 40) return "#e9b654";
    if (value < 60) return "#5fc1a7";
    return "#438bcf";
  }

  if (metric === "rainfall") {
    if (value < 0.2) return "#94a3b8";
    if (value < 2) return "#68c1e8";
    if (value < 5) return "#4285d4";
    return "#7659c7";
  }

  if (value < 15) return "#4bb5a3";
  if (value < 25) return "#e9b654";
  return "#e86c55";
}

export function getLegend(metric: Metric) {
  if (metric === "temperature") {
    return [
      { label: "<16°C", color: "#4285d4" },
      { label: "16–24°C", color: "#37b9a1" },
      { label: "25–30°C", color: "#f0b24d" },
      { label: "31°C+", color: "#e86c55" },
    ];
  }

  if (metric === "humidity") {
    return [
      { label: "<40%", color: "#e9b654" },
      { label: "40–59%", color: "#5fc1a7" },
      { label: "60%+", color: "#438bcf" },
    ];
  }

  if (metric === "rainfall") {
    return [
      { label: "<0.2 mm", color: "#94a3b8" },
      { label: "0.2–1.9 mm", color: "#68c1e8" },
      { label: "2–4.9 mm", color: "#4285d4" },
      { label: "5 mm+", color: "#7659c7" },
    ];
  }

  return [
    { label: "<15 km/h", color: "#4bb5a3" },
    { label: "15–24 km/h", color: "#e9b654" },
    { label: "25 km/h+", color: "#e86c55" },
  ];
}
