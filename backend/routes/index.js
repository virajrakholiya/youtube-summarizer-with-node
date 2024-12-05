var express = require("express");
const auth = require("../middleware/auth");
const { summarize } = require("../controllers/chatController");
var router = express.Router();

/* GET home page. */
router.post("/", auth, summarize);

module.exports = router;
