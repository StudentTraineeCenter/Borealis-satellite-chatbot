"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, GPSIcon } from "./icons";
import { cn } from "@/lib/utils";

const PRESET_LOCATIONS = {
  prague: { name: "Prague, CZ", lat: 50.0755, lon: 14.4378 },
  ostrava: { name: "Ostrava, CZ", lat: 49.8353, lon: 18.2822 },
};

export interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

interface LocationSelectorProps {
  selectedLocation?: LocationData;
  onLocationChange?: (location: LocationData) => void;
  className?: string;
}

export function LocationSelector({
  selectedLocation,
  onLocationChange,
  className,
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customLat, setCustomLat] = useState("");
  const [customLon, setCustomLon] = useState("");
  const [currentLocation, setCurrentLocation] = useState<LocationData | undefined>(
    selectedLocation
  );

  const handleLocationSelect = useCallback((location: LocationData) => {
    setCurrentLocation(location);
    onLocationChange?.(location);
    setOpen(false);
    setIsCustomMode(false);
  }, [onLocationChange]);

  const handleCustomLocationSubmit = useCallback(() => {
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);

    if (!isNaN(lat) && !isNaN(lon)) {
      const customLocation: LocationData = {
        name: `Custom (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        lat,
        lon,
      };
      handleLocationSelect(customLocation);
      setCustomLat("");
      setCustomLon("");
    }
  }, [customLat, customLon, handleLocationSelect]);

  const displayName = currentLocation?.name || "Select location";

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          className="h-8 px-2"
          data-testid="location-selector"
          variant="ghost"
        >
          <GPSIcon size={16} />
          <span className="hidden font-medium text-xs sm:block">
            {displayName}
          </span>
          <ChevronDownIcon size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {!isCustomMode ? (
          <>
            {Object.entries(PRESET_LOCATIONS).map(([key, location]) => (
              <DropdownMenuItem
                key={key}
                onSelect={() => handleLocationSelect(location)}
              >
                <button
                  className="w-full text-left"
                  type="button"
                >
                  <div className="font-medium text-sm">{location.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                  </div>
                </button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsCustomMode(true);
              }}
              asChild
            >
              <button
                className="w-full text-left font-medium text-sm px-2 py-1.5"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCustomMode(true);
                }}
              >
                Custom Location
              </button>
            </DropdownMenuItem>
          </>
        ) : (
          <div className="p-3 space-y-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Latitude</label>
              <input
                type="number"
                placeholder="e.g., 50.0755"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded bg-background border-input"
                step="0.0001"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Longitude</label>
              <input
                type="number"
                placeholder="e.g., 14.4378"
                value={customLon}
                onChange={(e) => setCustomLon(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded bg-background border-input"
                step="0.0001"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsCustomMode(false);
                  setCustomLat("");
                  setCustomLon("");
                }}
                className="flex-1 h-7"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCustomLocationSubmit}
                className="flex-1 h-7"
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
