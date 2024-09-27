import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./styles.module.css";

const Main = () => {
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const productsResponse = await axios.get("http://localhost:8080/api/products");
            setTotalProducts(productsResponse.data.length);

            const salesResponse = await axios.get("http://localhost:8080/api/salesOrders");
            setTotalSales(salesResponse.data.length);

            const revenue = salesResponse.data.reduce((sum, order) => sum + order.sellingPrice * order.quantity, 0);
            setTotalRevenue(revenue);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    return (
        <div className={styles.main_container}>
            <nav className={styles.navbar}>
                <h1>Inventory Management System</h1>
                <div className={styles.nav_links}>
                    <Link to="/" className={styles.nav_link}>
                        Dashboard
                    </Link>
                    <Link to="/products" className={styles.nav_link}>
                        Products
                    </Link>
                    <Link to="/salesOrders" className={styles.nav_link}>
                        Sales
                    </Link>
                    <button className={styles.white_btn} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Dashboard Section */}
            <div className={styles.dashboard}>
                <h2>Dashboard</h2>
                <div className={styles.dashboard_cards}>
                    <div className={styles.dashboard_card}>
                        <h3>Total Products</h3>
                        <p>{totalProducts}</p>
                    </div>
                    <div className={styles.dashboard_card}>
                        <h3>Total Sales</h3>
                        <p>{totalSales}</p>
                    </div>
                    <div className={styles.dashboard_card}>
                        <h3>Total Revenue</h3>
                        <p>${totalRevenue.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;
