require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const products = require("./routes/products");
const salesOrders = require("./routes/salesOrders");

// database connection
connection();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", products);
app.use("/api/salesOrders", salesOrders);

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));
