import HereMap from './HereMap'; // Now uses Leaflet + OpenStreetMap internally

const RouteDisplay = ({ sourceCoords, destinationCoords, sourceAddress, destinationAddress }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-surface-600">{sourceAddress || 'Source'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-surface-600">{destinationAddress || 'Destination'}</span>
        </div>
      </div>
      <HereMap sourceCoords={sourceCoords} destinationCoords={destinationCoords} />
    </div>
  );
};

export default RouteDisplay;
