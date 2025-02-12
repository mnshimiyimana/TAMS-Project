import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  createNotification, 
  getNotifications, 
  getNotificationById, 
  updateNotification, 
  deleteNotification 
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/', protect, createNotification); // Protected route
router.get('/', getNotifications);
router.get('/:id', getNotificationById);
router.put('/:id', protect, updateNotification); // Protected route
router.delete('/:id', protect, deleteNotification); // Protected route

export default router;
