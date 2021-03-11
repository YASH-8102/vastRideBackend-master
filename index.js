const express = require("express");
const app = express();
var cors = require("cors");
const server = require("http").createServer(app);
const bodyParser = require("body-parser");
const io = require("socket.io")(server, {
  cookie: false,
  pingTimeout: 30000,
  pingInterval: 5000,

  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(bodyParser.json());

const {
  DRIVERS,
  addDriver,
  addUser,
  filterByCity,
  removeDriver,
  getAllDriver,
  findNearestDriver,
} = require("./Driver");

const adminRouter = require("./Router/Admin");
const NearestDriversOfUsers = [];

io.on("connection", (socket) => {
  console.log(socket.id, "connected");
  socket.on(
    "driverConnect",
    ({ currentCoordinates, city, userData, vehicle }) => {
      let dummy = {
        name: userData.name,
        id: socket.id,
        city: city,
        location: currentCoordinates,
        vehicle: vehicle,
      };
      addDriver(dummy);
      socket.join(dummy.city.toLowerCase());
      io.to(dummy.city.toLowerCase()).emit("updateDriver", {
        updatedDrivers: filterByCity(dummy.city.toLowerCase()),
      });
      io.emit("updateAllDriver", { updatedDrivers: getAllDriver() });
    }
  );

  socket.on("getDrivers", ({ city }, cabsOnMapHandler) => {
    const Drivers = filterByCity(city);
    socket.join(city.toLowerCase());
    cabsOnMapHandler(Drivers);
  });
  socket.on("getAllDrivers", (cabsOnMapHandler) => {
    console.log("from admin");
    const Drivers = getAllDriver();
    cabsOnMapHandler(Drivers);
  });

  socket.on("FindNearestDriver", ({ coordinate, id, city }, e) => {
    const nearDrivers = findNearestDriver(coordinate, city);

    e(nearDrivers);
  });

  socket.on(
    "requestDriver",
    ({
      id,
      myid,
      to,
      from,
      rideDistance,
      rideTime,
      location,
      name,
      phoneNumber,
      fare,
    }) => {
      socket.broadcast.to(id).emit("request", {
        id: myid,
        to,
        from,
        rideDistance,
        rideTime,
        location,
        name,
        phoneNumber,
        fare,
      });
    }
  );
  socket.on("requestAccept", ({ id, location }) => {
    socket.broadcast.to(id).emit("requestAccepted", { location });
  });
  socket.on("requestReject", ({ id }) => {
    socket.broadcast.to(id).emit("requestRejected");
  });
  socket.on("realTimeLocation", ({ location, id }) => {
    socket.broadcast.to(id).emit("driverLocationUpdate", { location });
  });
  socket.on("DriverArrived", ({ id }) => {
    socket.broadcast.to(id).emit("driverArrived", { data: "hi" });
  });
  socket.on("tripStart", ({ id }) => {
    socket.broadcast.to(id).emit("tripStarted", { data: "hi" });
  });
  socket.on("tripEnd", ({ id }) => {
    socket.broadcast.to(id).emit("tripEnd", { data: "hi" });
  });
  socket.on("paymentMethodSelected", ({ method, id }) => {
    socket.broadcast.to(id).emit("paymentMethodSelected", { method });
  });
  socket.on("cardPaymentSuccess", ({ isSuccess, id }) => {
    socket.broadcast.to(id).emit("cardPaymentSuccess", { isSuccess });
  });
  socket.on("cancelRide", ({ reason, id }) => {
    socket.broadcast.to(id).emit("cancelRide", { reason });
  });
  socket.on("messageToDriver", ({ message, id }) => {
    socket.broadcast.to(id).emit("messageToDriver", { message });
  });
  socket.on("messageToRider", ({ message, id }) => {
    socket.broadcast.to(id).emit("messageToRider", { message });
  });

  socket.on("disconnect", () => {
    const dummy = removeDriver(socket.id);

    if (dummy[0]) {
      if (dummy[0].city) {
        const mycity = dummy[0].city;
        io.to(mycity).emit("updateDriver", { updatedDrivers: getAllDriver() });
        io.emit("updateAllDriver", { updatedDrivers: getAllDriver() });
        console.log("driver disconnected");
      }
    } else {
      console.log("Client disconnected");
    }
  });
  socket.on("online", () => {
    //do nothing
  });
});

app.use("/Admin", adminRouter);
app.get("/", (req, res) => {
  res.send("Hello world");
});

const PORT = process.env.PORT || 8082;
server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
