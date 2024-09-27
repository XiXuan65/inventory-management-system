import { Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Product from "./components/Product";
import SalesOrder from "./components/SalesOrder";

function App() {
	const user = localStorage.getItem("token");

	return (
		<Routes>
			{user && <Route path="/" exact element={<Main />} />}
			<Route path="/signup" exact element={<Signup />} />
			<Route path="/login" exact element={<Login />} />
			<Route path="/" element={<Navigate replace to="/login" />} />
			<Route 
				path="/products" 
				element={user ? <Product /> : <Navigate to="/login" replace />} 
			/>
			<Route 
				path="/salesOrders" 
				element={user ? <SalesOrder /> : <Navigate to="/login" replace />} 
			/>
		</Routes>
	);
}

export default App;
