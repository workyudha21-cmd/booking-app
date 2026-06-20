"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
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

// Dynamic import MapContent component (client-only)
const MapContent = dynamic(() => import("./location-picker-map").then(mod => mod.MapContent), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border bg-muted/50 flex items-center justify-center" style={{ height: "300px" }}>
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
  className,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

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

  const handleLocationChange = (lat: number, lng: number) => {
    onLocationChange(lat, lng);
    reverseGeocode(lat, lng);
  };

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
    handleLocationChange(lat, lng);
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
        handleLocationChange(position.coords.latitude, position.coords.longitude);
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
      <MapContent
        latitude={latitude}
        longitude={longitude}
        onLocationChange={handleLocationChange}
      />

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
