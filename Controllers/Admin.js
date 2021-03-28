var admin = require("firebase-admin");
var async = require("async");
var vastrideAuth = require("../Private/dauntless-brace-290619-firebase-adminsdk-d70rm-c4cc2d5613.json");
var vastrideDriverAuth = require("../Private/vastridedriver-firebase-adminsdk-jjbsb-1f8b42aa7b.json");
var vastrideAdminAuth = require("../Private/vastrideadmin-firebase-adminsdk-o5eu3-f082dac352.json");

var vastride = admin.initializeApp(
  {
    credential: admin.credential.cert(vastrideAuth),
    databaseURL: "https://dauntless-brace-290619.firebaseio.com",
  },
  "primary"
);

var vastRideDriver = admin.initializeApp(
  {
    credential: admin.credential.cert(vastrideDriverAuth),
    databaseURL: "https://vastridedriver.firebaseio.com",
  },
  "secondary"
);

var vastrideAdmin = admin.initializeApp(
  {
    credential: admin.credential.cert(vastrideAdminAuth),
  },
  "Thirdone"
);

const userDb = vastride.firestore();
const driverDB = vastRideDriver.firestore();
const adminDb = vastrideAdmin.firestore();

async function addAdmin({ email, password, displayName, role }, callBack) {
  vastrideAdmin
    .auth()
    .createUser({
      email: email,
      emailVerified: false,

      password: password,
      displayName: displayName,
      disabled: false,
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.uid);
      adminDb
        .collection("Admins")
        .doc(userRecord.uid)
        .create({
          displayName: userRecord.displayName,
          role: role,
          email,

          uid: userRecord.uid,
        })
        .then((res) => {
          callBack(res);
        });
    })
    .catch((error) => {
      console.log("Error creating new user:", error);
    });
}
async function updateAdmin({ email, displayName, role, uid }, callBack) {
  adminDb
    .collection("Admins")
    .doc(uid)
    .update({
      displayName,
      role,
      email,
    })
    .then((res) => {
      callBack(res);
    })
    .catch((err) => {
      console.log({ err });
    });
}
async function getUserId(nextPageToken) {
  const UID = await (
    await vastride.auth().listUsers(1000, nextPageToken)
  ).users.map((e) => {
    return e.uid;
  });
  console.log(UID);
  return UID;
}

async function listAllUsers(callback) {
  try {
    const DATA = [];
    const Ids = await getUserId();

    const mydata = await Ids.map(async (e) => {
      const user = await userDb.collection("Users").doc(e).get();
      const udata = await user.data();
      if (udata) {
        udata.uid = e;
        return udata;
      }
    });
    console.log({ mydata });
    var cnt = 0;
    mydata.forEach(async (e, i, a) => {
      const element = await e;
      if (element) {
        await DATA.push(element);
      }
      console.log({ cnt, element });

      if (cnt + 1 === a.length) {
        callback(DATA);
      }
      cnt++;
    });
  } catch (error) {
    console.error(error);
  }
}

async function getDriverId(nextPageToken) {
  const UID = await (
    await vastRideDriver.auth().listUsers(1000, nextPageToken)
  ).users.map((e) => {
    return e.uid;
  });
  return UID;
}

async function listAllDrivers(callback) {
  try {
    const DATA = [];
    const Ids = await getDriverId();
    const mydata = await Ids.map(async (e, i) => {
      const user = await driverDB.collection("Users").doc(e).get();
      const udata = await user.data();
      if (udata) {
        if (udata) {
          udata.history.forEach((his, hisind) => {
            udata.history[hisind].day = udata.history[hisind].date
              .toDate()
              .getDate();
            udata.history[hisind].month =
              udata.history[hisind].date.toDate().getMonth() + 1;
            udata.history[hisind].year = udata.history[hisind].date
              .toDate()
              .getUTCFullYear();
          });
        }
        udata.uid = e;
        return udata;
      }
    });

    var cnt = 0;
    mydata.forEach(async (e, i, a) => {
      const element = await e;
      console.log({ element });
      if (element) {
        await DATA.push(element);
      }

      cnt++;
      if (cnt === a.length) {
        callback(DATA);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

async function deleteUserById(userId) {
  return new Promise((resolve, reject) => {
    vastride
      .auth()
      .deleteUser(userId)
      .then((r) => {
        userDb
          .collection("Users")
          .doc(userId)
          .delete()
          .then((res) => {
            resolve({ r, res });
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
async function deleteDriverById(userId) {
  return new Promise((resolve, reject) => {
    vastRideDriver
      .auth()
      .deleteUser(userId)
      .then((r) => {
        driverDB
          .collection("Users")
          .doc(userId)
          .delete()
          .then((res) => {
            resolve({ r, res });
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
async function deleteAdminById(userId) {
  return new Promise((resolve, reject) => {
    vastrideAdmin
      .auth()
      .deleteUser(userId)
      .then((r) => {
        adminDb
          .collection("Admins")
          .doc(userId)
          .delete()
          .then((res) => {
            resolve({ r, res });
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
async function verifyDriver(userId) {
  return new Promise((resolve, reject) => {
    const driversRef = driverDB.collection("Users").doc(userId);
    driversRef
      .update({ isVerified: true })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
async function addCarType(data, callback) {
  const { carType } = data;
  userDb
    .collection("carType")
    .doc(carType)
    .set(data)
    .then(() => {
      driverDB.collection("carType").doc(carType).set(data).then(callback);
    });
}
async function getCarType(callback) {
  const myData = [];
  const carTypes = await userDb.collection("carType").get();
  await carTypes.forEach((e) => {
    myData.push({ id: e.id, data: e.data() });
  });
  console.log(myData);
  callback(myData);
}

async function getUnverifiedDrivers(callback) {
  const myData = [];

  const driversRef = driverDB.collection("Users");
  const queryRef = await (
    await driversRef.where("isVerified", "==", false).get()
  ).docs;
  await queryRef.forEach((e) => {
    myData.push({ id: e.id, data: e.data() });
  });
  callback(myData);
}

async function getEarning(callback) {
  const myData = [];
  const earningRef = driverDB.collection("Earning");
  const Earining = await earningRef.get();
  await Earining.forEach((e) => {
    const type = e.id;
    const dummy = { type, data: e.data() };
    myData.push(dummy);
  });
  callback(myData);
}

async function authUser(req, res, next) {
  console.log({ headers: req.headers });
  if (req.headers.uid) {
    const uid = req.headers.uid;
    console.log({ header: req.header, uid });
    try {
      const result = await vastrideAdmin.auth().getUser(uid);
      console.log({ result });
      next();
    } catch (err) {
      console.log({ err });
      return res.status(400).json({ error: err });
    }
  } else {
    console.log({ error: "User not authneticated" });
    return res.status(400).json({ error: "User not authneticated" });
  }
}
module.exports = {
  listAllUsers,
  listAllDrivers,
  deleteUserById,
  addCarType,
  getCarType,
  getUnverifiedDrivers,
  verifyDriver,
  getEarning,
  addAdmin,
  authUser,
  deleteDriverById,
  updateAdmin,
  deleteAdminById,
};
