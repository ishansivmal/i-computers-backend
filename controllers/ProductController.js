import express from "express";
import product from "../models/product.js";



import { isAdmin } from "../controllers/userController.js";
import e from "express";


export function createProduct(req, res) {

    if (!isAdmin(req)) {
        res.status(403).json({ message: "Forbidden: Admins only" });
        return
    }

    //by using return statment we can stop running the code further if the user is not authorized or not an admin 

    const Product = new product(req.body)
    Product.save().then(
        () => {
            res.json({
                message: "Product created successfully"
            })
        }
    )
        .catch(err => {
            res.status(500).json({
                message: "Error creating product",
                error: err.message
            })
            console.log(err)
        })

}

export function getAllproduct(req, res) {


    if (isAdmin(req)) {

        product.find().then(
            (products) => {
                res.json(products)

            }
        ).catch(
                (err) => {
                    res.status(500).json({
                        message: "Error fetching products",
                        error: err.message
                    })
                }
            )

    }
    else {

        product.find({ isAvailable: true }).then(
            (products) => {
                res.json(products)
            }
        )
            .catch(
                (err) => {
                    res.status(500).json({
                        message: "Error fetching products",
                        error: err.message
                    })
                }
            )
    }
}


export function deleteProducts(req, res) {
    console.log(req.user);

    if (!isAdmin(req)) {
        res.status(403).json({ message: "Forbidden: Admins only" });
        return
    }

    const productID = req.params.productID
    product.deleteOne({ productID: productID }).then(
        () => {
            res.json({
                message: "Product deleted successfully"
            })
        }
    )
        .catch(err => {
            res.status(500).json({
                message: "Error deleting product",
                error: err.message
            })
        })
}


export function updateProduct(req, res) {

    if (!isAdmin(req)) {
        res.status(403).json({ message: "Forbidden: Admins only" });
        return
    }


    const productID = req.params.productID

    product.updateOne({ productID: productID }, req.body).then(
        () => {
            res.json({
                message: "Product updated successfully"
            })
        }
    )
        .catch(err => {
            res.status(500).json({
                message: "Error updating product",
                error: err.message
            })
        })

}


export function getProductById(req, res) {
    const productID = req.params.productID;

    product.findOne({ productID: productID }).then(
        (product) => {
            if (product == null) {
                res.status(404).json({
                    message: "Product not found "

                })
                return
            }
            else {
                if (product.isAvailable) {
                    res.json(product)
                }
                else {
                    if (isAdmin(req)) {
                        res.json(product)
                    }
                    else {
                        res.status(403).json({
                            message: "product not available"
                        })
                    }
                }
            }

        }
    ).catch(
        (err) => {
            res.status(500).json({
                message: "Error fetching product",
                error: err.message
            })
        }
    )

}
//hello
//add try catch blocks

