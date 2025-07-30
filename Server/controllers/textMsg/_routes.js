const express = require('express');
const auth = require('../../middlewares/auth');
const textMsg = require('./textMsg')

const router = express.Router();

router.get('/', auth, textMsg.index)
router.get('/view/:id', auth, textMsg.view)
router.post('/add', auth, textMsg.add)

module.exports = router