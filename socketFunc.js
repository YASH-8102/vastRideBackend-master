const { USERS, addUser, emptyTaskStack, reconnectUser, findUserByUid, addStack, isUserExist, getTaskStack, isUserConnectedToUser, filterUserBySocketId,removeUser,connectUserToUser } = require("./Users")
const {
	DRIVERS,
	addDriver,

	filterByCity,
	removeDriver,
	getAllDriver,
	findNearestDriver,
} = require("./Driver");


module.exports = socketFunc = (io,socket) => {
	const isUserConnectedToSocket = (socketId) => {
	return io.sockets.sockets[socketId]?io.sockets.sockets[socketId].connected:false;
}
	console.log(socket.id, "connected");
	// console.log(io.sockets.sockets[socket.id].connected)
	
	socket.on("userConnect", ({ uid,type }) => {
	

		if (isUserExist(uid)) {
			const user = reconnectUser({ uid, newSocketId: socket.id });
		
		

			const tasks = user.tasks ? user.tasks : [];
			// const isUserConnectedToUser = isUserConnectedToUser()
			if (tasks.length > 0) {
				console.log({tasks,id:socket.id})
					// socket.broadcast.to(socket.id).emit('messageToRider', { message: 'asdasd' });
				tasks.forEach((task) => {
					const { eventName, eventData } = task;
					console.log({ eventName, eventData })
					socket.emit(eventName, eventData);
				})
				emptyTaskStack(user.uid);

			}
			if (isUserConnectedToUser(user.uid)) {
				socket.broadcast.to(user.connectedSocketId).emit("UpdateSocketId", { newSocketId: socket.id })
				console.log("hello")
			}



		}
		else {
	console.log({uid,type})
		const newUser = addUser({ uid, socketId: socket.id, userType:type});
		console.log({newUser});
		}
	})
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


	//user side events

	socket.on("getDrivers", ({ city }, cabsOnMapHandler) => {
		const Drivers = filterByCity(city);
		socket.join(city.toLowerCase());
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

	socket.on("paymentMethodSelected", ({ method, id }) => {
		if (isUserConnectedToSocket(id)) {
			socket.broadcast.to(id).emit("paymentMethodSelected", { method });
		}
		else {
			const user = filterUserBySocketId(id).uid;
			const task = { eventName: "paymentMethodSelected", eventData: { method } }
			console.log({ uid: user, task})
			addStack({ uid: user, task })
		}

	});
	socket.on("cardPaymentSuccess", ({ isSuccess, id }) => {
		if (isUserConnectedToSocket(id)) {
			socket.broadcast.to(id).emit("cardPaymentSuccess", { isSuccess });
		}
		else {
			const user = filterUserBySocketId(id).uid;
			const task = { eventName: "cardPaymentSuccess", eventData: { isSuccess } }
			addStack({ uid: user, task })

		}

	});
	socket.on("cancelRide", ({ reason, id }) => {
		if (isUserConnectedToSocket(id)) {
			socket.broadcast.to(id).emit("cancelRide", { reason });

		}
		else {
			const user = filterUserBySocketId(id).uid;
			const task = { eventName: "cancelRide", eventData: { reason } }
			addStack({ uid: user, task })

		}
	});
	socket.on("messageToDriver", ({ message, id }) => {
		if (isUserConnectedToSocket(id)) {
			socket.broadcast.to(id).emit("messageToDriver", { message });

		}
		else {
			const user = filterUserBySocketId(id).uid;
			const task = { eventName: "messageToDriver", eventData: { message } }
			addStack({ uid: user, task })

		}
	});




	//Driver side Events
	socket.on("requestAccept", ({ id, location }) => {
		const clientUid = filterUserBySocketId(id).uid;
		const driverUid = filterUserBySocketId(socket.id).uid;
		connectUserToUser({uid:clientUid,connectedSocketId:socket.id});
		connectUserToUser({uid:driverUid,connectedSocketId:id});

		console.log({USERS})

		if (isUserConnectedToSocket(id)) {
			socket.broadcast.to(id).emit("requestAccepted", { location });
		}
		else {
			const user = filterUserBySocketId(id).uid;
			const task = { eventName: "requestAccepted", eventData: { location } }
			addStack({ uid: user, task })
		}

	});
	socket.on("requestReject", ({ id }) => {
			if (isUserConnectedToSocket(id)) {
			socket.broadcast.to(id).emit("requestRejected");
		}
		else {
			const user = filterUserBySocketId(id).uid;
			const task = { eventName: "requestRejected", eventData: {  } }
			addStack({ uid: user, task })
		}

	});
	socket.on("realTimeLocation", ({ location, id }) => {
				if (isUserConnectedToSocket(id)) {
		socket.broadcast.to(id).emit("driverLocationUpdate", { location });
	
		}
		else {
			const user = filterUserBySocketId(id).uid;
			const task = { eventName: "driverLocationUpdate", eventData: { location } }
			addStack({ uid: user, task })
		}
	});
	socket.on("DriverArrived", ({ id }) => {
			if (isUserConnectedToSocket(id)) {
			socket.broadcast.to(id).emit("driverArrived", { data: "hi" });

		}
		else {
			const user = filterUserBySocketId(id).uid;
			const task = { eventName: "driverArrived", eventData: { data: "hi" } }
			addStack({ uid: user, task })
		}
	});
	socket.on("tripStart", ({ id }) => {
			if (isUserConnectedToSocket(id)) {
				socket.broadcast.to(id).emit("tripStarted", { data: "hi" });

		}
		else {
			const user = filterUserBySocketId(id).uid;
			const task = { eventName: "tripStarted", eventData: { data: "hi" } }
			addStack({ uid: user, task })
		}
	});
	socket.on("tripEnd", ({ id }) => {
			if (isUserConnectedToSocket(id)) {
					socket.broadcast.to(id).emit("tripEnd", { data: "hi" });

		}
		else {
			const user = filterUserBySocketId(id).uid;
			const task = { eventName: "tripEnd", eventData: { data: "hi" } }
			addStack({ uid: user, task })
		}
	});
	socket.on("messageToRider", ({ message, id }) => {
			if (isUserConnectedToSocket(id)) {
						socket.broadcast.to(id).emit("messageToRider", { message });

		}
		else {

			const user = filterUserBySocketId(id).uid;
					console.log({id,USERS})
			const task = { eventName: "messageToRider", eventData: { message } }
				console.log({ uid: user, task})
			addStack({ uid: user, task })
		}
	});

	//Admin side Event
	socket.on("getAllDrivers", (cabsOnMapHandler) => {
		console.log("from admin");
		const Drivers = getAllDriver();
		cabsOnMapHandler(Drivers);
	});


	//Disconnect Event
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
		const user = filterUserBySocketId(socket.id).uid;
	
		if(!isUserConnectedToUser(user)){
			console.log("user removed from array")
			removeUser(user)
		}
	});

	//Dummy events
	socket.on("rideisOnStillDisconnected", ({ uid }) => {
		
	})
	socket.on("online", () => {
		//do nothing
	});
}