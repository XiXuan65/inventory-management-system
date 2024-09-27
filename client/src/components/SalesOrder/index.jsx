import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import axios from "axios";
import styles from "./styles.module.css";

const SalesOrder = () => {
    const [products, setProducts] = useState([]);
    const [salesOrders, setSalesOrders] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [sellingPrice, setSellingPrice] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState(""); 

    useEffect(() => {
        fetchProducts();
        fetchSalesOrders();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get("http://localhost:8080/api/products");
            setProducts(data.filter(product => product.quantity > 0));
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchSalesOrders = async () => {
        try {
            const { data } = await axios.get("http://localhost:8080/api/salesOrders");
            setSalesOrders(data);
        } catch (error) {
            console.error("Error fetching sales orders:", error);
        }
    };

    const handleAddSalesOrder = async () => {
        try {
            if (!selectedProduct || quantity <= 0 || sellingPrice <= 0) {
                setErrorMessage("Please select a product, enter a valid quantity, and selling price.");
                return;
            }
    
            const product = products.find(p => p._id === selectedProduct);
            if (!product) return;
    
            await axios.post("http://localhost:8080/api/salesOrders", {
                productId: selectedProduct,
                quantity,
                sellingPrice,
            });
    
            fetchProducts();
            fetchSalesOrders();
            setShowModal(false);
            resetForm();
            setErrorMessage(""); 
            setSuccessMessage("Sales order added successfully!"); 

            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error creating sales order:", error);
            setErrorMessage(error.response?.data?.message || "An error occurred while creating the sales order.");

            setTimeout(() => setErrorMessage(""), 3000);
        }
    };
    
    const resetForm = () => {
        setSelectedProduct("");
        setQuantity(0);
        setSellingPrice(0);
    };

    return (
        <div className={styles.sales_order_management_container}>
            <div className={styles.back_link}>
                <Link to="/" className={styles.nav_link}>
                    &larr; Back to Main Page
                </Link>
            </div>
            <h1>Sales Order Management</h1>
            {successMessage && <div className={styles.success_message}>{successMessage}</div>}
            {errorMessage && <div className={styles.error_message}>{errorMessage}</div>}

            <button onClick={() => setShowModal(true)} className={styles.add_btn}>Create Sales Order</button>
            
            {showModal && (
                <div className={styles.modal}>
                    <div className={styles.modal_content}>
                        <span className={styles.close} onClick={() => setShowModal(false)}>&times;</span>
                        <h2>Create Sales Order</h2>
                        <div className={styles.form_group}>
                            <label>Select Product</label>
                            <select
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className={styles.modal_input}
                                value={selectedProduct}
                            >
                                <option value="">Select Product</option>
                                {products.map((product) => (
                                    <option key={product._id} value={product._id}>
                                        {product.name} (Available: {product.quantity})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.form_group}>
                            <label>Quantity</label>
                            <input
                                type="number"
                                placeholder="Enter quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                                className={styles.modal_input}
                            />
                        </div>
                        <div className={styles.form_group}>
                            <label>Selling Price</label>
                            <input
                                type="number"
                                placeholder="Enter selling price"
                                value={sellingPrice}
                                onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className={styles.modal_input}
                            />
                        </div>
                        <button onClick={handleAddSalesOrder} className={styles.modal_add_btn}>Add Sales Order</button>
                    </div>
                </div>
            )}

            <h2>Sales Orders</h2>
            <table className={styles.sales_order_table}>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Selling Price</th>
                        <th>Order Date</th>
                    </tr>
                </thead>
                <tbody>
                    {salesOrders.map((order) => (
                        <tr key={order._id}>
                            <td>{order.productName}</td>
                            <td>{order.quantity}</td>
                            <td>${order.sellingPrice.toFixed(2)}</td>
                            <td>{new Date(order.orderDate).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SalesOrder;
