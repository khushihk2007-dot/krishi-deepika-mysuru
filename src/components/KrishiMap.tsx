import { useMemo } from "react";
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
  map.flyTo([region.lat, region.lng], selectedId === "gokulam" ? 12 : 11, { duration: 1.1, easeLinearity: 0.25 });
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
  const markers = useMemo(
    () =>
      regionEntries.map(([id, region]) => ({
        id,
        region,
        icon: makePin(region.color, id === selectedId),
      })),
    [selectedId],
  );

  return (
    <MapContainer center={[12.32, 76.62]} zoom={10} minZoom={8} maxZoom={15} zoomControl className="z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
  );
}
