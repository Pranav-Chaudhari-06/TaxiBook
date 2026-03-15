import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const greenIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="#22c55e"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`,
  iconSize: [24, 32],
  iconAnchor: [12, 32],
  className: '',
});

const redIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="#ef4444"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`,
  iconSize: [24, 32],
  iconAnchor: [12, 32],
  className: '',
});

const HereMap = ({ sourceCoords, destinationCoords, onRouteCalculated }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerGroup = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    layerGroup.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Draw route when coords change
  useEffect(() => {
    if (!mapInstance.current || !layerGroup.current) return;
    if (!sourceCoords?.lat || !destinationCoords?.lat) return;

    const map = mapInstance.current;
    layerGroup.current.clearLayers();

    // Add markers
    L.marker([sourceCoords.lat, sourceCoords.lng], { icon: greenIcon }).addTo(layerGroup.current);
    L.marker([destinationCoords.lat, destinationCoords.lng], { icon: redIcon }).addTo(layerGroup.current);

    // Fetch route from OSRM (free, no API key)
    const url = `https://router.project-osrm.org/route/v1/driving/${sourceCoords.lng},${sourceCoords.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];

          // Draw route polyline
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          const polyline = L.polyline(coords, { color: '#3b82f6', weight: 4 });
          polyline.addTo(layerGroup.current);

          // Fit map to route bounds
          map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

          // Return distance in km
          const distanceKm = route.distance / 1000;
          if (onRouteCalculated) {
            onRouteCalculated(Math.round(distanceKm * 10) / 10);
          }
        }
      })
      .catch((err) => {
        console.error('Route calculation error:', err);
        // Fallback: just fit to markers
        const bounds = L.latLngBounds(
          [sourceCoords.lat, sourceCoords.lng],
          [destinationCoords.lat, destinationCoords.lng]
        );
        map.fitBounds(bounds, { padding: [30, 30] });
      });
  }, [sourceCoords, destinationCoords, onRouteCalculated]);

  return <div ref={mapRef} className="w-full h-80 rounded-xl border border-surface-200" />;
};

export default HereMap;
