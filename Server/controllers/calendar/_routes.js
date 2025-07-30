const express = require('express');
const calender = require('./calendar')
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/', auth, calender.index)


module.exports = router