'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { CountryData } from '@/types';
import { calculateTotalThreats, calculateInterceptionRate } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

interface TheatreMapProps {
  countries: CountryData[];
}

// Custom marker icon
const createIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div style="font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Iran marker
const iranCoords: [number, number] = [32.4279, 53.688];

export default function TheatreMap({ countries }: TheatreMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Center of GCC region
  const center: [number, number] = [26.5, 51.0];

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Iran - source of attacks */}
      <Marker position={iranCoords} icon={createIcon('🇮🇷')}>
        <Popup>
          <div className="text-center">
            <strong>Iran</strong>
            <br />
            <span className="text-red-500">Attack Origin</span>
          </div>
        </Popup>
      </Marker>

      {/* Threat radius from Iran */}
      <Circle
        center={iranCoords}
        radius={1500000}
        pathOptions={{
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.05,
          weight: 1,
          dashArray: '5, 5',
        }}
      />

      {/* GCC Countries */}
      {countries.filter((c) => c.coordinates?.lat != null && c.coordinates?.lng != null).map((country) => {
        const threats = calculateTotalThreats(country.cumulative);
        const rate = calculateInterceptionRate(country.cumulative);
        const coords: [number, number] = [
          country.coordinates.lat,
          country.coordinates.lng,
        ];

        return (
          <Marker
            key={country.countryCode}
            position={coords}
            icon={createIcon(country.flag)}
          >
            <Popup>
              <div className="text-center min-w-[150px]">
                <strong className="text-lg">{country.flag} {country.country}</strong>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Threats:</span>
                    <span className="font-bold text-red-500">{threats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Intercept Rate:</span>
                    <span className="font-bold text-green-500">{rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Casualties:</span>
                    <span className="font-bold">
                      {country.cumulative.killed + country.cumulative.injured}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Impact sites */}
      {countries.flatMap((country) =>
        country.impactSites
          .filter((site) => site.lat != null && site.lng != null)
          .map((site, idx) => (
            <Circle
              key={`${country.countryCode}-impact-${idx}`}
              center={[site.lat, site.lng]}
              radius={5000}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.5,
              }}
            >
              <Popup>
                <div>
                  <strong>Impact Site</strong>
                  <br />
                  {site.date} - {site.type}
                  {site.description && <p>{site.description}</p>}
                </div>
              </Popup>
            </Circle>
          ))
      )}
    </MapContainer>
  );
}
