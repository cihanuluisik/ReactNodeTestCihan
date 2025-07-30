const express = require('express');
const { add, index, view, edit, deleteData, deleteMany } = require('./meeting');
const auth = require('../../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Meeting CRUD routes
router.post('/add', add);
router.get('/', index); // Default route for listing meetings
router.get('/index', index); // Keep existing route for backward compatibility
router.get('/view/:id', view);
router.put('/edit/:id', edit);
router.delete('/delete/:id', deleteData);
router.delete('/deleteMany', deleteMany);

module.exports = router;