import express from 'express';
import { createProduct, getProductById, getAllproduct, deleteProducts, updateProduct, serachProducts } from '../controllers/ProductController.js';

const productRouter = express.Router();

// ✅ SPECIFIC routes first (with exact paths)
productRouter.get("/search/:query", serachProducts);

// ✅ GENERAL routes second (with parameters)
productRouter.get("/", getAllproduct);
productRouter.post("/", createProduct);
productRouter.delete("/:productID", deleteProducts);
productRouter.put("/:productID", updateProduct);
productRouter.get("/:productID", getProductById);

export default productRouter;