const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

// IMPORTACIONES TRANSBANK
const { 
    WebpayPlus, 
    Options, 
    IntegrationApiKeys, 
    IntegrationCommerceCodes, 
    Environment 
} = require('transbank-sdk'); 

// 🛑 IMPORTAR TODOS LOS MODELOS
const User = require('./models/User'); 
const Product = require('./models/Product'); 
const Order = require('./models/Order'); 
const Cart = require('./models/Cart'); // 🛑 Nuevo modelo de Carrito

const app = express();

// CONFIGURACIÓN DE SEGURIDAD Y CONEXIÓN
const JWT_SECRET = 'Zr477TzUdRbesP6p';
// 🛑 CRÍTICO: Asegúrate que esta URI sea la correcta y que tu IP esté en Atlas.
const MONGO_URI = 'mongodb+srv://thomasjoaquinalvarez_db_user:Zr477TzUdRbesP6p@cluster0.hkxok5l.mongodb.net/?appName=Cluster0'; 
const PORT = 4000; // Puerto del Backend

// 🛑 CORRECCIÓN: Configuración explícita de CORS para el Frontend (http://localhost:3000)
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use(express.json());

// CONFIGURACIÓN DEL CLIENTE TRANSBANK
const tbk = new WebpayPlus.Transaction(
    new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration
    )
);

// ------------------------------------------------------------------
// --- CONEXIÓN A MONGODB ---
// ------------------------------------------------------------------

mongoose.connect(MONGO_URI)
.then(() => console.log('Conexión exitosa a MongoDB Atlas'))
.catch(err => console.error('Error de conexión a MongoDB:', err.message));


// ------------------------------------------------------------------
// --- MIDDLEWARE DE AUTENTICACIÓN ---
// ------------------------------------------------------------------

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ success: false, message: 'Token requerido para esta operación' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
        req.user = user;
        next();
    });
};

// ------------------------------------------------------------------
// --- ENDPOINTS DE AUTENTICACIÓN Y PRODUCTOS (Se mantiene sin cambios importantes) ---
// ------------------------------------------------------------------

// [ ... Rutas de Registro y Login (sin cambios) ... ]

app.post('/api/register', async (req, res) => {
    const { name, email, password, run, surname } = req.body;
    try {
        if (await User.findOne({ email })) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
        }
        const hashedPassword = await bcrypt.hash(password, 10); 
        const newUser = new User({ 
            name: name + ' ' + surname, 
            email,
            password: hashedPassword,
            run,
            role: 'cliente'
        });
        await newUser.save(); 
        res.json({ success: true, message: 'Usuario registrado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error interno en el servidor' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }); 
        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
        const isMatch = await bcrypt.compare(password, user.password); 
        if (isMatch) {
            const token = jwt.sign(
                { id: user._id, role: user.role }, 
                JWT_SECRET, 
                { expiresIn: '1h' }
            );
            res.json({ 
                success: true, 
                token: token, 
                user: { id: user._id, name: user.name, role: user.role } 
            });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error de servidor' });
    }
});

// ------------------------------------------------------------------
// --- ENDPOINTS DE PRODUCTOS (Corrección CastError) ---
// ------------------------------------------------------------------

app.get('/api/products', async (req, res) => { 
    try {
        const products = await Product.find({}); 
        return res.json(products); 
    } catch (error) {
        console.error("Error al obtener productos:", error);
        return res.status(500).json({ success: false, message: 'Error al obtener productos.' });
    }
});

// 🛑 CORRECCIÓN DE CastError
app.get('/api/products/:id', async (req, res) => { 
    try {
        const id = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            // El ID no es un ObjectId válido, esto es lo que causaba el error si se enviaba "undefined"
            return res.status(400).json({ success: false, message: 'ID de producto inválido o no encontrado.' });
        }

        const product = await Product.findById(id);
        
        if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        return res.json(product);
    } catch (error) {
        console.error("Error al obtener producto por ID:", error);
        // El error puede ser un CastError, pero la validación de arriba lo debería mitigar
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// [ ... Otras Rutas de Producto/Usuarios (sin cambios importantes) ... ]

app.post('/api/products', authenticateToken, async (req, res) => { 
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        return res.status(201).json({ success: true, message: 'Producto creado', product: newProduct });
    } catch (error) {
        console.error("Error al crear producto:", error);
        return res.status(500).json({ success: false, message: 'Error al crear producto.' });
    }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => { 
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        return res.json({ success: true, message: 'Producto actualizado', product });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        return res.status(500).json({ success: false, message: 'Error al actualizar producto.' });
    }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => { 
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        return res.json({ success: true, message: 'Producto eliminado' });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        return res.status(500).json({ success: false, message: 'Error al eliminar producto.' });
    }
});


// ------------------------------------------------------------------
// --- ENDPOINTS DE CARRITO (IMPLEMENTACIÓN FINAL) ---
// ------------------------------------------------------------------

// 🛑 IMPLEMENTACIÓN: GET /api/cart - Obtener el carrito del usuario logueado
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Buscar el carrito y popular los datos del producto (para tener nombre, precio, stock, etc.)
        // Si no se encuentra, findOne devolverá null.
        const cart = await Cart.findOne({ owner: userId }).populate('items.product');
        
        if (!cart) {
            // Si el usuario no tiene carrito, devolvemos un array vacío.
            return res.json([]); 
        }

        // Formatea la respuesta para que el Frontend la entienda fácilmente
        // Debe ser un array de objetos con el id (que es el _id del producto) y la cantidad (qty)
        const formattedCart = cart.items
            // Filtramos items cuyo producto haya sido eliminado de la DB (product es null)
            .filter(item => item.product) 
            .map(item => ({
                // CRÍTICO: Enviamos el _id del producto como 'id' (lo que espera el Frontend)
                id: item.product._id, 
                name: item.product.name,
                price: item.product.price,
                stock: item.product.stock,
                qty: item.qty
            }));

        return res.json(formattedCart);

    } catch (error) {
        console.error("Error al obtener carrito:", error);
        return res.status(500).json({ success: false, message: 'Error al obtener carrito' });
    }
});

// 🛑 IMPLEMENTACIÓN: POST /api/cart - Guardar o actualizar el carrito
app.post('/api/cart', authenticateToken, async (req, res) => {
    // El Frontend envía el array de items: [{ id: 'mongodb_id', qty: 1 }, ...]
    const itemsFromFrontend = req.body; 
    const userId = req.user.id;

    try {
        // Mapear los items del Front al formato de la DB (cambiar 'id' por 'product')
        const newItems = itemsFromFrontend.map(item => ({
            product: item.id, // El 'id' del Front es el _id del producto en la DB
            qty: item.qty
        }));

        // Buscar y actualizar o crear el carrito
        let cart = await Cart.findOne({ owner: userId });

        if (!cart) {
            // Crear nuevo carrito si no existe
            cart = new Cart({ owner: userId, items: newItems });
        } else {
            // Actualizar carrito existente
            cart.items = newItems;
        }

        await cart.save();
        return res.json({ success: true, message: 'Carrito actualizado' });

    } catch (error) {
        console.error("Error al actualizar carrito:", error);
        return res.status(500).json({ success: false, message: 'Error al actualizar carrito' });
    }
});

// ------------------------------------------------------------------
// --- ENDPOINTS DE ORDENES Y PAGO (Sin cambios) ---
// ------------------------------------------------------------------

app.post('/api/orders/create', authenticateToken, async (req, res) => {
    const { cliente, carro, total, returnUrl } = req.body;
    
    // Generar datos únicos para Transbank
    const buyOrder = `order-${Date.now()}`;
    const sessionId = `session-${req.user.id}-${Date.now()}`;
    const amount = Number(total);

    try {
        // 1. Crear la Orden en MongoDB (Estado Pendiente)
        const newOrder = new Order({
            orderId: buyOrder,
            cliente,
            productos: carro,
            total: amount,
            status: 'Pendiente' 
        });
        await newOrder.save();

        // 2. Crear transacción con Webpay 
        const response = await tbk.create(buyOrder, sessionId, amount, returnUrl);

        // 3. Guardar el Token de Transbank en la Orden 
        newOrder.transbankToken = response.token;
        await newOrder.save();
        
        // 4. Enviar URL de pago al frontend 
        res.json({ 
            success: true, 
            url: response.url, 
            token: response.token, 
            orderId: newOrder.orderId 
        });

    } catch (error) {
        console.error("Error al crear transacción:", error);
        res.status(500).json({ success: false, message: 'Error al iniciar pago con Transbank' });
    }
});

app.post('/api/payment/webpay-confirm', async (req, res) => {
    const { token_ws } = req.body; 

    if (!token_ws) {
        // Manejo de cancelación o token faltante
    }

    try {
        // 1. Confirmar la Transacción 
        const result = await tbk.commit(token_ws);

        // 2. Buscar la Orden por el token 
        const order = await Order.findOne({ transbankToken: token_ws });

        if (order) {
            // 3. Actualizar el estado 
            const isPaid = result.responseCode === 0 && result.status === 'AUTHORIZED';
            
            order.status = isPaid ? 'Pagada' : 'Fallida';
            order.responseTransbank = result; 
            await order.save();
        }
        
        // Redirige al cliente al Frontend de React (puerto 3000)
        const status = order ? order.status : 'Fallida';
        const code = result ? result.responseCode : 'N/A';
        const redirectUrl = `http://localhost:3000/confirmacion?status=${status}&code=${code}`;
        
        return res.redirect(302, redirectUrl); 

    } catch (error) {
        console.error("Transbank Commit Error:", error);
        // Fallback de redirección en caso de error de servidor
        return res.redirect(302, `http://localhost:3000/confirmacion?status=error`);
    }
});

app.get('/api/orders', authenticateToken, async (req, res) => { 
    try {
        const orders = await Order.find().sort({ fecha: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener órdenes' });
    }
});

// ------------------------------------------------------------------
// --- INICIO DEL SERVIDOR ---
// ------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
    console.log(`¡Listo para recibir peticiones de React!`);
});