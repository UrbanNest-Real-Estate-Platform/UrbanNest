import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import axios from 'axios';

// Import Leaflet CSS if not already imported globally, usually in index.html
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons in React
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

const getPoiIcon = (type) => {
    return L.divIcon({
        className: 'custom-poi-icon',
        html: `<div style="background: white; border: 2px solid #4f46e5; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px;">${type === 'school' ? '🏫' : type === 'hospital' ? '🏥' : type === 'station' ? '🚉' : '🛒'
            }</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

export default function LocationMap({ location, address }) {
    const [pois, setPois] = useState([]);
    const [loadingPois, setLoadingPois] = useState(false);

    const lon = location?.coordinates?.[0] || 72.8777; // Default Mumbai
    const lat = location?.coordinates?.[1] || 19.0760;

    useEffect(() => {
        const fetchPOIs = async () => {
            setLoadingPois(true);
            try {
                // Overpass API Query for schools, hospitals, transit, and supermarkets within 2km
                const query = `
                    [out:json][timeout:25];
                    (
                      node["amenity"="school"](around:2000,${lat},${lon});
                      node["amenity"="hospital"](around:2000,${lat},${lon});
                      node["public_transport"="station"](around:2000,${lat},${lon});
                      node["shop"="supermarket"](around:2000,${lat},${lon});
                    );
                    out center 20;
                `;

                const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
                    headers: { 'Content-Type': 'text/plain' }
                });

                if (response.data && response.data.elements) {
                    const parsedPois = response.data.elements.map(el => {
                        let type = 'unknown';
                        if (el.tags?.amenity === 'school') type = 'school';
                        if (el.tags?.amenity === 'hospital') type = 'hospital';
                        if (el.tags?.public_transport === 'station') type = 'station';
                        if (el.tags?.shop === 'supermarket') type = 'supermarket';

                        return {
                            id: el.id,
                            lat: el.lat || el.center?.lat,
                            lon: el.lon || el.center?.lon,
                            name: el.tags?.name || `Unnamed ${type}`,
                            type
                        };
                    }).filter(poi => poi.lat && poi.lon); // ensure coords exist

                    // Group by type for chips
                    setPois(parsedPois);
                }
            } catch (error) {
                console.error("Failed to fetch POIs from Overpass API", error);
            } finally {
                setLoadingPois(false);
            }
        };

        if (lat && lon) {
            fetchPOIs();
        }
    }, [lat, lon]);

    const poiCounts = pois.reduce((acc, poi) => {
        acc[poi.type] = (acc[poi.type] || 0) + 1;
        return acc;
    }, {});
    // The second parameter in reduce function sets the initial value of accumulator.
    // If the initial value is not provided, the first element of the array is used as the initial value.

    return (
        <div>
            <div className="map-container">
                <MapContainer center={[lat, lon]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Property Marker */}
                    <Marker position={[lat, lon]}>
                        <Popup>
                            <strong>{address?.locality || 'Property Location'}</strong>
                        </Popup>
                    </Marker>

                    {/* 2km Radius Circle */}
                    <Circle center={[lat, lon]} pathOptions={{ fillColor: '#4f46e5', color: '#4f46e5', fillOpacity: 0.1 }} radius={2000} />

                    {/* POI Markers */}
                    {pois.map(poi => (
                        <Marker
                            key={poi.id}
                            position={[poi.lat, poi.lon]}
                            icon={getPoiIcon(poi.type)}
                        >
                            <Popup>{poi.name}</Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            <div className="map-poi-panel">
                <h4 style={{ marginBottom: '12px' }}>Nearby Amenities (2km)</h4>
                {loadingPois ? (
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Loading POIs from OpenStreetMap...</p>
                ) : Object.keys(poiCounts).length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>No specific amenities found nearby.</p>
                ) : (
                    <div className="poi-chips">
                        {poiCounts.school > 0 && <span className="poi-chip">🏫 {poiCounts.school} Schools</span>}
                        {poiCounts.hospital > 0 && <span className="poi-chip">🏥 {poiCounts.hospital} Hospitals</span>}
                        {poiCounts.station > 0 && <span className="poi-chip">🚉 {poiCounts.station} Stations</span>}
                        {poiCounts.supermarket > 0 && <span className="poi-chip">🛒 {poiCounts.supermarket} Supermarkets</span>}
                    </div>
                )}
            </div>
        </div>
    );
}
