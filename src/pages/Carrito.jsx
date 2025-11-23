import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Función auxiliar para obtener el token JWT (debe existir en tu app)
const getToken = () => localStorage.getItem('token'); 

export default function Carrito() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]); // Lista completa de productos
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(null); // Para reemplazar window.confirm
  
  const API_URL = 'http://localhost:4000/api';

  // Función para mostrar mensajes de error/confirmación temporales
  const showMessage = (msg, type = 'danger', duration = 4000) => {
    setErrorMsg({ msg, type });
    setTimeout(() => setErrorMsg(''), duration);
  };

  // Función de utilería para hacer fetch con token
  const fetchWithAuth = (url, options = {}) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
  };


  // 🛑 1. Carga inicial de productos y carrito
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // A. Cargar todos los productos (para stock y precio)
        const productsRes = await fetch(`${API_URL}/products`);
        const allProducts = await productsRes.json();
        setProducts(allProducts);

        // B. Cargar carrito del usuario (requiere token)
        const cartRes = await fetchWithAuth(`${API_URL}/cart`);
        if (cartRes.status === 401) {
             // Esto sucede si no hay token (usuario no logueado)
             console.log("No autorizado, carrito vacío asumido.");
             setCart([]); 
        } else {
             const userCart = await cartRes.json();
             // CRÍTICO: El Backend ahora envía un array de objetos con {id: product._id, qty: ...}
             setCart(userCart);
        }

      } catch (err) {
        console.error("Error al cargar datos del carrito:", err);
        showMessage('Error al cargar productos o carrito. Asegúrate de estar logueado.', 'danger', 6000);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Se ejecuta solo una vez al montar

  // 🛑 2. Función para sincronizar el carrito con el Backend
  const updateServerCart = async (newCart) => {
    setCart(newCart);
    try {
        const res = await fetchWithAuth(`${API_URL}/cart`, {
            method: 'POST',
            // CRÍTICO: El body que enviamos es el array limpio de items
            body: JSON.stringify(newCart.map(item => ({ id: item.id, qty: item.qty })))
        });
        if (!res.ok) {
            throw new Error('Error al sincronizar carrito.');
        }
        // No es necesario procesar la respuesta, solo asegurar que se guardó.
    } catch (error) {
        console.error('Error al guardar el carrito:', error);
        showMessage('No se pudo guardar el carrito en el servidor. Intenta de nuevo.', 'danger');
    }
  };

  const handleQuantityChange = (id, delta) => {
    // CRÍTICO: El 'id' ahora es el '_id' de MongoDB, no un número.
    const productInfo = products.find(p => String(p._id) === String(id));
    if (!productInfo) return;

    const currentItem = cart.find(i => String(i.id) === String(id));
    const newQty = currentItem.qty + delta;

    if (newQty > productInfo.stock) {
      showMessage(`Solo quedan ${productInfo.stock} unidades de ${productInfo.name}`, 'warning');
      return;
    }

    if (newQty < 1) {
      // 🛑 Reemplazamos window.confirm
      setShowConfirm({ id, name: productInfo.name });
      return;
    }

    const newCart = cart.map(item => {
      if (String(item.id) === String(id)) {
        return { ...item, qty: newQty };
      }
      return item;
    });

    updateServerCart(newCart);
  };

  const removeFull = (id) => {
    // Se llama cuando el usuario confirma la eliminación
    const newCart = cart.filter(i => String(i.id) !== String(id));
    updateServerCart(newCart);
    setShowConfirm(null); // Cierra el modal
    showMessage('Producto eliminado del carrito.', 'success');
  };

  const total = () => {
    return cart.reduce((sum, item) => {
      // CRÍTICO: Usamos _id para encontrar el producto de la lista completa
      const p = products.find(x => String(x._id) === String(item.id));
      // También verificamos que item.qty sea un número válido
      return sum + (p ? p.price * (item.qty || 0) : 0);
    }, 0);
  };
  
  if (loading) return (
    <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando productos y carrito...</p>
    </div>
  );

  if (cart.length === 0) return (
    <div className="container mt-5 text-center">
      <div className="alert alert-info py-5 shadow-lg rounded-3">
        <h4>Tu carrito está vacío 🛒</h4>
        <Link to="/catalogo" className="btn btn-primary mt-3 btn-lg">Ir a comprar</Link>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-primary fw-bold">Tu Carrito de Compras</h2>
      
      {/* Mensaje de Error/Advertencia */}
      {errorMsg.msg && (
        <div className={`alert alert-${errorMsg.type} position-fixed top-0 start-50 translate-middle-x mt-5 shadow-lg`} style={{zIndex:9999}}>
          {errorMsg.msg}
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showConfirm && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-warning text-white">
                        <h5 className="modal-title">Confirmar Eliminación</h5>
                    </div>
                    <div className="modal-body">
                        ¿Quieres eliminar permanentemente **{showConfirm.name}** del carrito?
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowConfirm(null)}>Cancelar</button>
                        <button type="button" className="btn btn-danger" onClick={() => removeFull(showConfirm.id)}>Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-8 col-md-12">
          {cart.map(item => {
            // CRÍTICO: Usamos _id para buscar en la lista completa
            const p = products.find(x => String(x._id) === String(item.id));
            
            // Si el producto fue eliminado de la DB, no lo mostramos
            if (!p) return null; 

            return (
              <div key={item.id} className="card mb-3 shadow-sm border-0 rounded-3">
                <div className="card-body d-flex align-items-center flex-wrap">
                  <Link to={`/catalogo/${p._id}`} className="text-decoration-none text-dark d-flex align-items-center">
                      <img 
                        src={p.img || '/assets/placeholder.jpeg'} 
                        onError={(e) => { e.target.onerror = null; e.target.src="/assets/placeholder.jpeg" }}
                        alt={p.name} 
                        style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px" }} 
                        className="me-3 border"
                      />
                      <div className="flex-grow-1">
                        <h5 className="mb-1 text-truncate" style={{maxWidth: '300px'}}>{p.name}</h5>
                        <p className="text-muted small mb-0">Precio unitario: ${p.price.toLocaleString('es-CL')}</p>
                      </div>
                  </Link>

                  {/* Controles de Cantidad */}
                  <div className="d-flex align-items-center bg-light rounded px-2 me-3 my-2 my-sm-0 ms-auto">
                    <button 
                      className="btn btn-sm btn-link text-decoration-none fw-bold text-dark" 
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      −
                    </button>
                    <span className="mx-2 fw-bold">{item.qty}</span>
                    <button 
                      className="btn btn-sm btn-link text-decoration-none fw-bold text-dark" 
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="text-end me-3" style={{minWidth: '80px'}}>
                    <p className="mb-0 fw-bold text-danger">${(p.price * item.qty).toLocaleString('es-CL')}</p>
                  </div>

                  <button 
                    className="btn btn-outline-danger btn-sm p-2" 
                    title="Eliminar producto"
                    onClick={() => setShowConfirm({ id: item.id, name: p.name })} // Usamos el modal de confirmación
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Resumen del Pedido */}
        <div className="col-lg-4 col-md-12">
          <div className="card p-4 shadow-lg bg-light border-0 rounded-3 position-sticky" style={{top: '20px'}}>
            <h4 className="mb-3 border-bottom pb-2">Resumen de la Compra</h4>
            <div className="d-flex justify-content-between mb-2">
              <span>Productos ({cart.length} items)</span>
              <span>${total().toLocaleString('es-CL')}</span>
            </div>
            <div className="d-flex justify-content-between mb-4 pb-3 border-bottom">
              <span>Envío</span>
              <span className="text-success fw-bold">¡Gratis!</span>
            </div>
            <div className="d-flex justify-content-between mb-4">
              <span className="h4 text-primary">Total a Pagar</span>
              <span className="h4 fw-bolder text-danger">${total().toLocaleString('es-CL')}</span>
            </div>
            <Link to="/pago" className="btn btn-success w-100 btn-lg shadow-lg">
              <i className="bi bi-credit-card me-2"></i> Proceder al Pago
            </Link>
            <Link to="/catalogo" className="btn btn-outline-secondary w-100 mt-2">
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}