import express from 'express';
import { createProduct,getProductById, getAllproduct,deleteProducts,updateProduct } from '../controllers/ProductController.js';


const productRouter = express.Router();

productRouter.get("/",getAllproduct);


productRouter.post("/",createProduct);
productRouter.delete("/:productID",deleteProducts);
productRouter.put("/:productID",updateProduct);
productRouter.get("/:productID",getProductById)
;

export default productRouter;
