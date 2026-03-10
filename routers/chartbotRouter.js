import express from 'express';
import { handleChat } from '../controllers/chartbotController.js';

const chartbotRouter = express.Router();
chartbotRouter.post("/", handleChat);

export default chartbotRouter;


