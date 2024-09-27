const express = require('express');
const router = express.Router();
const SalesOrder = require('../models/salesOrder');
const { Product } = require('../models/product');

router.post('/', async (req, res) => {
    try {
        const { productId, quantity, sellingPrice } = req.body;

        // Fetch the product to check quantity
        const product = await Product.findById(productId); 
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }

        if (product.quantity < quantity) {
            return res.status(400).send({ message: 'Insufficient product quantity' });
        }

        // Create the sales order
        const salesOrder = new SalesOrder({
            productId,
            productName: product.name,
            quantity,
            sellingPrice,
        });
        await salesOrder.save();

        // Update the product quantity
        product.quantity -= quantity;
        await product.save();

        res.status(201).send({ message: 'Sales order created successfully', salesOrder });
    } catch (error) {
        console.error('Error creating sales order:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Get all sales orders
router.get('/', async (req, res) => {
    try {
        const salesOrders = await SalesOrder.find().sort({ createdAt: -1 });
        res.status(200).send(salesOrders);
    } catch (error) {
        console.error('Error fetching sales orders:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

module.exports = router;
