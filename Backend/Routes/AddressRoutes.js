const  express = require("express");
const router = express.Router();
const { createAddress, getAllAddress, updateAddress, deleteAddress} = require("../Controllers/AddressCatroller.js");
const {verifyToken} = require('../middleware/UserTokenVerify.js')



router.post("/create", verifyToken, createAddress);
router.get("/allAddress", verifyToken,  getAllAddress );
router.put("/update/:id", verifyToken, updateAddress);
router.delete("/delete/:id", verifyToken, deleteAddress);


module.exports = router;
