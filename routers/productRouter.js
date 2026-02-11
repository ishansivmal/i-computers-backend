import express from 'express';
import { createProduct,getProductById, getAllproduct,deleteProducts,updateProduct,serachProducts } from '../controllers/ProductController.js';


const productRouter = express.Router();

productRouter.get("/",getAllproduct);


productRouter.post("/",createProduct);
productRouter.get("/search:query", serachProducts);
productRouter.delete("/:productID",deleteProducts);
productRouter.put("/:productID",updateProduct);
productRouter.get("/:productID",getProductById);


export default productRouter;
