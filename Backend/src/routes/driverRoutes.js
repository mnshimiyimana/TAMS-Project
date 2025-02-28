import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { 
  createDriver, 
  getDrivers, 
  getDriverById, 
  updateDriver, 
  deleteDriver 
} from '../controllers/driverController.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'manager'), createDriver);
router.get('/', getDrivers);
router.get('/:id', getDriverById);
router.put('/:id', protect, updateDriver);
router.delete('/:id', protect, deleteDriver);

export default router;
