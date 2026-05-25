import express from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { renderHistorialCitas } from '../controllers/citaController.js';

const router = express.Router();

router.get('/', asyncHandler(renderHistorialCitas));

export default router;
