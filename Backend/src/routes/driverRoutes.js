import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  createDriver, 
  getDrivers, 
  getDriverById, 
  updateDriver, 
  deleteDriver 
} from '../controllers/driverController.js';

const router = express.Router();

router.post('/', protect, createDriver); // Protected route
router.get('/', getDrivers);
router.get('/:id', getDriverById);
router.put('/:id', protect, updateDriver); // Protected route
router.delete('/:id', protect, deleteDriver); // Protected route

export default router;
