"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation, Search, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddressData {
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: AddressData) => void;
  className?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
  className,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [mounted, setMounted] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`
      );
      const data = await response.json();

      if (data.address) {
        const addr = data.address;
        const addressParts = [
          addr.road || addr.pedestrian || addr.path || '',
          addr.house_number || '',
        ].filter(Boolean);

        const addressData: AddressData = {
          address: addressParts.join(' ') || data.display_name?.split(',').slice(0, 2).join(', ') || '',
          city: addr.city || addr.town || addr.village || addr.suburb || addr.city_district || '',
          province: addr.state || addr.province || '',
          postalCode: addr.postcode || '',
        };

        if (onAddressChange) {
          onAddressChange(addressData);
        }
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  // Initialize map only once on mount
  useEffect(() => {
    if (mounted) return;
    
    const initMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const L = (await import("leaflet")).default;

      // Fix default icon issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Default center: Jakarta or provided coordinates
      const center: [number, number] = latitude && longitude 
        ? [latitude, longitude] 
        : [-6.2088, 106.8456];

      const map = L.map(mapContainerRef.current).setView(center, 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker(center, { draggable: true }).addTo(map);

      // Handle marker drag
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onLocationChange(pos.lat, pos.lng);
        reverseGeocode(pos.lat, pos.lng);
      });

      // Handle map click
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng);
        onLocationChange(e.latlng.lat, e.latlng.lng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setMounted(true);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
        markerRef.current = null;
        setMounted(false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (markerRef.current && latitude && longitude && mounted) {
      const marker = markerRef.current as { setLatLng: (latlng: [number, number]) => void };
      marker.setLatLng([latitude, longitude]);
      
      if (mapRef.current) {
        const map = mapRef.current as { setView: (latlng: [number, number], zoom: number) => void };
        map.setView([latitude, longitude], 15);
      }
    }
  }, [latitude, longitude, mounted]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=id`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch {
      toast.error("Gagal mencari alamat");
    }
    setSearching(false);
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onLocationChange(lat, lng);
    reverseGeocode(lat, lng);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange(position.coords.latitude, position.coords.longitude);
        reverseGeocode(position.coords.latitude, position.coords.longitude);
        setGettingLocation(false);
        toast.success("Lokasi berhasil didapatkan");
      },
      (error) => {
        toast.error("Gagal mendapatkan lokasi: " + error.message);
        setGettingLocation(false);
      }
    );
  };

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="relative mb-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Cari alamat..."
              className="pl-9"
            />
          </div>
          <Button type="button" onClick={handleSearch} disabled={searching} variant="outline">
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Cari"
            )}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute z-[1000] w-full mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-muted text-sm border-b last:border-b-0 transition-colors"
                onClick={() => handleSelectResult(result)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="line-clamp-2">{result.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="rounded-xl overflow-hidden border" style={{ height: "300px" }}>
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Coordinates Display & Actions */}
      <div className="mt-3 space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Latitude</p>
            <p className="font-mono text-sm">{latitude?.toFixed(6) || "-"}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Longitude</p>
            <p className="font-mono text-sm">{longitude?.toFixed(6) || "-"}</p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          disabled={gettingLocation}
          className="w-full"
        >
          {gettingLocation ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mendapatkan lokasi...
            </>
          ) : (
            <>
              <Navigation className="mr-2 h-4 w-4" />
              Gunakan Lokasi Saat Ini
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Klik pada peta atau drag marker untuk memilih lokasi. Alamat akan terisi otomatis.
        </p>
      </div>
    </div>
  );
}
