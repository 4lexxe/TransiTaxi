import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useCaptain } from "../contexts/CaptainContext";
import { Phone, User } from "lucide-react";
import { SocketDataContext } from "../contexts/SocketContext";
import { LiveMap, NewRide, Sidebar } from "../components";
import Console from "../utils/console";
import { useAlert } from "../hooks/useAlert";
import { Alert } from "../components";
import { BASE_URL } from "../config";

const map = "/map.png";

const defaultRideData = {
  user: {
    fullname: {
      firstname: "No",
      lastname: "User",
    },
    _id: "",
    email: "example@gmail.com",
    rides: [],
  },
  pickup: "Place, City, State, Country",
  destination: "Place, City, State, Country",
  fare: 0,
  vehicle: "car",
  status: "pending",
  duration: 0,
  distance: 0,
  _id: "123456789012345678901234",
};

function CaptainHomeScreen() {
  const token = localStorage.getItem("token");

  const { captain } = useCaptain();
  const { socket } = useContext(SocketDataContext);
  const [loading, setLoading] = useState(false);
  const { alert, showAlert, hideAlert } = useAlert();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupPoint, setPickupPoint] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState(null);
  const [routeStartPoint, setRouteStartPoint] = useState(null);
  const [routeEndPoint, setRouteEndPoint] = useState(null);
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
  });

  const [rides, setRides] = useState({
    accepted: 0,
    cancelled: 0,
    distanceTravelled: 0,
  });
  const [newRide, setNewRide] = useState(
    JSON.parse(localStorage.getItem("rideDetails")) || defaultRideData
  );

  const [otp, setOtp] = useState("");
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [error, setError] = useState("");

  const getCoordinates = async (address) => {
    const response = await axios.get(
      `${BASE_URL}/map/get-coordinates?address=${encodeURIComponent(
        address
      )}`
    );

    return {
      lat: Number(response.data.ltd),
      lng: Number(response.data.lng),
    };
  };

  // Panels
  const [showCaptainDetailsPanel, setShowCaptainDetailsPanel] = useState(true);
  const [showNewRidePanel, setShowNewRidePanel] = useState(
    JSON.parse(localStorage.getItem("showPanel")) || false
  );
  const [showBtn, setShowBtn] = useState(
    JSON.parse(localStorage.getItem("showBtn")) || "accept"
  );

  const acceptRide = async () => {
    try {
      if (newRide._id != "") {
        setLoading(true);
        const response = await axios.post(
          `${BASE_URL}/ride/confirm`,
          { rideId: newRide._id },
          {
            headers: {
              token: token,
            },
          }
        );
        setLoading(false);
        setShowBtn("otp");
        if (currentLocation && pickupPoint) {
          setRouteStartPoint(currentLocation);
          setRouteEndPoint(pickupPoint);
        }
        Console.log(response);
      }
    } catch (error) {
      setLoading(false);
      showAlert('Some error occured', error.response.data.message, 'failure');
      Console.log(error.response);
      setTimeout(() => {
        clearRideData();
      }, 1000);
    }
  };

  const verifyOTP = async () => {
    try {
      if (newRide._id != "" && otp.length == 6) {
        setLoading(true);
        const response = await axios.get(
          `${BASE_URL}/ride/start-ride?rideId=${newRide._id}&otp=${otp}`,
          {
            headers: {
              token: token,
            },
          }
        );
        if (currentLocation && destinationPoint) {
          setRouteStartPoint(currentLocation);
          setRouteEndPoint(destinationPoint);
        }
        setShowBtn("end-ride");
        setLoading(false);
        Console.log(response);
      }
    } catch (err) {
      setLoading(false);
      setError("Invalid OTP");
      Console.log(err);
    }
  };

  const endRide = async () => {
    try {
      if (newRide._id != "") {
        setLoading(true);
        await axios.post(
          `${BASE_URL}/ride/end-ride`,
          {
            rideId: newRide._id,
          },
          {
            headers: {
              token: token,
            },
          }
        );
        setRouteStartPoint(null);
        setRouteEndPoint(null);
        setShowBtn("accept");
        setLoading(false);
        setShowCaptainDetailsPanel(true);
        setShowNewRidePanel(false);
        setNewRide(defaultRideData);
        localStorage.removeItem("rideDetails");
        localStorage.removeItem("showPanel");
      }
    } catch (err) {
      setLoading(false);
      Console.log(err);
    }
  };

  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          socket.emit("update-location-captain", {
            userId: captain._id,
            location: {
              ltd: position.coords.latitude,
              lng: position.coords.longitude,
            },
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

  const clearRideData = () => {
    setShowBtn("accept");
    setLoading(false);
    setShowCaptainDetailsPanel(true);
    setShowNewRidePanel(false);
    setNewRide(defaultRideData);
    setPickupPoint(null);
    setDestinationPoint(null);
    setRouteStartPoint(null);
    setRouteEndPoint(null);
    localStorage.removeItem("rideDetails");
    localStorage.removeItem("showPanel");
  }

  useEffect(() => {
    if (captain._id) {
      socket.emit("join", {
        userId: captain._id,
        userType: "captain",
      });

      // const locationInterval = setInterval(updateLocation, 10000);
      updateLocation(); // IMP: Call this function to update location
    }

    socket.on("new-ride", (data) => {
      Console.log("New Ride available:", data);
      setShowBtn("accept");
      setNewRide(data);
      setShowNewRidePanel(true);

      Promise.all([getCoordinates(data.pickup), getCoordinates(data.destination)])
        .then(([pickupCoords, destinationCoords]) => {
          setPickupPoint(pickupCoords);
          setDestinationPoint(destinationCoords);
        })
        .catch((error) => {
          Console.error(error);
        });
    });

    socket.on("ride-cancelled", (data) => {
      Console.log("Ride cancelled", data);
      updateLocation();
      clearRideData();
    });
  }, [captain]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    socket.emit("join-room", newRide._id);

    socket.on("receiveMessage", async (msg) => {
      // Console.log("Received message: ", msg);
      setMessages((prev) => [...prev, { msg, by: "other" }]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [newRide]);

  useEffect(() => {
    localStorage.setItem("rideDetails", JSON.stringify(newRide));
  }, [newRide]);

  useEffect(() => {
    localStorage.setItem("showPanel", JSON.stringify(showNewRidePanel));
    localStorage.setItem("showBtn", JSON.stringify(showBtn));
  }, [showNewRidePanel, showBtn]);

  const calculateEarnings = () => {
    let Totalearnings = 0;
    let Todaysearning = 0;

    let acceptedRides = 0;
    let cancelledRides = 0;

    let distanceTravelled = 0;

    const today = new Date();
    const todayWithoutTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    captain.rides.forEach((ride) => {
      if (ride.status == "completed") {
        acceptedRides++;
        distanceTravelled += ride.distance;
      }
      if (ride.status == "cancelled") cancelledRides++;

      Totalearnings += ride.fare;
      const rideDate = new Date(ride.updatedAt);

      const rideDateWithoutTime = new Date(
        rideDate.getFullYear(),
        rideDate.getMonth(),
        rideDate.getDate()
      );

      if (
        rideDateWithoutTime.getTime() === todayWithoutTime.getTime() &&
        ride.status === "completed"
      ) {
        Todaysearning += ride.fare;
      }
    });

    setEarnings({ total: Totalearnings, today: Todaysearning });
    setRides({
      accepted: acceptedRides,
      cancelled: cancelledRides,
      distanceTravelled: Math.round(distanceTravelled / 1000),
    });
  };

  useEffect(() => {
    calculateEarnings();
  }, [captain]);

  useEffect(() => {
    if (socket.id) Console.log("socket id:", socket.id);
  }, [socket.id]);

  return (
    <div
      className="relative w-full h-dvh bg-contain"
      style={{ backgroundImage: `url(${map})` }}
    >
      <Alert
        heading={alert.heading}
        text={alert.text}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        type={alert.type}
      />
      <Sidebar />
      <LiveMap
        className="map w-full h-[80vh] z-0"
        currentLocation={currentLocation}
        pickupPoint={pickupPoint}
        destinationPoint={destinationPoint}
        routeStart={routeStartPoint}
        routeEnd={routeEndPoint}
        isRideAccepted={showBtn !== "accept"}
      />

      {showCaptainDetailsPanel && (
        <div className="absolute bottom-0 flex flex-col justify-start p-4 gap-2 rounded-t-lg bg-white h-fit w-full">
          {/* Driver details */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="my-2 select-none rounded-full w-10 h-10 bg-blue-400 mx-auto flex items-center justify-center">
                <h1 className="text-lg text-white">
                  {captain?.fullname?.firstname[0]}
                  {captain?.fullname?.lastname[0]}
                </h1>
              </div>

              <div>
                <h1 className="text-lg font-semibold leading-6">
                  {captain?.fullname?.firstname} {captain?.fullname?.lastname}
                </h1>
                <p className="text-xs flex items-center gap-1 text-gray-500 ">
                  <Phone size={12} />
                  {captain?.phone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 ">Earnings</p>
              <h1 className="font-semibold">₹ {earnings.today}</h1>
            </div>
          </div>

          {/* Ride details */}
          <div className="flex justify-around items-center mt-2 py-4 rounded-lg bg-zinc-800">
            <div className="flex flex-col items-center text-white">
              <h1 className="mb-1 text-xl">{rides?.accepted}</h1>
              <p className="text-xs text-gray-400 text-center leading-3">
                Rides
                <br />
                Accepted
              </p>
            </div>
            <div className="flex flex-col items-center text-white">
              <h1 className="mb-1 text-xl">{rides?.distanceTravelled}</h1>
              <p className="text-xs text-gray-400 text-center leading-3">
                Km
                <br />
                Travelled
              </p>
            </div>
            <div className="flex flex-col items-center text-white">
              <h1 className="mb-1 text-xl">{rides?.cancelled}</h1>
              <p className="text-xs text-gray-400 text-center leading-3">
                Rides
                <br />
                Cancelled
              </p>
            </div>
          </div>

          {/* Car details */}
          <div className="flex justify-between border-2 items-center pl-3 py-2 rounded-lg">
            <div>
              <h1 className="text-lg font-semibold leading-6 tracking-tighter ">
                {captain?.vehicle?.number}
              </h1>
              <p className="text-xs text-gray-500 flex items-center">
                {captain?.vehicle?.color} |
                <User size={12} strokeWidth={2.5} /> {captain?.vehicle?.capacity}
              </p>
            </div>

            <img
              className="rounded-full h-16 scale-x-[-1]"
              src={
                captain?.vehicle?.type == "car"
                  ? "/car.png"
                  : `/${captain.vehicle.type}.webp`
              }
              alt="Driver picture"
            />
          </div>
        </div>
      )}

      <NewRide
        rideData={newRide}
        otp={otp}
        setOtp={setOtp}
        showBtn={showBtn}
        showPanel={showNewRidePanel}
        setShowPanel={setShowNewRidePanel}
        showPreviousPanel={setShowCaptainDetailsPanel}
        loading={loading}
        acceptRide={acceptRide}
        verifyOTP={verifyOTP}
        endRide={endRide}
        error={error}
      />
    </div>
  );
}

export default CaptainHomeScreen;
