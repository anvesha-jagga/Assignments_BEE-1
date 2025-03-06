const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PRODUCTS_FILE = "./data/products.json";
const REVIEWS_FILE = "./data/reviews.json";

// Auto-incrementing ID counters
let nextProductId = 1;
let nextReviewId = 1;

// Read JSON file
const readData = (file) => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, "[]"); // Create file if not exists
    }
    return JSON.parse(fs.readFileSync(file, "utf-8"));
};

// Write JSON file
const writeData = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to file:", error);
    }
};

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

// Create a new product
app.post("/products", (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ error: "Name and description are required" });
    }

    const products = readData(PRODUCTS_FILE);
    const newProduct = {
        id: nextProductId++, // Use incrementing numeric ID
        name,
        description,
        averageRating: 0,
    };

    products.push(newProduct);
    writeData(PRODUCTS_FILE, products);
    res.status(201).json(newProduct);
});

// Get all products (sorted by rating if specified)
app.get("/products", (req, res) => {
    const { sortBy } = req.query;
    let products = readData(PRODUCTS_FILE);

    if (sortBy === "rating") {
        products.sort((a, b) => b.averageRating - a.averageRating);
    }

    res.json(products);
});

// Get a product by ID along with reviews
app.get("/products/:id", (req, res) => {
    const { id } = req.params;
    const products = readData(PRODUCTS_FILE);
    const product = products.find(p => p.id === parseInt(id));

    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    const reviews = readData(REVIEWS_FILE).filter(r => r.productId === parseInt(id));
    res.json({ ...product, reviews });
});

// Add a review for a product
app.post("/reviews", (req, res) => {
    const { productId, rating, message } = req.body;
    if (!productId || rating == null || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const products = readData(PRODUCTS_FILE);
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    const reviews = readData(REVIEWS_FILE);
    const newReview = {
        id: nextReviewId++, // Use incrementing numeric ID
        productId: parseInt(productId),
        timestamp: new Date().toISOString(),
        rating,
        message,
    };

    reviews.push(newReview);
    writeData(REVIEWS_FILE, reviews);

    // Update product's average rating
    const productReviews = reviews.filter(r => r.productId === parseInt(productId));
    product.averageRating =
        productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

    writeData(PRODUCTS_FILE, products);
    res.status(201).json(newReview);
});

// Get all reviews (sorted by latest)
app.get("/reviews", (req, res) => {
    const reviews = readData(REVIEWS_FILE);
    reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(reviews);
});
