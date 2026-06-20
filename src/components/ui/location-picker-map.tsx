"use client";

import { useEffect, useRef } from "react";

interface MapContentProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

export function MapContent({ latitude, longitude, onLocationChange }: MapContentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;

    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      // Fix default icon
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const center: [number, number] = latitude && longitude 
        ? [latitude, longitude] 
        : [-6.2088, 106.8456];

      const map = L.map(mapRef.current).setView(center, 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker(center, { draggable: true }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onLocationChange(pos.lat, pos.lng);
      });

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng);
        onLocationChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      mountedRef.current = true;
    };

    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
        mountedRef.current = false;
      }
    };
  }, [latitude, longitude, onLocationChange]);

  useEffect(() => {
    if (markerRef.current && latitude && longitude) {
      const marker = markerRef.current as { setLatLng: (latlng: [number, number]) => void };
      marker.setLatLng([latitude, longitude]);
      
      if (mapInstanceRef.current) {
        const map = mapInstanceRef.current as { setView: (latlng: [number, number], zoom: number) => void };
        map.setView([latitude, longitude], 15);
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="rounded-xl overflow-hidden border" style={{ height: "300px" }}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
