import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  createShift, 
  getShifts, 
  getShiftById, 
  updateShift, 
  deleteShift 
} from '../controllers/shiftController.js';

const router = express.Router();

router.post('/', protect, createShift); // Protected route
router.get('/', getShifts);
router.get('/:id', getShiftById);
router.put('/:id', protect, updateShift); // Protected route
router.delete('/:id', protect, deleteShift); // Protected route

export default router;
