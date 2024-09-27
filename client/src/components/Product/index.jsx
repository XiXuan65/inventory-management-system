import { useState, useEffect, useRef  } from "react";
import { Link } from "react-router-dom"; 
import axios from "axios";
import styles from "./styles.module.css";

const Product = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: "", quantity: 0, price: 0 });
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [sortField, setSortField] = useState("");
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [quantityThreshold, setQuantityThreshold] = useState(0);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const fileInputRef = useRef(null); 

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get("http://localhost:8080/api/products");
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
    
            try {
              
                const { data } = await axios.post('http://localhost:8080/api/products/upload', { content });
                showSuccess(data.message);
                setProducts([...products, ...data.newProducts]); 
            } catch (error) {
                showError(error.response ? error.response.data.message : "Failed to process file.");
            } finally {
                fetchProducts();
              
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.readAsText(file);
    };
    
    
    const handleChange = ({ target: input }) => {
        setNewProduct({ ...newProduct, [input.name]: input.value });
    };

    const handleSearchChange = ({ target: input }) => {
        setSearch(input.value);
    };

    const handleSortChange = (field) => {
        setSortField(field);
    };

    const handlePriceRangeChange = ({ target: input }) => {
        const range = [...priceRange];
        range[input.name === 'min' ? 0 : 1] = input.value === '' ? '' : Number(input.value);
        setPriceRange(range);
    };
    

    const handleQuantityChange = ({ target: input }) => {
        setQuantityThreshold(input.value === '' ? '' : Number(input.value));
    };

    const handleAddProduct = async () => {
        try {
            const { data } = await axios.post("http://localhost:8080/api/products", newProduct);
            setProducts([...products, data.product]);
            resetForm();
            setShowModal(false);
            showSuccess(data.message); 
        } catch (error) {
            if (error.response && error.response.status === 409) {
                showError("Product with the same name already exists.");
            } else {
                showError("Failed to add product.");
            }
        }
    };

    const handleEditProduct = async () => {
        try {
            const { data } = await axios.put(`http://localhost:8080/api/products/${currentProductId}`, newProduct);
            setProducts(products.map(product => (product._id === currentProductId ? data.product : product)));
            resetForm();
            setShowModal(false);
            showSuccess("Product updated successfully!");
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    showError(error.response.data.message);
                } else if (error.response.status === 409) {
                    showError("Product with the same name already exists.");
                } else {
                    showError("Failed to edit product.");
                }
            } else {
                showError("An error occurred while editing the product.");
            }
        }
    };
    
    const handleDeleteProduct = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/products/${id}`);
            setProducts(products.filter((product) => product._id !== id));
            showSuccess("Product deleted successfully!");
        } catch (error) {
            showError("Failed to delete product.");
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(""), 6000);
    };

    const showError = (message) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(""), 6000); 
    };

    const openAddModal = () => {
        resetForm();
        setIsEditing(false);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setNewProduct({ name: product.name, quantity: product.quantity, price: product.price });
        setCurrentProductId(product._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setNewProduct({ name: "", quantity: 0, price: 0 });
        setCurrentProductId(null);
    };

    // Filter and sort the products
    const filteredAndSortedProducts = products
        .filter(product => 
            product.name.toLowerCase().includes(search.toLowerCase()) &&
            product.price >= priceRange[0] && 
            product.price <= priceRange[1] &&
            product.quantity >= quantityThreshold
        )
        .sort((a, b) => {
            if (sortField === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortField === 'price') {
                return a.price - b.price;
            } else if (sortField === 'quantity') {
                return a.quantity - b.quantity;
            }
            return 0;
        });

    return (
        <div className={styles.product_management_container}>
            <div className={styles.back_link}>
            <Link to="/" className={styles.nav_link}>
                &larr; Back to Main Page
            </Link>
            </div>
            <h1>Product Management</h1>

            {successMessage && (
                <div className={styles.success_popup}>{successMessage}</div>
            )}
            {errorMessage && (
                <div className={styles.error_popup}>{errorMessage}</div>
            )}

            <div className={styles.actions_container}>
             
                <input
                    type="text"
                    placeholder="Search Product"
                    value={search}
                    onChange={handleSearchChange}
                    className={styles.search_input}
                />
                   <div className={styles.file_upload_container}>
                        <label className={styles.file_label}>Add Product by TxtFile:</label>
                        <input
                            type="file"
                            accept=".txt"
                            onChange={handleFileUpload}
                            ref={fileInputRef} 
                            className={styles.file_input}
                        />
                </div>
                <button onClick={openAddModal} className={styles.add_btn}>Add Product</button>
            </div>

            <div className={styles.filters_container}>
                <div>
                    <label>Sort by:</label>
                    <select onChange={(e) => handleSortChange(e.target.value)} className={styles.filter_input}>
                        <option value="">None</option>
                        <option value="name">Name</option>
                        <option value="price">Price</option>
                        <option value="quantity">Quantity</option>
                    </select>
                </div>
                <div>
                    <label>Price Range:</label>
                    <input
                        type="number"
                        name="min"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={handlePriceRangeChange}
                        className={styles.filter_input}
                    />
                    <input
                        type="number"
                        name="max"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={handlePriceRangeChange}
                        className={styles.filter_input}
                    />
                </div>
                <div>
                    <label>Quantity:</label>
                    <input
                        type="number"
                        placeholder="Min Quantity"
                        value={quantityThreshold}
                        onChange={handleQuantityChange}
                        className={styles.filter_input}
                    />
                </div>
            </div>

            <table className={styles.product_table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAndSortedProducts.map((product, index) => (
                        <tr key={product._id}>
                            <td>{index + 1}</td>
                            <td>{product.name}</td>
                            <td>{product.quantity}</td>
                            <td>${product.price.toFixed(2)}</td>
                            <td className={styles.actions}>
                                <button onClick={() => openEditModal(product)} className={styles.edit_btn}>Edit</button>
                                <button 
                                    onClick={() => handleDeleteProduct(product._id)} 
                                    className={styles.delete_btn}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className={styles.modal}>
                    <div className={styles.modal_content}>
                        <span className={styles.close} onClick={() => setShowModal(false)}>&times;</span>
                        <h2>{isEditing ? "Edit Product" : "Add Product"}</h2>
                        <div className={styles.form_group}>
                            <label>Product Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter product name"
                                value={newProduct.name}
                                onChange={handleChange}
                                className={styles.modal_input}
                            />
                        </div>
                        <div className={styles.form_group}>
                            <label>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                placeholder="Enter quantity"
                                value={newProduct.quantity}
                                onChange={handleChange}
                                className={styles.modal_input}
                            />
                        </div>
                        <div className={styles.form_group}>
                            <label>Price</label>
                            <input
                                type="number"
                                name="price"
                                placeholder="Enter price"
                                value={newProduct.price}
                                onChange={handleChange}
                                className={styles.modal_input}
                            />
                        </div>
                        <button onClick={isEditing ? handleEditProduct : handleAddProduct} className={styles.modal_add_btn}>
                            {isEditing ? "Update Product" : "Add Product"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Product;
