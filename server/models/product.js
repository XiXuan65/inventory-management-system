const mongoose = require("mongoose");
const Joi = require("joi");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const Product = mongoose.model("Product", productSchema);

const validateProduct = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().label("Product Name"),
        quantity: Joi.number().integer().min(0).required().label("Quantity"),
        price: Joi.number().min(0).required().label("Price"),
    });
    return schema.validate(data);
};

module.exports = { Product, validateProduct };
