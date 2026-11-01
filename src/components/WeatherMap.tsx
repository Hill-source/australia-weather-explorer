
"use client";

import { useEffect, useRef } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";

import {
  type Metric,
  type WeatherStation,
  colorFor,
  getReading,
} from "@/lib/weather";

type Props = {
  stations: WeatherStation[];
  metric: Metric;
  selectedId: string | null;
  onSelect: (id: string) => void;
  resetCount: number;
};

const AUSTRALIA_BOUNDS: [[number, number], [number, number]] = [
  [112, -44.5],
  [155, -9],
];

function toGeoJSON(
  stations: WeatherStation[],
  metric: Metric,
  selectedId: string | null
) {
  return {
    type: "FeatureCollection" as const,
    features: stations.map((station) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [station.longitude, station.latitude],
      },
      properties: {
        id: station.id,
        name: station.name,
        color: colorFor(metric, getReading(station, metric)),
        selected: station.id === selectedId,
      },
    })),
  };
}

export default function WeatherMap({
  stations,
  metric,
  selectedId,
  onSelect,
  resetCount,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);
  const dataRef = useRef({ stations, metric, selectedId });

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    dataRef.current = { stations, metric, selectedId };

    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource("weather-stations") as
      | GeoJSONSource
      | undefined;

    if (source) {
      source.setData(toGeoJSON(stations, metric, selectedId));
    }
  }, [stations, metric, selectedId]);

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    setWorkerUrl(
      new URL(
        "maplibre-gl/dist/maplibre-gl-worker.mjs",
        import.meta.url
      ).toString()
    );

    const map = new MapLibreMap({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [134, -26],
      zoom: 3,
    });

    mapRef.current = map;

    map.addControl(
      new NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", () => {
      map.fitBounds(AUSTRALIA_BOUNDS, {
        padding: 35,
        duration: 0,
      });

      const current = dataRef.current;

      map.addSource("weather-stations", {
        type: "geojson",
        data: toGeoJSON(
          current.stations,
          current.metric,
          current.selectedId
        ),
      });

      map.addLayer({
        id: "weather-circles",
        type: "circle",
        source: "weather-stations",
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": [
            "case",
            ["get", "selected"],
            13,
            9,
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": [
            "case",
            ["get", "selected"],
            4,
            2,
          ],
          "circle-opacity": 0.95,
        },
      });

      map.addLayer({
        id: "weather-labels",
        type: "symbol",
        source: "weather-stations",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#263348",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });

      map.on("click", "weather-circles", (event) => {
        const id = event.features?.[0]?.properties?.id;

        if (typeof id === "string") {
          onSelectRef.current(id);
        }
      });

      map.on("mouseenter", "weather-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "weather-circles", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fly to the selected station.
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;

    const station = stations.find(
      (item) => item.id === selectedId
    );

    if (station) {
      mapRef.current.flyTo({
        center: [station.longitude, station.latitude],
        zoom: 5,
        essential: true,
      });
    }
  }, [selectedId, stations]);

  // Restore the national view.
  useEffect(() => {
    if (resetCount > 0) {
      mapRef.current?.fitBounds(AUSTRALIA_BOUNDS, {
        padding: 35,
        duration: 800,
      });
    }
  }, [resetCount]);

  return <div ref={containerRef} className="weather-map" />;
}
