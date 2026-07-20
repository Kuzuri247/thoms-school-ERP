const express = require('express');
const router = express.Router();
const controller = require('./academics.controller');

router.get('/student/:studentId', controller.getMarksByStudent);
router.post('/', controller.saveMarks);

module.exports = router;
