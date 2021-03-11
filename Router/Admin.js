var express = require("express");
var router = express.Router();
const {
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
} = require("../Controllers/Admin");

router.use(authUser);

router.get("/getuser", (req, res) => {
  listAllUsers((data) => {
    res.json(data);
  });
});
router.get("/getdrivers", (req, res) => {
  listAllDrivers((data) => {
    res.json(data);
  });
});
router.get("/getCarType", (req, res) => {
  getCarType((data) => {
    res.status(200).json(data);
  });
});
router.get("/deleteUser/:userId", (req, res) => {
  console.log({ uid: req.params.userId });
  deleteUserById(req.params.userId)
    .then((r) => {
      res.status(202).json(r);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});
router.get("/deleteDriver/:userId", (req, res) => {
  console.log({ uid: req.params.userId });
  deleteDriverById(req.params.userId)
    .then((r) => {
      res.status(202).json(r);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});
router.get("/deleteAdmin/:userId", (req, res) => {
  console.log({ uid: req.params.userId });
  deleteAdminById(req.params.userId)
    .then((r) => {
      res.status(202).json(r);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});
router.get("/verifyDriver/:userId", (req, res) => {
  console.log({ uid: req.params.userId });
  verifyDriver(req.params.userId)
    .then((r) => {
      res.status(202).json(r);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});
router.post("/addCarType", (req, res) => {
  addCarType(req.body, (result) => {
    res.status(200).json({ result, message: "data added successfully" });
  });
});
router.post("/updateAdmin", (req, res) => {
  updateAdmin(req.body, (result) => {
    res.status(200).json({ result, message: "data updates successfully" });
  });
});
router.get("/getunverifiedDrivers", (req, res) => {
  getUnverifiedDrivers((data) => {
    res.status(200).json(data);
  });
});
router.get("/getEarning", (req, res) => {
  getEarning((data) => {
    res.status(200).json(data);
  });
});
router.post("/addAdmin", (req, res) => {
  console.log(req.body);
  addAdmin(req.body, (result) => {
    res.status(200).json({ result, message: "data added successfully" });
  });
});

module.exports = router;
