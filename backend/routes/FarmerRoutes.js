import express from 'express';
import {createComplaint , viewComplaint} from '../controllers/FarmerController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorize.js';
import { updateLastActivity } from '../middleware/lastactivity.js';
import { checkInactivity } from '../middleware/inactivity.js';

const FarmerRouter = express.Router();
FarmerRouter.use(updateLastActivity);
FarmerRouter.use(checkInactivity);
FarmerRouter.post("/complaints", authMiddleware, authorize(['Farmer']), createComplaint);

FarmerRouter.get("/complaints", authMiddleware, authorize(['Farmer']), viewComplaint);

export default FarmerRouter;