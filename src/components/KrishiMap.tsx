import { useEffect, useMemo, useState } from "react";
import { DivIcon } from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { Language, RegionId, regionEntries } from "@/data/krishiMysuru";

type KrishiMapProps = {
  selectedId: RegionId;
  language: Language;
  onSelect: (id: RegionId) => void;
};

function FocusRegion({ selectedId }: { selectedId: RegionId }) {
  const map = useMap();
  const [, region] = regionEntries.find(([id]) => id === selectedId) ?? regionEntries[0];

  useEffect(() => {
    map.flyTo([region.lat, region.lng], selectedId === "gokulam" ? 12 : 11, { duration: 1.1, easeLinearity: 0.25 });
  }, [map, region.lat, region.lng, selectedId]);

  return null;
}

function makePin(color: string, active: boolean) {
  return new DivIcon({
    className: "",
    html: `<div class="krishi-pin" style="background:${color};width:${active ? 30 : 24}px;height:${active ? 30 : 24}px"></div>`,
    iconSize: [active ? 30 : 24, active ? 30 : 24],
    iconAnchor: [active ? 15 : 12, active ? 15 : 12],
  });
}

export function KrishiMap({ selectedId, language, onSelect }: KrishiMapProps) {
  const [isLoadingTiles, setIsLoadingTiles] = useState(true);
  const [mapError, setMapError] = useState(false);
  const markers = useMemo(
    () =>
      regionEntries.map(([id, region]) => ({
        id,
        region,
        icon: makePin(region.color, id === selectedId),
      })),
    [selectedId],
  );

  useEffect(() => {
    if (!isLoadingTiles) return;

    const timeout = window.setTimeout(() => {
      setIsLoadingTiles(false);
      setMapError(true);
    }, 9000);

    return () => window.clearTimeout(timeout);
  }, [isLoadingTiles]);

  return (
    <div className="relative h-full min-h-[100svh] w-full overflow-hidden bg-background">
      <MapContainer center={[12.32, 76.62]} zoom={10} minZoom={8} maxZoom={15} zoomControl className="absolute inset-0 z-0 h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          eventHandlers={{
            loading: () => {
              setIsLoadingTiles(true);
              setMapError(false);
            },
            load: () => {
              setIsLoadingTiles(false);
              setMapError(false);
            },
            tileerror: () => {
              setIsLoadingTiles(false);
              setMapError(true);
            },
          }}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FocusRegion selectedId={selectedId} />
        {markers.map(({ id, region, icon }) => (
          <Marker key={id} position={[region.lat, region.lng]} icon={icon} eventHandlers={{ click: () => onSelect(id) }}>
            <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
              {region[language].name} · pH {region.ph.toFixed(1)}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {isLoadingTiles && !mapError && (
        <div className="pointer-events-none absolute inset-0 z-[700] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="rounded-lg border border-glass-border bg-glass/92 px-5 py-4 text-center text-glass-foreground shadow-glass">
            <div className="mx-auto mb-3 size-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm font-bold">Loading Mysuru map…</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 z-[700] flex items-center justify-center bg-background/72 p-5 backdrop-blur-sm">
          <div className="max-w-sm rounded-lg border border-warning bg-warning p-5 text-center text-warning-foreground shadow-glass">
            <p className="font-display text-lg font-black">Map tiles failed to load</p>
            <p className="mt-2 text-sm font-medium leading-relaxed">
              Please refresh the preview or check your connection. Field pins and intelligence data are still available when tiles load.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
