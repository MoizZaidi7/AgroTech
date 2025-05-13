import express from 'express';
import {createComplaint , viewComplaint} from '../controllers/FarmerController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorize.js';
import { updateLastActivity } from '../middleware/lastactivity.js';
import { createProduct, updateInventory, createCampaign , getProducts , getFarmerProducts , updateProduct , deleteProduct, getFarmerOrders} from '../controllers/MarketPlaceController.js';
import { upload } from '../config/multer.js';
import { checkInactivity } from '../middleware/inactivity.js';

const FarmerRouter = express.Router();

FarmerRouter.use(updateLastActivity);

FarmerRouter.post('/products', authMiddleware, authorize(['Farmer']),  upload.array('images', 5), createProduct);

FarmerRouter.post("/complaints", authMiddleware, authorize(['Farmer']), createComplaint);

FarmerRouter.get("/complaints", authMiddleware, authorize(['Farmer']), viewComplaint);

FarmerRouter.post('/campaigns', authMiddleware, authorize(['Farmer']), createCampaign);

FarmerRouter.get('/products', authMiddleware, getProducts);

FarmerRouter.get('/products/my-products', authMiddleware, authorize(['Farmer']), getFarmerProducts);

FarmerRouter.put('/products/:id', authMiddleware, authorize(['Farmer']), upload.array('images', 5), updateProduct);

FarmerRouter.delete('/products/:id', authMiddleware, authorize(['Farmer']), deleteProduct);

FarmerRouter.get('/orders/farmer-orders', authMiddleware, authorize(['Farmer']), getFarmerOrders);

FarmerRouter.put('/inventory', authMiddleware, authorize(['Farmer']), updateInventory);

FarmerRouter.post('/campaigns', authMiddleware, authorize(['Farmer']), createCampaign);


export default FarmerRouter;