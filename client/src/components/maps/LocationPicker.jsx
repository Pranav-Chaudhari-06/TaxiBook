import { useState, useCallback, useRef } from 'react';
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';

const LocationPicker = ({ label, value, onChange, onCoordsChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [resolved, setResolved] = useState(false);
  // Track whether coords are valid for the current input value
  const coordsValidRef = useRef(false);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSuggestions(data || []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (e) => {
    // Coords are no longer valid when text changes
    coordsValidRef.current = false;
    setResolved(false);
    onChange(e.target.value);
    fetchSuggestions(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelect = (item) => {
    onChange(item.display_name);
    if (onCoordsChange) {
      onCoordsChange({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
    }
    coordsValidRef.current = true;
    setResolved(true);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Geocode on blur if coords weren't set via dropdown
  const handleBlur = async () => {
    setTimeout(() => setShowSuggestions(false), 200);

    if (!value || value.length < 3) return;
    if (coordsValidRef.current) return; // already resolved via dropdown

    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data[0]) {
        if (onCoordsChange) {
          onCoordsChange({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
        coordsValidRef.current = true;
        setResolved(true);
      } else {
        // Nothing found — clear coords
        if (onCoordsChange) onCoordsChange(null);
        coordsValidRef.current = false;
        setResolved(false);
      }
    } catch {
      if (onCoordsChange) onCoordsChange(null);
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div className="relative">
      <label className="label">{label}</label>
      <div className="relative">
        <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${resolved ? 'text-emerald-500' : 'text-surface-400'}`} />
        {geocoding && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin" />
        )}
        {resolved && !geocoding && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
        )}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={handleBlur}
          className={`input-field pl-9 pr-9 ${resolved ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/20' : ''}`}
          placeholder="Type or paste address…"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-surface-200 rounded-xl mt-1.5 shadow-md max-h-48 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              className="px-4 py-2.5 hover:bg-primary-50 cursor-pointer text-sm text-surface-600 transition-colors"
              onMouseDown={() => handleSelect(item)}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
      {!geocoding && !resolved && value.length >= 3 && (
        <p className="text-xs text-surface-400 mt-1">Click away to auto-locate, or select from suggestions</p>
      )}
    </div>
  );
};

export default LocationPicker;
