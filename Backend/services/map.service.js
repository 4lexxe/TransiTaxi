const axios = require("axios");
const captainModel = require("../models/captain.model");

const isProduction = process.env.ENVIRONMENT === "production";
const allowPublicProvidersInProd =
  process.env.ALLOW_PUBLIC_MAP_PROVIDERS === "true";
const NOMINATIM_BASE_URL =
  process.env.NOMINATIM_BASE_URL ||
  (isProduction ? "" : "https://nominatim.openstreetmap.org");
const OSRM_BASE_URL =
  process.env.OSRM_BASE_URL ||
  (isProduction ? "" : "https://router.project-osrm.org");
const GOOGLE_MAPS_API = process.env.GOOGLE_MAPS_API || "";
const GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const GOOGLE_AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const ARCGIS_GEOCODE_URL =
  "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates";
const ARCGIS_REVERSE_GEOCODE_URL =
  "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode";
const MAP_CACHE_TTL_MS = Number(process.env.MAP_CACHE_TTL_MS || 5 * 60 * 1000);
const MAP_CACHE_MAX_ENTRIES = Number(process.env.MAP_CACHE_MAX_ENTRIES || 500);

if (!NOMINATIM_BASE_URL || !OSRM_BASE_URL) {
  throw new Error(
    "Map providers not configured. Set NOMINATIM_BASE_URL and OSRM_BASE_URL for production."
  );
}

if (
  isProduction &&
  !allowPublicProvidersInProd &&
  (NOMINATIM_BASE_URL.includes("openstreetmap.org") ||
    OSRM_BASE_URL.includes("project-osrm.org"))
) {
  throw new Error(
    "Public map providers are disabled in production. Configure private NOMINATIM_BASE_URL and OSRM_BASE_URL or set ALLOW_PUBLIC_MAP_PROVIDERS=true."
  );
}

const REQUEST_HEADERS = {
  "User-Agent": "quick-ride/1.0",
  Accept: "application/json",
};

const mapCache = new Map();

const getCacheKey = (prefix, input) => {
  return `${prefix}:${String(input).trim().toLowerCase()}`;
};

const getCachedValue = (key) => {
  const cacheEntry = mapCache.get(key);
  if (!cacheEntry) {
    return null;
  }

  if (Date.now() - cacheEntry.timestamp > MAP_CACHE_TTL_MS) {
    mapCache.delete(key);
    return null;
  }

  return cacheEntry.value;
};

const setCachedValue = (key, value) => {
  if (mapCache.size >= MAP_CACHE_MAX_ENTRIES) {
    const oldestKey = mapCache.keys().next().value;
    if (oldestKey) {
      mapCache.delete(oldestKey);
    }
  }

  mapCache.set(key, {
    value,
    timestamp: Date.now(),
  });
};

const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds) => {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours} h ${minutes} min`;
};

const buildLocationQueryCandidates = (input) => {
  const normalizedInput = String(input || "").trim();
  if (!normalizedInput) {
    return [];
  }

  const tokens = normalizedInput
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const candidates = [normalizedInput];

  if (tokens.length >= 2) {
    candidates.push(tokens.slice(-2).join(" "));
  }

  if (tokens.length >= 1) {
    candidates.push(tokens[tokens.length - 1]);
  }

  return candidates.filter((value, index, arr) => arr.indexOf(value) === index);
};

const parseCoordinateString = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const parts = value.split(",").map((part) => Number(part.trim()));
  if (parts.length !== 2 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return {
    lat: parts[0],
    lon: parts[1],
  };
};

const prioritizeByProvince = (suggestions, province) => {
  if (!province) {
    return suggestions;
  }

  const normalizedProvince = String(province).trim().toLowerCase();
  if (!normalizedProvince) {
    return suggestions;
  }

  const local = [];
  const others = [];

  suggestions.forEach((item) => {
    if (String(item).toLowerCase().includes(normalizedProvince)) {
      local.push(item);
      return;
    }

    others.push(item);
  });

  return [...local, ...others];
};

const resolveLocationWithGoogle = async (input) => {
  const response = await axios.get(GOOGLE_GEOCODE_URL, {
    params: {
      address: input,
      key: GOOGLE_MAPS_API,
      language: "es",
    },
    timeout: 10000,
  });

  const firstResult = response?.data?.results?.[0];
  if (!firstResult?.geometry?.location) {
    throw new Error("Unable to fetch coordinates");
  }

  return {
    lat: Number(firstResult.geometry.location.lat),
    lon: Number(firstResult.geometry.location.lng),
  };
};

const resolveLocationWithArcGIS = async (input) => {
  const response = await axios.get(ARCGIS_GEOCODE_URL, {
    params: {
      f: "json",
      singleLine: input,
      maxLocations: 1,
      outFields: "*",
    },
    timeout: 10000,
  });

  const firstCandidate = response?.data?.candidates?.[0];
  if (!firstCandidate?.location) {
    throw new Error("Unable to fetch coordinates");
  }

  return {
    lat: Number(firstCandidate.location.y),
    lon: Number(firstCandidate.location.x),
  };
};

const resolveLocation = async (input) => {
  const directCoordinate = parseCoordinateString(input);
  if (directCoordinate) {
    return directCoordinate;
  }

  const cacheKey = getCacheKey("geocode", input);
  const cachedValue = getCachedValue(cacheKey);
  if (cachedValue) {
    return cachedValue;
  }

  if (GOOGLE_MAPS_API) {
    try {
      const googleResolvedValue = await resolveLocationWithGoogle(input);
      setCachedValue(cacheKey, googleResolvedValue);
      return googleResolvedValue;
    } catch (_) {
      // Fallback to Nominatim
    }
  }

  const queryCandidates = buildLocationQueryCandidates(input);

  for (const queryText of queryCandidates) {
    try {
      const arcgisResolvedValue = await resolveLocationWithArcGIS(queryText);
      setCachedValue(cacheKey, arcgisResolvedValue);
      return arcgisResolvedValue;
    } catch (_) {
      // Continue with Nominatim fallback
    }

    try {
      const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
        headers: REQUEST_HEADERS,
        params: {
          q: queryText,
          format: "jsonv2",
          limit: 1,
        },
        timeout: 10000,
      });

      if (!Array.isArray(response.data) || response.data.length === 0) {
        continue;
      }

      const resolvedValue = {
        lat: Number(response.data[0].lat),
        lon: Number(response.data[0].lon),
      };

      setCachedValue(cacheKey, resolvedValue);
      return resolvedValue;
    } catch (_) {
      // Continue with other query candidates
    }
  }

  throw new Error("Unable to fetch coordinates");
};

module.exports.getAddressCoordinate = async (address) => {
  try {
    const location = await resolveLocation(address);
    return {
      lat: location.lat,
      ltd: location.lat,
      lng: location.lon,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports.getAddressFromCoordinate = async (lat, lng) => {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    throw new Error("Latitude and longitude are required");
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  const cacheKey = getCacheKey("reverse", `${latitude.toFixed(6)},${longitude.toFixed(6)}`);
  const cachedAddress = getCachedValue(cacheKey);

  if (cachedAddress) {
    return cachedAddress;
  }

  let addressResult;

  try {
    const nominatimResponse = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
      headers: REQUEST_HEADERS,
      params: {
        lat: latitude,
        lon: longitude,
        format: "jsonv2",
        zoom: 18,
        addressdetails: 1,
      },
      timeout: 10000,
    });

    const displayName = nominatimResponse?.data?.display_name;
    if (!displayName) {
      throw new Error("No display name");
    }

    addressResult = {
      address: displayName,
      province:
        nominatimResponse?.data?.address?.state ||
        nominatimResponse?.data?.address?.region ||
        nominatimResponse?.data?.address?.county ||
        "",
      countryCode: nominatimResponse?.data?.address?.country_code || "",
      ltd: latitude,
      lng: longitude,
    };
  } catch (_) {
    const arcgisResponse = await axios.get(ARCGIS_REVERSE_GEOCODE_URL, {
      params: {
        f: "json",
        location: `${longitude},${latitude}`,
        langCode: "es",
      },
      timeout: 10000,
    });

    const addressLabel = arcgisResponse?.data?.address?.LongLabel;
    if (!addressLabel) {
      throw new Error("Unable to fetch address");
    }

    addressResult = {
      address: addressLabel,
      province:
        arcgisResponse?.data?.address?.Region ||
        arcgisResponse?.data?.address?.Subregion ||
        "",
      countryCode:
        String(arcgisResponse?.data?.address?.CountryCode || "").toLowerCase(),
      ltd: latitude,
      lng: longitude,
    };
  }

  setCachedValue(cacheKey, addressResult);
  return addressResult;
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  try {
    const cacheKey = getCacheKey("route", `${origin}::${destination}`);
    const cachedRoute = getCachedValue(cacheKey);
    if (cachedRoute) {
      return cachedRoute;
    }

    const start = await resolveLocation(origin);
    const end = await resolveLocation(destination);

    const response = await axios.get(
      `${OSRM_BASE_URL}/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}`,
      {
        params: {
          overview: "full",
          geometries: "geojson",
        },
        timeout: 10000,
      }
    );

    const route = response?.data?.routes?.[0];
    if (!route) {
      throw new Error("No routes found");
    }

    const routeResult = {
      distance: {
        text: formatDistance(route.distance),
        value: Math.round(route.distance),
      },
      duration: {
        text: formatDuration(route.duration),
        value: Math.round(route.duration),
      },
      status: "OK",
      route: {
        coordinates: route.geometry.coordinates.map((coordinate) => ({
          lat: coordinate[1],
          lng: coordinate[0],
        })),
      },
      origin: {
        ltd: start.lat,
        lng: start.lon,
      },
      destination: {
        ltd: end.lat,
        lng: end.lon,
      },
    };

    setCachedValue(cacheKey, routeResult);
    return routeResult;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports.getAutoCompleteSuggestions = async (
  input,
  { lat, lng, province, countryCode } = {}
) => {
  if (!input) {
    throw new Error("query is required");
  }

  try {
    const cacheKey = getCacheKey(
      "suggest",
      `${input}::${lat || ""},${lng || ""}::${province || ""}::${
        countryCode || ""
      }`
    );
    const cachedSuggestions = getCachedValue(cacheKey);
    if (cachedSuggestions) {
      return cachedSuggestions;
    }

    const normalizedInput = String(input).trim();
    const normalizedProvince = String(province || "").trim();
    const normalizedCountryCode = String(countryCode || "")
      .trim()
      .toLowerCase();
    const hasValidPoint =
      Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));

    let googleSuggestions = [];
    if (GOOGLE_MAPS_API) {
      try {
        const googleResponse = await axios.get(GOOGLE_AUTOCOMPLETE_URL, {
          params: {
            input: normalizedInput,
            key: GOOGLE_MAPS_API,
            language: "es",
            types: "geocode",
            ...(hasValidPoint
              ? {
                  location: `${Number(lat)},${Number(lng)}`,
                  radius: 50000,
                }
              : {}),
            ...(normalizedCountryCode
              ? { components: `country:${normalizedCountryCode}` }
              : {}),
          },
          timeout: 10000,
        });

        const status = googleResponse?.data?.status;
        if (status === "OK" || status === "ZERO_RESULTS") {
          googleSuggestions = (googleResponse?.data?.predictions || [])
            .map((prediction) => prediction.description)
            .filter(Boolean);
        }
      } catch (_) {
        // Continue with Nominatim fallback/merge
      }
    }

    let arcgisSuggestions = [];
    try {
      const arcgisResponse = await axios.get(ARCGIS_GEOCODE_URL, {
        params: {
          f: "json",
          singleLine: normalizedInput,
          maxLocations: 8,
          outFields: "*",
          ...(hasValidPoint
            ? {
                location: `${Number(lng)},${Number(lat)}`,
              }
            : {}),
          ...(normalizedCountryCode
            ? {
                sourceCountry: normalizedCountryCode.toUpperCase(),
              }
            : {}),
        },
        timeout: 10000,
      });

      arcgisSuggestions = (arcgisResponse?.data?.candidates || [])
        .map((candidate) => candidate.address)
        .filter(Boolean);
    } catch (_) {
      // Continue with other providers
    }

    const nominatimFetch = async (queryText, options = {}) => {
      try {
        const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
          headers: REQUEST_HEADERS,
          params: {
            q: queryText,
            format: "jsonv2",
            addressdetails: 1,
            ...(options.withGeoBias && hasValidPoint
              ? {
                  lat: Number(lat),
                  lon: Number(lng),
                }
              : {}),
            ...(options.withCountry && normalizedCountryCode
              ? {
                  countrycodes: normalizedCountryCode,
                }
              : {}),
            limit: 8,
          },
          timeout: 10000,
        });

        if (!Array.isArray(response.data)) {
          return [];
        }

        return response.data
          .map((suggestion) => suggestion.display_name)
          .filter(Boolean);
      } catch (_) {
        return [];
      }
    };

    const nominatimLocalSuggestions = await nominatimFetch(normalizedInput, {
      withGeoBias: true,
      withCountry: true,
    });

    const nominatimCountrySuggestions = await nominatimFetch(normalizedInput, {
      withGeoBias: false,
      withCountry: true,
    });

    const nominatimGlobalSuggestions = await nominatimFetch(normalizedInput, {
      withGeoBias: false,
      withCountry: false,
    });

    let nominatimProvinceSuggestions = [];
    if (
      normalizedProvince &&
      !normalizedInput.toLowerCase().includes(normalizedProvince.toLowerCase())
    ) {
      nominatimProvinceSuggestions = await nominatimFetch(
        `${normalizedInput}, ${normalizedProvince}`,
        {
          withGeoBias: false,
          withCountry: true,
        }
      );
    }

    const mergedSuggestions = [
      ...googleSuggestions,
      ...arcgisSuggestions,
      ...nominatimLocalSuggestions,
      ...nominatimProvinceSuggestions,
      ...nominatimCountrySuggestions,
      ...nominatimGlobalSuggestions,
    ]
      .filter(Boolean)
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .slice(0, 12);

    let finalSuggestions = mergedSuggestions;

    if (finalSuggestions.length === 0) {
      const tokens = normalizedInput.split(/\s+/).filter(Boolean);
      const fallbackQueries = [];

      if (tokens.length > 1) {
        fallbackQueries.push(tokens[tokens.length - 1]);
        fallbackQueries.push(tokens.slice(-2).join(" "));
      }

      const fallbackResults = [];
      for (const queryText of fallbackQueries) {
        if (!queryText || queryText.length < 2) {
          continue;
        }

        const fallbackCountry = await nominatimFetch(queryText, {
          withGeoBias: false,
          withCountry: true,
        });
        fallbackResults.push(...fallbackCountry);

        if (normalizedProvince) {
          const fallbackProvince = await nominatimFetch(
            `${queryText}, ${normalizedProvince}`,
            {
              withGeoBias: false,
              withCountry: true,
            }
          );
          fallbackResults.push(...fallbackProvince);
        }

        const fallbackGlobal = await nominatimFetch(queryText, {
          withGeoBias: false,
          withCountry: false,
        });
        fallbackResults.push(...fallbackGlobal);
      }

      finalSuggestions = fallbackResults
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, 12);
    }

    const prioritizedSuggestions = prioritizeByProvince(
      finalSuggestions,
      province
    ).slice(0, 8);

    setCachedValue(cacheKey, prioritizedSuggestions);
    return prioritizedSuggestions;
  } catch (err) {
    console.log(err.message);
    return [];
  }
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius, vehicleType) => {
  // radius in km
  
  try {
    const captains = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lng, ltd], radius / 6371],
        },
      },
      "vehicle.type": vehicleType,
    });
    return captains;
  } catch (error) {
    throw new Error("Error in getting captain in radius: " + error.message);
  }
};
