const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { ROLES } = require('../../config/constants');
const svc = require('./elearning.service');

// Teacher posts new YouTube learning video
router.post('/', verifyToken, authorize(ROLES.TEACHER), async (req, res) => {
  try {
    const { section_id, title, description, youtube_url } = req.body;
    if (!section_id || !title || !youtube_url) {
      return res.status(400).json({ success: false, message: 'Class section, title, and YouTube link are required.' });
    }

    const videoId = svc.extractYouTubeId(youtube_url);
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Invalid YouTube URL. Please provide a valid YouTube link.' });
    }

    const id = await svc.createMaterial({
      teacher_id: req.user.id,
      section_id,
      title,
      description,
      youtube_url,
    });

    res.status(201).json({ success: true, message: 'E Learning video shared successfully', id });
  } catch (error) {
    console.error('Error posting E Learning material:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Teacher views their posted video history
router.get('/teacher', verifyToken, authorize(ROLES.TEACHER), async (req, res) => {
  try {
    const materials = await svc.getTeacherMaterials(req.user.id);
    res.json({ success: true, data: materials });
  } catch (error) {
    console.error('Error fetching teacher E Learning materials:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Teacher deletes a video they posted
router.delete('/:id', verifyToken, authorize(ROLES.TEACHER), async (req, res) => {
  try {
    const success = await svc.deleteMaterial(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Video material not found or unauthorized' });
    }
    res.json({ success: true, message: 'E Learning video deleted successfully' });
  } catch (error) {
    console.error('Error deleting E Learning material:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Student views E Learning videos posted for their enrolled section
router.get('/student/my-learning', verifyToken, authorize(ROLES.STUDENT), async (req, res) => {
  try {
    const materials = await svc.getStudentMaterials(req.user.id);
    res.json({ success: true, data: materials });
  } catch (error) {
    console.error('Error fetching student E Learning materials:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
