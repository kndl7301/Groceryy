const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // ✅ Add this line
const { Schema } = mongoose;
const path = require('path');
const app = express();

// Middleware
app.use(express.json());

app.use(express.json()); // IMPORTANT

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// MongoDB Atlas connection
const mongoURI = "mongodb+srv://kendalyuce7301:2019556070@cluster0.r284f.mongodb.net/grocery?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ Error connecting to MongoDB Atlas', err));

// === Schemas and Models ===
const categorySchema = new Schema({
  category_name: { type: String, required: true },
  image: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});
const Category = mongoose.model('categories', categorySchema);

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
});
const Product = mongoose.model('products', productSchema);

const messageSchema = new Schema({
  username: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const Message = mongoose.model('messages', messageSchema);

const userSchema = new Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  password: String
});
const User = mongoose.model('users', userSchema);

const orderSchema = new Schema({
  orderid: { type: Number, required: true },
  username: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  orderdate: { type: Date, default: Date.now },
  orderamount: { type: Number, required: true },
  email: { type: String, required: true } ,
  status: { type: String, required: true } 
});
const Order = mongoose.model('orders', orderSchema);




// === Routes ===

app.use('/api/auth', require('./routes/auth'));

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        name: user.name, // Make sure your schema has this field
        email: user.email,
        address:user.address,
        phone:user.phone,
       
        // Add other fields if needed
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories', error: err });
  }
});

// ADD category
app.post('/api/categories', async (req, res) => {
  const { category_name, image } = req.body;
  if (!category_name || !image) {
    return res.status(400).json({ message: 'Category name and image are required' });
  }
  try {
    const newCategory = new Category({ category_name, image });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ message: 'Error creating category', error: err });
  }
});

// Update category status
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || (status !== 'active' && status !== 'inactive')) {
    return res.status(400).json({ message: 'Invalid status value. Must be "active" or "inactive".' });
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category status updated successfully', category: updatedCategory });
  } catch (err) {
    res.status(500).json({ message: 'Error updating category status', error: err });
  }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category', error: err });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  const category = req.query.category;
  try {
    const query = category ? { category: category.replace(/-/g, ' ') } : {};
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err });
  }
});

// Add product
app.post('/api/products', (req, res) => {
  const { name, category_name, image, stock, price } = req.body;

  if (!name || !category_name || !image || !stock || !price) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (isNaN(stock) || isNaN(price)) {
    return res.status(400).json({ message: 'Stock and price must be valid numbers.' });
  }

  const newProduct = new Product({
    name,
    price,
    image,
    category: category_name,
    stock,
  });

  newProduct
    .save()
    .then((product) => res.status(201).json(product))
    .catch((err) => res.status(500).json({ message: 'Failed to save product', error: err }));
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Get users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err });
  }
});

// Get orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ _id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err });
  }
});

// Post Order
app.post('/api/orders', async (req, res) => {
  const { orderId, userName, email,phone, orderDate, orderAmount, address, status } = req.body;

  if (!orderId || !userName || !email || !phone || !orderDate || !orderAmount || !address || !status) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const newOrder = new Order({
    orderid: orderId,
    username: userName,
    email,
    phone,
    orderdate: orderDate,
    orderamount: orderAmount,
    address,
    status
  });

  try {
    await newOrder.save();
    res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});


//update the orders delivered status

app.put('/api/orders/:id', async (req, res) => {
  const { status } = req.body;
  console.log("Updating order", req.params.id, "with status", status);
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order updated" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Fix the orders by user route
app.get('/api/orders/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);
    const orders = await Order.find({ email: decodedEmail }).sort({ orderdate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user orders', error: err });
  }
});

// ✅ Register route
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, phone, address });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Registration error:', err); // Debug log
    res.status(500).json({ message: 'Server error' });
  }
});


// Get messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ _id: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages', error: err });
  }
});


/// sen dmessage to admin

app.post('/api/messages', async (req, res) => {
  try {
    const { username, email, message, message_created_date } = req.body;
    const newMessage = new Message({ username, email, message, message_created_date });
    await newMessage.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ success: false });
  }
});

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
