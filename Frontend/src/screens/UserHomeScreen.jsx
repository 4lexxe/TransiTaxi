import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/UserContext";
import {
  Alert,
  Button,
  LiveMap,
  LocationSuggestions,
  SelectVehicle,
  RideDetails,
  Sidebar,
} from "../components";
import axios from "axios";
import debounce from "lodash.debounce";
import { SocketDataContext } from "../contexts/SocketContext";
import Console from "../utils/console";
import { useAlert } from "../hooks/useAlert";
import { BASE_URL } from "../config";

const map = "/map.png";

function UserHomeScreen() {
  const token = localStorage.getItem("token"); // this token is in use
  const { socket } = useContext(SocketDataContext);
  const { user } = useUser();
  const { alert, showAlert, hideAlert } = useAlert();
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [loading, setLoading] = useState(false);
  const [selectedInput, setSelectedInput] = useState("pickup");
  const [locationSuggestion, setLocationSuggestion] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupPoint, setPickupPoint] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState(null);
  const [routeStartPoint, setRouteStartPoint] = useState(null);
  const [routeEndPoint, setRouteEndPoint] = useState(null);
  const [rideCreated, setRideCreated] = useState(false);
  const [isSelectingDestinationOnMap, setIsSelectingDestinationOnMap] =
    useState(false);
  const [currentProvince, setCurrentProvince] = useState("");
  const [currentCountryCode, setCurrentCountryCode] = useState("");
  const [recentLocations, setRecentLocations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentLocations") || "[]");
    } catch {
      return [];
    }
  });

  // Ride details
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [fare, setFare] = useState({
    auto: 0,
    car: 0,
    bike: 0,
  });
  const [confirmedRideData, setConfirmedRideData] = useState(null);
  const rideTimeout = useRef(null);
  const rideCompletionTriggered = useRef(false);

  // Panels
  const [showFindTripPanel, setShowFindTripPanel] = useState(true);
  const [showSelectVehiclePanel, setShowSelectVehiclePanel] = useState(false);
  const [showRideDetailsPanel, setShowRideDetailsPanel] = useState(false);
  const getSuggestionLabel = useCallback((suggestion) => {
    if (typeof suggestion === "string") {
      return suggestion;
    }

    if (suggestion && typeof suggestion === "object") {
      return suggestion.label || suggestion.description || suggestion.name || "";
    }

    return "";
  }, []);
  const isRideAccepted = Boolean(
    confirmedRideData?.captain?.location?.coordinates?.length === 2
  );

  const addRecentLocation = useCallback((value) => {
    if (!value || typeof value !== "string") {
      return;
    }

    const normalizedValue = value.trim();
    if (!normalizedValue) {
      return;
    }

    setRecentLocations((prev) => {
      const next = [normalizedValue, ...prev.filter((item) => item !== normalizedValue)].slice(0, 8);
      localStorage.setItem("recentLocations", JSON.stringify(next));
      return next;
    });
  }, []);

  const requestBackendSuggestions = useCallback(
    async (inputValue) => {
      const response = await axios.get(
        `${BASE_URL}/map/get-suggestions`,
        {
          headers: {
            token,
          },
          params: {
            input: inputValue,
            ...(currentLocation
              ? {
                  lat: currentLocation.lat,
                  lng: currentLocation.lng,
                }
              : {}),
            ...(currentProvince ? { province: currentProvince } : {}),
            ...(currentCountryCode
              ? { countryCode: currentCountryCode }
              : {}),
          },
        }
      );

      return Array.isArray(response.data) ? response.data : [];
    },
    [token, currentLocation, currentProvince, currentCountryCode]
  );

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API;

    if (!apiKey) {
      return;
    }

    if (window.google?.maps?.places) {
      return;
    }

    const existingScript = document.getElementById("maps-script");
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = "maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Sincronizar estado inicial con localStorage
  useEffect(() => {
    const rideDetails = JSON.parse(localStorage.getItem("rideDetails"));
    if (rideDetails && rideDetails._id) {
      // Si hay un viaje guardado en localStorage, restaurar el estado
      setRideCreated(true);
      setPickupLocation(rideDetails.pickup || "");
      setDestinationLocation(rideDetails.destination || "");
      setSelectedVehicle(rideDetails.vehicleType || "car");
      setFare(rideDetails.fare || { auto: 0, car: 0, bike: 0 });

      // Restaurar los puntos si están disponibles
      if (rideDetails.pickupCoords) {
        setPickupPoint(rideDetails.pickupCoords);
      }
      if (rideDetails.destinationCoords) {
        setDestinationPoint(rideDetails.destinationCoords);
      }

      // Mostrar el panel de detalles del viaje
      setShowFindTripPanel(false);
      setShowSelectVehiclePanel(false);
      setShowRideDetailsPanel(true);
    }
  }, []);

  const ensureGoogleMapsReady = useCallback(async () => {
    if (window.google?.maps?.places && window.google?.maps?.Geocoder) {
      return true;
    }

    await new Promise((resolve) => {
      const timeoutMs = 5000;
      const start = Date.now();

      const timer = setInterval(() => {
        if (window.google?.maps?.places && window.google?.maps?.Geocoder) {
          clearInterval(timer);
          resolve(true);
          return;
        }

        if (Date.now() - start >= timeoutMs) {
          clearInterval(timer);
          resolve(false);
        }
      }, 150);
    });

    return Boolean(window.google?.maps?.places && window.google?.maps?.Geocoder);
  }, []);

  const getGoogleSuggestions = useCallback(
    async (inputValue) => {
      return [];
    },
    []
  );

  const getGoogleCoordinatesByAddress = useCallback(
    async (address) => {
      throw new Error("Google geocoder not configured");
    },
    []
  );

  const getGoogleCoordinatesByPlaceId = useCallback(
    async (placeId) => {
      throw new Error("Google places not configured");
    },
    []
  );

  const getCoordinatesFromBackend = useCallback(async (address) => {
    const response = await axios.get(
      `${BASE_URL}/map/get-coordinates?address=${encodeURIComponent(
        address
      )}`
    );

    const lat = Number(response?.data?.lat ?? response?.data?.ltd);
    const lng = Number(response?.data?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error(`Coordenadas invalidas para: ${address}`);
    }

    return {
      lat,
      lng,
      address,
    };
  }, []);

  const handleLocationChange = useCallback(
    debounce(async (inputValue) => {
      if (inputValue.length >= 2) {
        try {
          const apiSuggestions = await requestBackendSuggestions(inputValue);
          setLocationSuggestion(
            apiSuggestions
              .filter(Boolean)
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .slice(0, 8)
          );
        } catch (error) {
          setLocationSuggestion([]);
          Console.error(error);
        }
      }
    }, 700),
    [requestBackendSuggestions]
  );

  const onChangeHandler = (e) => {
    setSelectedInput(e.target.id);
    const value = e.target.value;
    if (e.target.id == "pickup") {
      setPickupLocation(value);
    } else if (e.target.id == "destination") {
      setDestinationLocation(value);
    }

    handleLocationChange(value);

    if (e.target.value.length < 2) {
      setLocationSuggestion([]);
    }
  };

  const handleLocationSelection = useCallback(
    async (suggestion) => {
      if (!suggestion) {
        return;
      }

      try {
        const suggestionLabel = getSuggestionLabel(suggestion);

        if (!suggestionLabel || suggestionLabel.trim().length < 2) {
          return;
        }

        const resolvedPoint = await getCoordinatesFromBackend(suggestionLabel);
        const newCoordinates = { lat: resolvedPoint.lat, lng: resolvedPoint.lng };

        if (selectedInput === "pickup") {
          setPickupLocation(resolvedPoint.address || suggestionLabel || "");
          setPickupPoint(newCoordinates);
          setRouteStartPoint(newCoordinates); // SIEMPRE actualizar routeStart
        } else if (selectedInput === "destination") {
          setDestinationLocation(resolvedPoint.address || suggestionLabel || "");
          setDestinationPoint(newCoordinates);
          setRouteEndPoint(newCoordinates); // SIEMPRE actualizar routeEnd
        }

        addRecentLocation(resolvedPoint.address || suggestionLabel || "");
        setLocationSuggestion([]);
      } catch (error) {
        Console.error(error);
      }
    },
    [
      addRecentLocation,
      getCoordinatesFromBackend,
      getSuggestionLabel,
      selectedInput,
    ]
  );

  const useCurrentLocation = () => {
    if (!currentLocation || selectedInput !== "pickup") {
      return;
    }

    const locationValue = `${currentLocation.lat.toFixed(6)},${currentLocation.lng.toFixed(6)}`;

    setPickupLocation(locationValue);
    setPickupPoint(currentLocation);
    setRouteStartPoint(currentLocation); // SIEMPRE actualizar routeStart
    addRecentLocation(locationValue);

    // Si existe destino, actualizar routeEnd también
    if (destinationPoint) {
      setRouteEndPoint(destinationPoint);
    }

    setLocationSuggestion([]);
  };

  const setDestinationFromMapPoint = ({ lat, lng }) => {
    const fallbackDestinationValue = `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
    const point = { lat: Number(lat), lng: Number(lng) };

    setDestinationLocation(fallbackDestinationValue);
    setDestinationPoint(point);
    setRouteEndPoint(point); // SIEMPRE actualizar routeEnd
    setSelectedInput("destination");
    setLocationSuggestion([]);
    setIsSelectingDestinationOnMap(false);

    // Si existe pickup, actualizar routeStart también
    if (pickupPoint) {
      setRouteStartPoint(pickupPoint);
    }

    axios
      .get(
        `${BASE_URL}/map/reverse-geocode?lat=${point.lat}&lng=${point.lng}`,
        {
          headers: {
            token,
          },
        }
      )
      .then((response) => {
        const resolvedAddress = response?.data?.address;
        if (resolvedAddress) {
          setDestinationLocation(resolvedAddress);
          addRecentLocation(resolvedAddress);
        } else {
          addRecentLocation(fallbackDestinationValue);
        }
      })
      .catch(() => {
        addRecentLocation(fallbackDestinationValue);
      });
  };

  const getCoordinates = async (address) => {
    const resolvedPoint = await getCoordinatesFromBackend(address);

    if (!Number.isFinite(resolvedPoint.lat) || !Number.isFinite(resolvedPoint.lng)) {
      throw new Error(`Coordenadas invalidas resueltas para: ${address}`);
    }

    return {
      lat: Number(resolvedPoint.lat),
      lng: Number(resolvedPoint.lng),
    };
  };

  const getDistanceAndFare = async (pickupLocation, destinationLocation) => {
    Console.log(pickupLocation, destinationLocation);
    try {
      // Si ya existen puntos seleccionados, usarlos inmediatamente para no perder la ruta
      if (pickupPoint && Number.isFinite(pickupPoint.lat) && Number.isFinite(pickupPoint.lng)) {
        setRouteStartPoint(pickupPoint);
      }
      if (destinationPoint && Number.isFinite(destinationPoint.lat) && Number.isFinite(destinationPoint.lng)) {
        setRouteEndPoint(destinationPoint);
      }

      // Al iniciar una nueva búsqueda, limpiar cualquier estado de viaje anterior
      if (rideTimeout.current) {
        clearTimeout(rideTimeout.current);
      }
      setRideCreated(false);
      setConfirmedRideData(null);
      localStorage.removeItem("rideDetails");

      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/ride/get-fare?pickup=${pickupLocation}&destination=${destinationLocation}`,
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log(response);
      setFare(response.data.fare);

      try {
        const [pickupCoords, destinationCoords] = await Promise.all([
          getCoordinates(pickupLocation),
          getCoordinates(destinationLocation),
        ]);

        if (
          !Number.isFinite(pickupCoords?.lat) ||
          !Number.isFinite(pickupCoords?.lng) ||
          !Number.isFinite(destinationCoords?.lat) ||
          !Number.isFinite(destinationCoords?.lng)
        ) {
          throw new Error("Coordenadas invalidas al calcular ruta de busqueda");
        }

        setPickupPoint(pickupCoords);
        setDestinationPoint(destinationCoords);
        setRouteStartPoint(pickupCoords);
        setRouteEndPoint(destinationCoords);
      } catch (mapError) {
        Console.error(mapError);

        // Fallback: mantener ruta con los puntos que ya tuviera el usuario
        if (pickupPoint && Number.isFinite(pickupPoint.lat) && Number.isFinite(pickupPoint.lng)) {
          setRouteStartPoint(pickupPoint);
        }
        if (destinationPoint && Number.isFinite(destinationPoint.lat) && Number.isFinite(destinationPoint.lng)) {
          setRouteEndPoint(destinationPoint);
        }
      }

      setShowFindTripPanel(false);
      setShowSelectVehiclePanel(true);
      setLocationSuggestion([]);
      setLoading(false);
    } catch (error) {
      Console.log(error);
      setLoading(false);
    }
  };

  const createRide = async () => {
    try {
      setLoading(true);
      
      // Ensure coordinates are available
      if (!pickupPoint || !destinationPoint) {
        Console.error("Coordenadas no disponibles");
        setLoading(false);
        return;
      }
      
      const response = await axios.post(
        `${BASE_URL}/ride/create`,
        {
          pickup: pickupLocation,
          destination: destinationLocation,
          vehicleType: selectedVehicle,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log("Ride created:", response.data);
      
      // Validar que tenemos el _id del viaje
      if (!response.data || !response.data._id) {
        Console.error("No ride ID returned from server");
        setLoading(false);
        return;
      }
      
      const rideData = {
        pickup: pickupLocation,
        destination: destinationLocation,
        pickupCoords: pickupPoint,
        destinationCoords: destinationPoint,
        vehicleType: selectedVehicle,
        fare: fare,
        _id: response.data._id,
      };
      localStorage.setItem("rideDetails", JSON.stringify(rideData));
      setLoading(false);
      setRideCreated(true);
      // Solo se marca como aceptado cuando llega el evento socket "ride-confirmed"
      setConfirmedRideData(null);
      rideCompletionTriggered.current = false;

      // Automatically cancel the ride after 1.5 minutes
      rideTimeout.current = setTimeout(() => {
        cancelRide();
      }, import.meta.env.VITE_RIDE_TIMEOUT);
      
    } catch (error) {
      Console.error("Error creating ride:", error);
      setLoading(false);
    }
  };

  const completeRideOnArrival = useCallback(async () => {
    if (rideCompletionTriggered.current) {
      return;
    }

    const rideDetails = JSON.parse(localStorage.getItem("rideDetails") || "null");
    if (!rideDetails?._id) {
      return;
    }

    rideCompletionTriggered.current = true;

    try {
      await axios.post(
        `${BASE_URL}/ride/end-ride-user`,
        { rideId: rideDetails._id },
        {
          headers: {
            token,
          },
        }
      );

      if (rideTimeout.current) {
        clearTimeout(rideTimeout.current);
      }

      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(true);
      setDefaults();
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      localStorage.removeItem("messages");

      showAlert(
        "Viaje finalizado",
        "Llegaste a destino. Te enviamos la confirmacion por correo.",
        "success"
      );
    } catch (error) {
      rideCompletionTriggered.current = false;
      Console.error("Error ending ride on arrival:", error);
      showAlert(
        "No se pudo finalizar",
        "Hubo un problema al cerrar el viaje. Intenta nuevamente.",
        "failure"
      );
    }
  }, [showAlert, token]);

  const cancelRide = async () => {
    // Obtener datos del viaje de localStorage
    const rideDetails = JSON.parse(localStorage.getItem("rideDetails"));
    
    // Validar que hay un viaje para cancelar
    if (!rideDetails || !rideDetails._id) {
      Console.error("No ride found to cancel");
      // Limpiar estado si no hay viaje en localStorage
      setRideCreated(false);
      setShowRideDetailsPanel(false);
      setShowFindTripPanel(true);
      return;
    }
    
    try {
      setLoading(true);
      await axios.get(
        `${BASE_URL}/ride/cancel?rideId=${rideDetails._id}`,
        {
          headers: {
            token: token,
          },
        }
      );
      setLoading(false);
      updateLocation();
      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(true);
      setRideCreated(false);
      setConfirmedRideData(null);
      setDefaults();
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      localStorage.removeItem("messages");
      localStorage.removeItem("showPanel");
      localStorage.removeItem("showBtn");
    } catch (error) {
      Console.error("Error canceling ride:", error);
      setLoading(false);
    }
  };
  // Set ride details to default values
  const setDefaults = () => {
    setPickupLocation("");
    setDestinationLocation("");
    setSelectedVehicle("car");
    setPickupPoint(null);
    setDestinationPoint(null);
    setRouteStartPoint(null);
    setRouteEndPoint(null);
    setIsSelectingDestinationOnMap(false);
    setFare({
      auto: 0,
      car: 0,
      bike: 0,
    });
    setConfirmedRideData(null);
    setRideCreated(false);
  };

  // Update Location
  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching position:", error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              console.error("The request to get user location timed out.");
              break;
            default:
              console.error("An unknown error occurred.");
          }
        }
      );
    }
  };

  // Update Location
  useEffect(() => {
    updateLocation();
  }, []);

  useEffect(() => {
    if (!currentLocation || !token) {
      return;
    }

    axios
      .get(
        `${BASE_URL}/map/reverse-geocode?lat=${currentLocation.lat}&lng=${currentLocation.lng}`,
        {
          headers: {
            token,
          },
        }
      )
      .then((response) => {
        const province = response?.data?.province;
        const countryCode = response?.data?.countryCode;
        if (province) {
          setCurrentProvince(province);
        }

        if (countryCode) {
          setCurrentCountryCode(String(countryCode).toLowerCase());
        }
      })
      .catch(() => {
        setCurrentProvince("");
        setCurrentCountryCode("");
      });
  }, [currentLocation, token]);

  // Socket Events
  useEffect(() => {
    if (user._id) {
      socket.emit("join", {
        userId: user._id,
        userType: "user",
      });
    }

    socket.on("ride-confirmed", (data) => {
      Console.log("Clearing Timeout", rideTimeout);
      clearTimeout(rideTimeout.current);
      Console.log("Cleared Timeout");
      Console.log("Ride Confirmed");
      Console.log(data.captain.location);

      // Ubicación del conductor
      const captainPoint = {
        lat: data.captain.location.coordinates[1],
        lng: data.captain.location.coordinates[0],
      };

      // El conductor va hacia el pickup
      setRouteStartPoint(captainPoint);
      
      getCoordinates(data.pickup)
        .then((pickupCoords) => {
          setPickupPoint(pickupCoords);
          setRouteEndPoint(pickupCoords);
        })
        .catch((error) => {
          Console.error(error);
        });

      // IMPORTANTE: Mantener destinationPoint intacto para mostrar después
      // No limpiar destinationPoint aquí

      // Cambiar estado: ya no buscando, ahora esperando conductor
      setRideCreated(false);
      setConfirmedRideData(data);
    });

    socket.on("ride-started", (data) => {
      Console.log("Ride started");
      Promise.all([getCoordinates(data.pickup), getCoordinates(data.destination)])
        .then(([pickupCoords, destinationCoords]) => {
          setPickupPoint(pickupCoords);
          setDestinationPoint(destinationCoords);
          setRouteStartPoint(pickupCoords);
          setRouteEndPoint(destinationCoords);
        })
        .catch((error) => {
          Console.error(error);
        });
    });

    socket.on("ride-ended", (data) => {
      Console.log("Ride Ended");
      rideCompletionTriggered.current = false;
      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(true);
      setDefaults();
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      setRouteStartPoint(null);
      setRouteEndPoint(null);
      updateLocation();
    });
  }, [getCoordinates, socket, user]);

  // Get ride details
  useEffect(() => {
    const storedRideDetails = localStorage.getItem("rideDetails");
    const storedPanelDetails = localStorage.getItem("panelDetails");

    if (storedRideDetails) {
      const ride = JSON.parse(storedRideDetails);
      setPickupLocation(ride.pickup);
      setDestinationLocation(ride.destination);
      setSelectedVehicle(ride.vehicleType);
      setFare(ride.fare);
      setConfirmedRideData(ride.confirmedRideData);
    }

    if (storedPanelDetails) {
      const panels = JSON.parse(storedPanelDetails);
      setShowFindTripPanel(panels.showFindTripPanel);
      setShowSelectVehiclePanel(panels.showSelectVehiclePanel);
      setShowRideDetailsPanel(panels.showRideDetailsPanel);
    }
  }, []);

  // Store Ride Details
  useEffect(() => {
    const rideData = {
      pickup: pickupLocation,
      destination: destinationLocation,
      vehicleType: selectedVehicle,
      fare: fare,
      confirmedRideData: confirmedRideData,
    };
    localStorage.setItem("rideDetails", JSON.stringify(rideData));
  }, [
    pickupLocation,
    destinationLocation,
    selectedVehicle,
    fare,
    confirmedRideData,
  ]);

  // Store panel information
  useEffect(() => {
    const panelDetails = {
      showFindTripPanel,
      showSelectVehiclePanel,
      showRideDetailsPanel,
    };
    localStorage.setItem("panelDetails", JSON.stringify(panelDetails));
  }, [showFindTripPanel, showSelectVehiclePanel, showRideDetailsPanel]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    socket.emit("join-room", confirmedRideData?._id);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, { msg, by: "other" }]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [confirmedRideData]);

  return (
    <div
      className="relative w-full h-dvh bg-contain"
      style={{ backgroundImage: `url(${map})` }}
    >
      <Sidebar />
      <LiveMap
        className="absolute map w-full h-[120vh] z-0"
        currentLocation={currentLocation}
        pickupPoint={pickupPoint}
        destinationPoint={destinationPoint}
        routeStart={routeStartPoint}
        routeEnd={routeEndPoint}
        isSelectingPoint={isSelectingDestinationOnMap}
        onSelectPoint={setDestinationFromMapPoint}
        isRideCreated={rideCreated}
        isRideAccepted={isRideAccepted}
        onRideCompleted={completeRideOnArrival}
      />
      <Alert
        heading={alert.heading}
        text={alert.text}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        type={alert.type}
      />
      {/* Find a trip component */}
      {showFindTripPanel && (
        <div className="absolute b-0 flex flex-col justify-start p-4 pb-2 gap-4 rounded-b-lg bg-white h-fit w-full">
          <h1 className="text-2xl font-semibold">Buscar un viaje</h1>
          <div className="flex items-center relative w-full h-fit">
            <div className="h-3/5 w-[3px] flex flex-col items-center justify-between bg-black rounded-full absolute mx-5">
              <div className="w-2 h-2 rounded-full border-[3px]  bg-white border-black"></div>
              <div className="w-2 h-2 rounded-sm border-[3px]  bg-white border-black"></div>
            </div>
            <div>
              <input
                id="pickup"
                placeholder="Agregar ubicación de recogida"
                className="w-full bg-zinc-100 pl-10 pr-4 py-3 rounded-lg outline-black text-sm mb-2 truncate"
                value={pickupLocation}
                onChange={onChangeHandler}
                onFocus={() => setSelectedInput("pickup")}
                autoComplete="off"
              />
              <input
                id="destination"
                placeholder="Agregar destino"
                className="w-full bg-zinc-100 pl-10 pr-4 py-3 rounded-lg outline-black text-sm truncate"
                value={destinationLocation}
                onChange={onChangeHandler}
                onFocus={() => setSelectedInput("destination")}
                autoComplete="off"
              />

              <button
                type="button"
                onClick={() => {
                  setSelectedInput("destination");
                  setLocationSuggestion([]);
                  setIsSelectingDestinationOnMap((prev) => !prev);
                }}
                className={`text-xs mt-2 font-semibold ${
                  isSelectingDestinationOnMap
                    ? "text-blue-700"
                    : "text-zinc-700"
                }`}
              >
                {isSelectingDestinationOnMap
                  ? "Toca un punto en el mapa para establecer destino"
                  : "Selecciona destino en el mapa"}
              </button>
            </div>
          </div>
          {pickupLocation.length > 2 && destinationLocation.length > 2 && (
            <Button
              title={"Buscar"}
              loading={loading}
              fun={() => {
                getDistanceAndFare(pickupLocation, destinationLocation);
              }}
            />
          )}

          <div
            className="w-full max-h-64 overflow-y-auto overscroll-contain touch-pan-y"
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            {(locationSuggestion.length > 0 || Boolean(currentLocation)) && (
              <LocationSuggestions
                suggestions={locationSuggestion}
                setSuggestions={setLocationSuggestion}
                setPickupLocation={setPickupLocation}
                setDestinationLocation={setDestinationLocation}
                input={selectedInput}
                showCurrentLocationOption={selectedInput === "pickup" && Boolean(currentLocation)}
                onUseCurrentLocation={useCurrentLocation}
                onSelectLocation={handleLocationSelection}
                isSelectingMap={isSelectingDestinationOnMap}
                onSelectMapMode={() => {
                  setSelectedInput("destination");
                  setLocationSuggestion([]);
                  setIsSelectingDestinationOnMap((prev) => !prev);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Select Vehicle Panel */}
      <SelectVehicle
        selectedVehicle={setSelectedVehicle}
        showPanel={showSelectVehiclePanel}
        setShowPanel={setShowSelectVehiclePanel}
        showPreviousPanel={setShowFindTripPanel}
        showNextPanel={setShowRideDetailsPanel}
        fare={fare}
      />

      {/* Ride Details Panel */}
      <RideDetails
        pickupLocation={pickupLocation}
        destinationLocation={destinationLocation}
        selectedVehicle={selectedVehicle}
        fare={fare}
        showPanel={showRideDetailsPanel}
        setShowPanel={setShowRideDetailsPanel}
        showPreviousPanel={setShowSelectVehiclePanel}
        createRide={createRide}
        cancelRide={cancelRide}
        loading={loading}
        rideCreated={rideCreated}
        confirmedRideData={confirmedRideData}
      />
    </div>
  );
}

export default UserHomeScreen;
