import e from "express";
import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createOrder(req, res) {
    if (req.user == null) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }

    try {
        const latestOrder = await Order.findOne().sort({ date: -1 })
        let orderId = "ORD00001"

        if (latestOrder !== null) {
            let latestOrderId = latestOrder.orderId // "ORD00015"
            let latestOrderNumberString = latestOrderId.replace("ORD", "") // "00015"
            let latestOrderNumber = parseInt(latestOrderNumberString) // 15
            let newOrderNumber = latestOrderNumber + 1 // 16
            let newOrderNumberString = newOrderNumber.toString().padStart(6, "0") // "00016"
            orderId = "ORD" + newOrderNumberString // "ORD00016"
        }

        const items = []
        let totalAmount = 0

        for (let i = 0; i < req.body.items.length; i++) {
            const product = await Product.findOne({ productID: req.body.items[i].productID })

            if (product == null) {
                return res.status(400).json({ message: "Product not found: " + req.body.items[i].productID })
            }

            items.push({
                productID: product.productID,
                name: product.pName,
                price: product.price,
                quantity: req.body.items[i].quantity,
                image: product.images[0]
            })

            totalAmount += product.price * req.body.items[i].quantity
        }


        const newOrder = new Order({
            orderId: orderId,
            email: req.user.email,
            name: req.body.name,
            address: req.body.address,
            total: totalAmount,
            items: items,
            userID: req.user.userID,
            phoneNumber: req.body.phoneNumber
        });
        { console.log(req.body) }
        await newOrder.save();
        return res.status(201).json({
            message: "Order created successfully",
            orderId: orderId
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function getOrders(req, res) {

    if (req.user == null) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }

    if (isAdmin(req)) {

        const orders = await Order.find().sort({ date: -1 })
        res.json(orders)
        console.log(orders)
    }
    else {
        const orders = await Order.find({ email: req.user.email }).sort({ date: -1 })
        res.json(orders)
    }
}