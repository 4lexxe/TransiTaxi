import { LocateFixed, MapPin } from "lucide-react";
import Console from "../utils/console";

function LocationSuggestions({
  suggestions = [],
  setSuggestions,
  setPickupLocation,
  setDestinationLocation,
  input,
  showCurrentLocationOption = false,
  onUseCurrentLocation,
  onSelectLocation,
  isSelectingMap = false,
  onSelectMapMode,
}) {
  const getSuggestionLabel = (suggestion) => {
    if (typeof suggestion === "string") {
      return suggestion;
    }

    return suggestion?.label || suggestion?.description || "";
  };

  return (
    <div>
      {/* Opciones para PICKUP */}
      {input === "pickup" && (
        <>
          {showCurrentLocationOption && (
            <div
              onClick={() => {
                if (onUseCurrentLocation) {
                  onUseCurrentLocation();
                }
              }}
              className="cursor-pointer flex items-center gap-2 border-b-2 py-3 border-gray-200 hover:bg-gray-50"
            >
              <div className="bg-blue-100 p-2 rounded-full text-blue-700">
                <LocateFixed size={20} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Usar mi ubicación actual</h2>
              </div>
            </div>
          )}
        </>
      )}

      {/* Opciones para DESTINATION */}
      {input === "destination" && (
        <>
          <div
            onClick={() => {
              if (onSelectMapMode) {
                onSelectMapMode();
              }
            }}
            className={`cursor-pointer flex items-center gap-2 border-b-2 py-3 border-gray-200 ${
              isSelectingMap ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <div
              className={`${
                isSelectingMap ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-700"
              } p-2 rounded-full`}
            >
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">
                {isSelectingMap ? "Seleccionando en mapa..." : "Seleccionar en mapa"}
              </h2>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="border-b-2 border-gray-200 py-2">
              <h2 className="text-xs font-semibold text-gray-500 px-4 py-2">Resultados de búsqueda</h2>
            </div>
          )}
        </>
      )}

      {/* SUGERENCIAS */}
      {suggestions.map((suggestion, index) => (
        <div
          onClick={() => {
            Console.log(suggestion);
            const suggestionLabel = getSuggestionLabel(suggestion);

            if (input == "pickup") {
              setPickupLocation(suggestionLabel);
              setSuggestions([]);
            }
            if (input == "destination") {
              setDestinationLocation(suggestionLabel);
              setSuggestions([]);
            }

            if (onSelectLocation) {
              onSelectLocation(suggestion);
            }
          }}
          key={index}
          className="cursor-pointer flex items-center gap-2 border-b-2 last:border-b-0 py-3 border-gray-200 hover:bg-gray-50"
        >
          <div className="bg-gray-100 p-2 rounded-full">
            <MapPin size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{getSuggestionLabel(suggestion)}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LocationSuggestions;
