const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

const DB_FILE = './db.json';

const readData = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return { products: [], users: [], cart: [], blogs: [], orders: [] };
    }
};

const writeData = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

app.get('/', (req, res) => {
    res.send('API de Pauperrimos funcionando 🚀');
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const db = readData();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
});

app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    const db = readData();
    
    if (db.users.some(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: 'cliente'
    };
    db.users.push(newUser);
    writeData(db);
    res.json({ success: true, message: 'Usuario registrado' });
});

app.get('/api/products', (req, res) => {
    const db = readData();
    res.json(db.products);
});

app.get('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const db = readData();
    const product = db.products.find(p => p.id === id);
    if (product) res.json(product);
    else res.status(404).json({ message: 'Producto no encontrado' });
});

app.post('/api/products', (req, res) => {
    const db = readData();
    const newProduct = { id: Date.now(), ...req.body };
    db.products.push(newProduct);
    writeData(db);
    res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const db = readData();
    const index = db.products.findIndex(p => p.id === id);
    if (index !== -1) {
        db.products[index] = { ...db.products[index], ...req.body };
        writeData(db);
        res.json(db.products[index]);
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const db = readData();
    const initialLength = db.products.length;
    db.products = db.products.filter(p => p.id !== id);
    writeData(db);
    if (db.products.length < initialLength) res.json({ success: true });
    else res.status(404).json({ message: 'No encontrado' });
});

app.get('/api/users', (req, res) => {
    const db = readData();
    res.json(db.users);
});

app.post('/api/users/create', (req, res) => {
    const db = readData();
    const newUser = { id: Date.now(), ...req.body, role: 'cliente' };
    db.users.push(newUser);
    writeData(db);
    res.json(newUser);
});

app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const db = readData();
    db.users = db.users.filter(u => u.id !== id);
    writeData(db);
    res.json({ success: true });
});

app.get('/api/cart', (req, res) => {
    const db = readData();
    res.json(db.cart);
});

app.post('/api/cart', (req, res) => {
    const db = readData();
    db.cart = req.body;
    writeData(db);
    res.json({ success: true });
});

app.get('/api/blogs', (req, res) => {
    const db = readData();
    res.json(db.blogs);
});

app.get('/api/blogs/:slug', (req, res) => {
    const db = readData();
    const blog = db.blogs.find(b => b.slug === req.params.slug);
    if (blog) res.json(blog);
    else res.status(404).json({ message: 'Blog no encontrado' });
});

app.post('/api/contact', (req, res) => {
    console.log('Mensaje recibido:', req.body);
    res.json({ success: true, message: 'Mensaje enviado correctamente' });
});

app.post('/api/orders', (req, res) => {
    const db = readData();
    const { cliente, carro, total } = req.body;

    if (!db.orders) db.orders = [];
    const newOrder = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        cliente,
        productos: carro,
        total
    };
    db.orders.push(newOrder);

    carro.forEach(item => {
        const productIndex = db.products.findIndex(p => p.id === item.id);
        if (productIndex !== -1) {
            let nuevoStock = db.products[productIndex].stock - item.qty;
            if (nuevoStock < 0) nuevoStock = 0;
            db.products[productIndex].stock = nuevoStock;
        }
    });

    db.cart = [];

    writeData(db);
    res.json({ success: true, orderId: newOrder.id });
});

app.get('/api/orders', (req, res) => {
    const db = readData();
    res.json(db.orders || []);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
    console.log(`¡Listo para recibir peticiones de React!`);
});