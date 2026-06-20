"use client";

import { useEffect, useRef } from "react";

interface StoreMapProps {
  latitude: number;
  longitude: number;
  storeName: string;
  address?: string;
  height?: string;
}

export function StoreMap({ 
  latitude, 
  longitude, 
  storeName, 
  address,
  height = "200px" 
}: StoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([latitude, longitude], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker([latitude, longitude]).addTo(map);
      const popupContent = address 
        ? `<b>${storeName}</b><br>${address}`
        : `<b>${storeName}</b>`;
      marker.bindPopup(popupContent).openPopup();

      mapInstanceRef.current = map;
    };

    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, storeName, address]);

  return (
    <div 
      ref={mapRef} 
      className="w-full rounded-xl" 
      style={{ height }} 
    />
  );
}
