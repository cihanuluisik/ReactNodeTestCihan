const express = require('express');
const auth = require('../../middlewares/auth');
const status = require('./status');
const router = express.Router();

router.get('/', auth, status.index)

module.exports = router