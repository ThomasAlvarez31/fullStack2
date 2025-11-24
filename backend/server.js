const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

// TRANSBANK
const { 
    WebpayPlus, 
    Options, 
    IntegrationApiKeys, 
    IntegrationCommerceCodes, 
    Environment 
} = require('transbank-sdk'); 

// MODELOS
const User = require('./models/User'); 
const Product = require('./models/Product'); 
const Order = require('./models/Order'); 
const Cart = require('./models/Cart'); 

const app = express();

const JWT_SECRET = 'Zr477TzUdRbesP6p';
const MONGO_URI = 'mongodb+srv://thomasjoaquinalvarez_db_user:Zr477TzUdRbesP6p@cluster0.hkxok5l.mongodb.net/?appName=Cluster0'; 
const PORT = 4000; 

// CONFIGURACIÓN
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use(express.json());

// INICIAR TRANSBANK (Entorno de Integración/Pruebas)
const tbk = new WebpayPlus.Transaction(
    new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration
    )
);

// BASE DE DATOS
mongoose.connect(MONGO_URI)
.then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
.catch(err => console.error('❌ Error de conexión a MongoDB:', err.message));

// MIDDLEWARE AUTH
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ success: false, message: 'Token requerido' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Token inválido' });
        req.user = user;
        next();
    });
};

// --- USUARIOS ---
app.post('/api/register', async (req, res) => {
    const { name, email, password, run, surname } = req.body;
    try {
        if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Correo ya registrado' });
        const hashedPassword = await bcrypt.hash(password, 10); 
        const newUser = new User({ name: name, email, password: hashedPassword, run, role: 'cliente' });
        await newUser.save(); 
        res.json({ success: true, message: 'Usuario registrado' });
    } catch (error) { res.status(500).json({ success: false, message: 'Error interno' }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }); 
        if (!user) return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        const isMatch = await bcrypt.compare(password, user.password); 
        if (isMatch) {
            const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
            res.json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
        } else { res.status(401).json({ success: false, message: 'Credenciales incorrectas' }); }
    } catch (error) { res.status(500).json({ success: false, message: 'Error de servidor' }); }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));
    } catch (error) { res.status(500).json({ message: 'Error al obtener usuarios' }); }
});

// --- EDITAR Y ELIMINAR USUARIOS (ADMIN) ---
app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { name, email, role } = req.body;
        await User.findByIdAndUpdate(req.params.id, { name, email, role });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
});
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
});

// --- PRODUCTOS ---
app.get('/api/products', async (req, res) => { 
    try { const products = await Product.find({}); return res.json(products); } 
    catch (error) { return res.status(500).json({ success: false }); }
});

app.get('/api/products/:id', async (req, res) => { 
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false });
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false });
        return res.json(product);
    } catch (error) { return res.status(500).json({ success: false }); }
});

app.post('/api/products', authenticateToken, async (req, res) => { 
    try { const newProduct = new Product(req.body); await newProduct.save(); return res.status(201).json({ success: true }); } 
    catch (error) { return res.status(500).json({ success: false }); }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => { 
    try { await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }); return res.json({ success: true }); } 
    catch (error) { return res.status(500).json({ success: false }); }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => { 
    try { await Product.findByIdAndDelete(req.params.id); return res.json({ success: true }); } 
    catch (error) { return res.status(500).json({ success: false }); }
});

// --- CARRITO ---
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ owner: req.user.id }).populate('items.product');
        if (!cart) return res.json([]); 
        const formattedCart = cart.items.filter(item => item.product).map(item => ({
            id: item.product._id, name: item.product.name, price: item.product.price, stock: item.product.stock, qty: item.qty
        }));
        return res.json(formattedCart);
    } catch (error) { return res.status(500).json({ success: false }); }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        if (!Array.isArray(req.body)) return res.json({success: true}); 
        const newItems = req.body.map(item => ({ product: item.id, qty: item.qty }));
        let cart = await Cart.findOne({ owner: req.user.id });
        if (!cart) cart = new Cart({ owner: req.user.id, items: newItems });
        else cart.items = newItems;
        await cart.save();
        return res.json({ success: true });
    } catch (error) { return res.status(500).json({ success: false }); }
});

// ==================================================================
// 🛑 ZONA DE PAGOS (AQUÍ ESTABA EL PROBLEMA)
// ==================================================================

// 1. PAGO MANUAL (Tarjeta Simulado)
app.post('/api/orders', authenticateToken, async (req, res) => {
    const { cliente, carro, total } = req.body;
    try {
        const newOrder = new Order({
            orderId: `ORD-${Date.now()}`,
            fecha: new Date(),
            cliente, productos: carro, total: Number(total),
            status: 'Pagada' 
        });
        // Descontar Stock
        for (const item of carro) {
            const product = await Product.findById(item.id);
            if (product) { product.stock = Math.max(0, product.stock - item.qty); await product.save(); }
        }
        await newOrder.save();
        await Cart.findOneAndDelete({ owner: req.user.id });
        res.json({ success: true, orderId: newOrder.orderId });
    } catch (error) { res.status(500).json({ success: false }); }
});

// 2. INICIAR TRANSACCIÓN WEBPAY (Faltaba esto)
app.post('/api/orders/create', authenticateToken, async (req, res) => {
    const { cliente, carro, total, returnUrl } = req.body;
    const buyOrder = `order-${Date.now()}`;
    const sessionId = `session-${req.user.id}-${Date.now()}`;
    const amount = Number(total);

    try {
        // 1. Crear orden pendiente
        const newOrder = new Order({
            orderId: buyOrder,
            fecha: new Date(),
            cliente, productos: carro, total: amount,
            status: 'Pendiente'
        });
        
        // 2. Pedir URL a Transbank
        const response = await tbk.create(buyOrder, sessionId, amount, returnUrl);
        
        // 3. Guardar Token y Orden
        newOrder.transbankToken = response.token;
        await newOrder.save();

        // 4. Responder al Frontend
        res.json({ success: true, url: response.url, token: response.token });
    } catch (error) {
        console.error("Error Webpay:", error);
        res.status(500).json({ success: false, message: 'Error iniciando Webpay' });
    }
});

// 3. CONFIRMACIÓN WEBPAY (Cuando vuelves de Transbank)
app.post('/api/payment/webpay-confirm', async (req, res) => {
    const { token_ws } = req.body; // Transbank envía esto por POST
    try {
        // Si el usuario canceló, token_ws puede venir raro o faltar
        if (!token_ws) return res.redirect('http://localhost:3000/confirmacion?status=cancelada');

        // Confirmar con Transbank
        const result = await tbk.commit(token_ws);
        const order = await Order.findOne({ transbankToken: token_ws });

        if (order) {
            const isPaid = result.responseCode === 0 && result.status === 'AUTHORIZED';
            order.status = isPaid ? 'Pagada' : 'Fallida';
            await order.save();

            // Descontar stock si se pagó
            if (isPaid) {
                for (const item of order.productos) {
                    const prod = await Product.findById(item.id || item.product); // Ajuste de ID
                    if (prod) { prod.stock = Math.max(0, prod.stock - item.qty); await prod.save(); }
                }
                // Borrar carrito del usuario (necesitamos buscar al usuario por la orden si es posible, o dejarlo)
                // Nota: Como es callback, no tenemos req.user aquí.
            }
            return res.redirect(`http://localhost:3000/confirmacion?status=${order.status}`);
        }
        return res.redirect('http://localhost:3000/confirmacion?status=error');
    } catch (error) {
        console.error(error);
        return res.redirect('http://localhost:3000/confirmacion?status=error');
    }
});

// 4. LISTAR ORDENES
app.get('/api/orders', async (req, res) => { 
    try {
        const orders = await Order.find().sort({ fecha: -1 });
        res.json(orders.map(o => ({
            id: o._id, fecha: o.fecha, cliente: o.cliente, productos: o.productos, total: o.total, status: o.status
        })));
    } catch (error) { res.status(500).json({ message: 'Error' }); }
});

// CREAR ADMIN (Temporal)
app.get('/api/crear-admin-secreto', async (req, res) => {
    try {
        const email = 'admin@pauperrimos.cl';
        const password = '123';
        await User.findOneAndDelete({ email });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new User({ name: 'Super Admin', email, password: hashedPassword, role: 'admin', run: '11.111.111-1' });
        await newAdmin.save();
        res.send(`<h1>Admin creado</h1>`);
    } catch (error) { res.status(500).send('Error'); }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor MongoDB corriendo en http://localhost:${PORT}`);
});