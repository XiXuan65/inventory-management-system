const router = require("express").Router();
const { Product, validateProduct } = require("../models/product");

router.post('/', async (req, res) => {
    // Validate product details
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    try {
        // Check for duplicate product name
        const existingProduct = await Product.findOne({ name: req.body.name });
        if (existingProduct) {
            return res.status(409).send({ message: 'Product with the same name already exists.' });
        }

        // Create and save the new product
        const product = new Product(req.body);
        await product.save();
        res.status(201).send({ product, message: 'Product added successfully!' });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send({ message: 'Internal server error.' });
    }
});

router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).send(products);
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { error } = validateProduct(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        const existingProduct = await Product.findOne({ name: req.body.name, _id: { $ne: req.params.id } });
        if (existingProduct) {
            return res.status(409).send({ message: "Product with the same name already exists." });
        }

        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).send({ message: "Product not found" });

        res.status(200).send({ message: "Product updated successfully", product });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).send({ message: "Product not found" });

        res.status(200).send({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

router.post('/upload', async (req, res) => {
    const { content } = req.body;

    // Check if content is provided
    if (!content) return res.status(400).send({ message: 'File content is missing.' });

    // Split content into individual product entries
    const productsData = content.split(';').filter(p => p.trim() !== '');

    const newProducts = [];
    const errors = [];

    for (let productData of productsData) {
        // Extract product details using regex
        const nameMatch = productData.match(/name:\s*(.+)/);
        const quantityMatch = productData.match(/quantity:\s*(\d+)/);
        const priceMatch = productData.match(/price:\s*(\d+(\.\d{1,2})?)/);

        if (!nameMatch || !quantityMatch || !priceMatch) {
            errors.push('Invalid product format. Please ensure the file follows the correct format.');
            continue;
        }

        const name = nameMatch[1].trim();
        const quantity = parseInt(quantityMatch[1]);
        const price = parseFloat(priceMatch[1]);

        // Check for duplicate product name
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            errors.push(`Product with name "${name}" already exists.`);
            continue;
        }

        // Create new product
        const product = new Product({ name, quantity, price });
        try {
            await product.save();
            newProducts.push(product);
        } catch (err) {
            errors.push(`Failed to add product: ${name}`);
        }
    }

    if (errors.length > 0) {
        return res.status(400).send({ message: errors.join(' ') });
    }

    res.status(201).send({ message: 'Products added successfully!', newProducts });
});

module.exports = router;
