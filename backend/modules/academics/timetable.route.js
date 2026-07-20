const express = require('express');
const router = express.Router();
const controller = require('./academics.controller');

router.get('/class/:classId', controller.getTimetableByClass);

module.exports = router;
