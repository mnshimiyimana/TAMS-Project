import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  createInsight, 
  getInsights, 
  getInsightById, 
  updateInsight, 
  deleteInsight 
} from '../controllers/insightsController.js';

const router = express.Router();

router.post('/', protect, createInsight); // Protected route
router.get('/', getInsights);
router.get('/:id', getInsightById);
router.put('/:id', protect, updateInsight); // Protected route
router.delete('/:id', protect, deleteInsight); // Protected route

export default router;
