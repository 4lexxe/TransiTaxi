/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const createPinIcon = (fillColor = "#2563eb") =>
  L.icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
        <path fill="${fillColor}" stroke="#ffffff" stroke-width="2" d="M15 1c-7.2 0-13 5.8-13 13 0 9.8 13 27 13 27s13-17.2 13-27C28 6.8 22.2 1 15 1z"/>
        <circle cx="15" cy="14" r="5" fill="#ffffff"/>
      </svg>
    `)}`,
    iconSize: [30, 42],
    iconAnchor: [15, 41],
    tooltipAnchor: [0, -36],
  });

const vehicleIcon = L.icon({
  iconUrl: "/auto_ICON.webp",
  iconSize: [56, 32],
  iconAnchor: [28, 16],
  tooltipAnchor: [0, -16],
});

const currentLocationIcon = createPinIcon("#2563eb");
const pickupIcon = createPinIcon("#16a34a");
const destinationIcon = createPinIcon("#dc2626");

const FitMapToPoints = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) {
      return;
    }

    // Filtrar puntos inválidos (con NaN o Infinity)
    const validPoints = points.filter(
      (point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1])
    );

    if (validPoints.length === 0) {
      return;
    }

    if (validPoints.length === 1) {
      map.setView(validPoints[0], 14);
      return;
    }

    try {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [40, 40] });
    } catch (error) {
      console.error("Error fitting bounds to map:", error);
    }
  }, [map, points]);

  return null;
};

const MapClickSelector = ({ enabled, onSelectPoint }) => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = enabled ? "crosshair" : "";

    if (enabled) {
      map.dragging.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    } else {
      map.dragging.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }

    return () => {
      container.style.cursor = "";
      map.dragging.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    };
  }, [map, enabled]);

  useMapEvents({
    click(event) {
      if (!enabled || !onSelectPoint) {
        return;
      }

      onSelectPoint({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
};

const isValidPoint = (point) =>
  point && Number.isFinite(point.lat) && Number.isFinite(point.lng);

const isValidLatLng = (coords) =>
  Array.isArray(coords) && coords.length === 2 && Number.isFinite(coords[0]) && Number.isFinite(coords[1]);

const LiveMap = ({
  currentLocation,
  pickupPoint,
  destinationPoint,
  routeStart,
  routeEnd,
  onSelectPoint,
  isSelectingPoint = false,
  className = "absolute map w-full h-[120vh] z-0",
  isRideCreated = false,
  isRideAccepted = false,
  onRideCompleted,
}) => {
  const [routePoints, setRoutePoints] = useState([]);
  const [animatedVehiclePos, setAnimatedVehiclePos] = useState(null);
  const [simVehicleStart, setSimVehicleStart] = useState(null);
  const [conductorSimStart, setConductorSimStart] = useState(null);

  // Crear ubicación simulada del auto (offset cercano) cuando usuario busca
  useEffect(() => {
    if (!isRideCreated || simVehicleStart) {
      return;
    }

    // Al confirmar viaje, iniciar el auto desde pickup y avanzar hacia destino
    if (!isValidPoint(pickupPoint)) {
      return;
    }

    setSimVehicleStart({ lat: pickupPoint.lat, lng: pickupPoint.lng });
    setAnimatedVehiclePos([pickupPoint.lat, pickupPoint.lng]);
  }, [isRideCreated, pickupPoint, simVehicleStart]);

  // Crear ubicación simulada del conductor (lejos) cuando acepta viaje
  useEffect(() => {
    if (!isRideAccepted || conductorSimStart) {
      return;
    }

    // Validar que routeStart sea un punto válido
    if (!isValidPoint(routeStart)) {
      return;
    }

    // Simular que el conductor está lejos (~1.2 km = 0.012 grados)
    const offsetLat = routeStart.lat - 0.012;
    const offsetLng = routeStart.lng - 0.012;
    setConductorSimStart({ lat: offsetLat, lng: offsetLng });
    setAnimatedVehiclePos([offsetLat, offsetLng]);
  }, [isRideAccepted, routeStart, conductorSimStart]);

  useEffect(() => {
    if (!isRideCreated && !isRideAccepted) {
      setSimVehicleStart(null);
      setConductorSimStart(null);
      setAnimatedVehiclePos(null);
    }
  }, [isRideCreated, isRideAccepted]);

  // Animar el vehículo
  useEffect(() => {
    // No animar si no hay viaje en curso
    if (!isRideCreated && !isRideAccepted) {
      setAnimatedVehiclePos(null);
      return;
    }

    // Si no hay puntos de ruta, no hay nada que animar
    if (routePoints.length === 0) {
      return;
    }

    let currentIndex = 0;
    const animationInterval = setInterval(() => {
      if (currentIndex < routePoints.length) {
        const point = routePoints[currentIndex];
        if (isValidLatLng(point)) {
          setAnimatedVehiclePos(point);
        }
        currentIndex += 1;
      } else {
        // Animación completada, ir al punto final
        clearInterval(animationInterval);
        if (isRideAccepted && isValidPoint(routeEnd)) {
          setAnimatedVehiclePos([routeEnd.lat, routeEnd.lng]);
        } else if (isRideCreated && isValidPoint(destinationPoint)) {
          setAnimatedVehiclePos([destinationPoint.lat, destinationPoint.lng]);
          if (typeof onRideCompleted === "function") {
            onRideCompleted();
          }
        }
      }
    }, 450);

    return () => clearInterval(animationInterval);
  }, [isRideCreated, isRideAccepted, routePoints, routeEnd, pickupPoint, destinationPoint, onRideCompleted]);

  useEffect(() => {
    if ((isRideCreated || isRideAccepted) && isValidLatLng(animatedVehiclePos)) {
      console.log("[LiveMap] Posicion del auto:", {
        lat: animatedVehiclePos[0],
        lng: animatedVehiclePos[1],
      });
    }
  }, [animatedVehiclePos, isRideCreated, isRideAccepted]);

  useEffect(() => {
    let start = null;
    let end = null;

    const pickFirstValidPair = (pairs) => {
      for (const pair of pairs) {
        if (isValidPoint(pair.start) && isValidPoint(pair.end)) {
          return pair;
        }
      }
      return { start: null, end: null };
    };

    // Determinar inicio y fin según estado con fallbacks robustos
    if (isRideCreated && !isRideAccepted) {
      ({ start, end } = pickFirstValidPair([
        // Viaje confirmado (antes de aceptacion de conductor): pickup -> destination
        { start: pickupPoint, end: destinationPoint },
        { start: simVehicleStart, end: destinationPoint },
        { start: routeStart, end: routeEnd },
        // Fallback para no perder la ruta visual
        { start: currentLocation, end: destinationPoint },
      ]));
    } else if (isRideAccepted) {
      ({ start, end } = pickFirstValidPair([
        // Viaje aceptado: conductor (simulado) hacia pickup
        { start: conductorSimStart, end: pickupPoint },
        { start: routeStart, end: pickupPoint },
        { start: routeStart, end: routeEnd },
        { start: currentLocation, end: pickupPoint },
        { start: currentLocation, end: routeEnd },
        // Fallback para mantener referencia de trayecto
        { start: pickupPoint, end: destinationPoint },
      ]));
    } else {
      ({ start, end } = pickFirstValidPair([
        // Búsqueda normal: pickup hacia destination
        { start: pickupPoint, end: destinationPoint },
        { start: routeStart, end: routeEnd },
        // Fallback visual mientras termina de resolver destino
        { start: currentLocation, end: pickupPoint },
      ]));
    }

    if (!isValidPoint(start) || !isValidPoint(end)) {
      console.log("[LiveMap] Ruta no dibujada: puntos invalidos", {
        isRideCreated,
        isRideAccepted,
        start,
        end,
        pickupPoint,
        destinationPoint,
        routeStart,
        routeEnd,
      });

      // Si el viaje ya termino/cancelo y no hay puntos activos, limpiar ruta por completo.
      const shouldFullyResetRoute =
        !isRideCreated &&
        !isRideAccepted &&
        !isValidPoint(pickupPoint) &&
        !isValidPoint(destinationPoint) &&
        !isValidPoint(routeStart) &&
        !isValidPoint(routeEnd);

      if (shouldFullyResetRoute) {
        setRoutePoints([]);
        return;
      }

      // Evitar parpadeo: conservar la ruta previa si ya existe
      if (routePoints.length === 0) {
        setRoutePoints([]);
      }
      return;
    }

    console.log("[LiveMap] Calculando ruta", {
      isRideCreated,
      isRideAccepted,
      start,
      end,
    });

    const controller = new AbortController();

    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
          { signal: controller.signal }
        );

        const data = await response.json();
        const coordinates = data?.routes?.[0]?.geometry?.coordinates || [];

        const mappedRoutePoints = coordinates.map((coord) => [coord[1], coord[0]]);
        console.log("[LiveMap] Ruta recibida", { points: mappedRoutePoints.length });
        setRoutePoints(mappedRoutePoints);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("[LiveMap] Error al obtener ruta", error);
          setRoutePoints([]);
        }
      }
    };

    fetchRoute();

    return () => controller.abort();
  }, [isRideCreated, isRideAccepted, routeStart, routeEnd, pickupPoint, destinationPoint, currentLocation, simVehicleStart, conductorSimStart, routePoints.length]);

  const allPoints = useMemo(() => {
    const points = [];

    if (isValidPoint(currentLocation)) {
      points.push([currentLocation.lat, currentLocation.lng]);
    }

    if (isValidPoint(pickupPoint)) {
      points.push([pickupPoint.lat, pickupPoint.lng]);
    }

    if (isValidPoint(destinationPoint)) {
      points.push([destinationPoint.lat, destinationPoint.lng]);
    }

    if (routePoints.length > 0) {
      // Filtrar routePoints para asegurar que solo contengan números válidos
      const validRoutePoints = routePoints.filter(
        (point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1])
      );
      points.push(...validRoutePoints);
    }

    return points;
  }, [currentLocation, pickupPoint, destinationPoint, routePoints]);

  const nearestRouteIndex = useMemo(() => {
    if (!(isRideCreated || isRideAccepted) || !isValidLatLng(animatedVehiclePos) || routePoints.length === 0) {
      return -1;
    }

    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < routePoints.length; i += 1) {
      const point = routePoints[i];
      if (!isValidLatLng(point)) {
        continue;
      }

      const latDiff = point[0] - animatedVehiclePos[0];
      const lngDiff = point[1] - animatedVehiclePos[1];
      const distance = latDiff * latDiff + lngDiff * lngDiff;

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  }, [isRideCreated, isRideAccepted, animatedVehiclePos, routePoints]);

  const completedRoutePoints = useMemo(() => {
    if (nearestRouteIndex < 1) {
      return [];
    }

    return routePoints
      .slice(0, nearestRouteIndex + 1)
      .filter((point) => isValidLatLng(point));
  }, [routePoints, nearestRouteIndex]);

  const remainingRoutePoints = useMemo(() => {
    if (routePoints.length === 0) {
      return [];
    }

    // Sin animacion activa: mostrar ruta completa
    if (nearestRouteIndex < 0) {
      return routePoints.filter((point) => isValidLatLng(point));
    }

    return routePoints
      .slice(nearestRouteIndex)
      .filter((point) => isValidLatLng(point));
  }, [routePoints, nearestRouteIndex]);

  // Fallback center si no tenemos currentLocation válido
  const defaultCenter = (() => {
    if (isValidPoint(currentLocation)) {
      return [Number(currentLocation.lat), Number(currentLocation.lng)];
    }
    // Fallback: Centro de Argentina
    return [-23.6345, -58.4438];
  })();

  return (
    <MapContainer center={defaultCenter} zoom={13} className={className}>
      <MapClickSelector
        enabled={isSelectingPoint}
        onSelectPoint={onSelectPoint}
      />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {isValidPoint(currentLocation) && (
        <>
          <Circle
            center={[currentLocation.lat, currentLocation.lng]}
            radius={25}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#60a5fa",
              fillOpacity: 0.35,
              weight: 2,
            }}
          />
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={currentLocationIcon}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              Your location
            </Tooltip>
          </Marker>
        </>
      )}

      {isValidPoint(pickupPoint) && (
        <Marker position={[pickupPoint.lat, pickupPoint.lng]} icon={pickupIcon}>
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
            Pickup
          </Tooltip>
        </Marker>
      )}

      {(isRideCreated || isRideAccepted) && isValidLatLng(animatedVehiclePos) && (
        <Marker 
          position={animatedVehiclePos} 
          icon={vehicleIcon}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
            {`${isRideAccepted ? "Conductor en camino" : "Buscando conductor..."} (${animatedVehiclePos[0].toFixed(5)}, ${animatedVehiclePos[1].toFixed(5)})`}
          </Tooltip>
        </Marker>
      )}

      {isValidPoint(destinationPoint) && (
        <Marker
          position={[destinationPoint.lat, destinationPoint.lng]}
          icon={destinationIcon}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
            Destination
          </Tooltip>
        </Marker>
      )}

      {remainingRoutePoints.length > 1 && (
        <>
          <Polyline
            positions={remainingRoutePoints}
            pathOptions={{
              color: "#0f172a",
              weight: 8,
              opacity: 0.35,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
          <Polyline
            positions={remainingRoutePoints}
            pathOptions={{
              color: isRideAccepted ? "#0ea5e9" : "#f97316",
              weight: 5,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </>
      )}

      {completedRoutePoints.length > 1 && (
        <Polyline
          positions={completedRoutePoints}
          pathOptions={{
            color: "#94a3b8",
            weight: 4,
            opacity: 0.55,
            dashArray: "10 8",
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      )}
      <FitMapToPoints points={allPoints} />
    </MapContainer>
  );
};

export default LiveMap;
