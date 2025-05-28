import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'; // Make sure the path is correct
import Login from './pages/Login'; // Same for Login page
import Home from './pages/Homepage';
import CategoryPage from  './pages/CategoryPage'
import AdminPanel from './pages/AdminPanel'
import AddCategory from './pages/AddCategory'
import Categories from './pages/Categories'
import Products from './pages/Products'
import AddProduct from './pages/AddProduct'
import Messages from './pages/Messages'
import Users from './pages/Users'
import Orders from './pages/Orders'
import MyOrders from './pages/MyOrders'
import ContactUs from './pages/ContactUs'
import AboutUs from './pages/AboutUs'

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/AdminPanel" element={<AdminPanel />} />
        <Route path="/addcategory" element={<AddCategory />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/products" element={<Products />} />
        <Route path="/addproduct" element={<AddProduct />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/users" element={<Users />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        

      </Routes>
    </Router>
  );
}

export default App;
