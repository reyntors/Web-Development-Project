const express = require("express");
const router = express.Router();
const lotController = require("../controllers/lot.controller");
const auth = require("../middlewares/auth"); // Import the authentication middleware
const userController = require("../controllers/users.controller");
const uploadedController = require("../controllers/uploaded.controller")
const tesController = require("../services/s3service")

router.get("/allLot",  lotController.getPublicLotDetails);
router.get("/:lotNumber", lotController.getPublicLotDetails);
router.post("/addlot", auth.authenticateToken, userController.restrict('staff'), lotController.createLot);
router.put("/updatelot/:lotNumber", auth.authenticateToken, userController.restrict('staff'), lotController.updateLot);
router.get("/retrieve-lotImage/:lotNumber/:filename", uploadedController.retrieveLotImage);


// router.put("/updatelot/:lotNumber", auth.authenticateToken, userController.restrict('staff'), tesController.updateLot);

module.exports = router;