import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Carrito() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(res => res.json())
      .then(prods => {
        setProducts(prods);
        return fetch('http://localhost:3000/api/cart');
      })
      .then(res => res.json())
      .then(c => setCart(c))
      .catch(err => console.error(err));
  }, []);

  const updateServerCart = (newCart) => {
    setCart(newCart);
    fetch('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCart)
    });
  };

  const handleQuantityChange = (id, delta) => {
    const productInfo = products.find(p => p.id === id);
    if (!productInfo) return;

    const currentItem = cart.find(i => i.id === id);
    const newQty = currentItem.qty + delta;

    if (newQty > productInfo.stock) {
      setErrorMsg(`Solo quedan ${productInfo.stock} unidades de ${productInfo.name}`);
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    if (newQty < 1) {
      if (confirm(`¿Quieres eliminar "${productInfo.name}" del carrito?`)) {
        removeFull(id);
      }
      return;
    }

    const newCart = cart.map(item => {
      if (item.id === id) {
        return { ...item, qty: newQty };
      }
      return item;
    });

    updateServerCart(newCart);
  };

  const removeFull = (id) => {
    const newCart = cart.filter(i => i.id !== id);
    updateServerCart(newCart);
  };

  const total = () => {
    return cart.reduce((sum, item) => {
      const p = products.find(x => x.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  };

  if (cart.length === 0) return (
    <div className="container mt-5 text-center">
      <div className="alert alert-info py-5">
        <h4>Tu carrito está vacío 🛒</h4>
        <Link to="/catalogo" className="btn btn-primary mt-3">Ir a comprar</Link>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Tu Carrito de Compras</h2>
      
      {errorMsg && <div className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-5" style={{zIndex:9999}}>{errorMsg}</div>}

      <div className="row">
        <div className="col-md-8">
          {cart.map(item => {
            const p = products.find(x => x.id === item.id);
            if (!p) return null;

            return (
              <div key={item.id} className="card mb-3 shadow-sm border-0">
                <div className="card-body d-flex align-items-center">
                  <img 
                    src={p.img} 
                    alt={p.name} 
                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px" }} 
                    className="me-3"
                  />
                  
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{p.name}</h5>
                    <p className="text-muted small mb-0">Precio unitario: ${p.price.toLocaleString('es-CL')}</p>
                    <p className={`small mb-0 ${p.stock < 5 ? 'text-danger fw-bold' : 'text-success'}`}>
                      Stock disponible: {p.stock}
                    </p>
                  </div>

                  <div className="d-flex align-items-center bg-light rounded px-2 me-3">
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
                    <p className="mb-0 fw-bold">${(p.price * item.qty).toLocaleString('es-CL')}</p>
                  </div>

                  <button 
                    className="btn btn-outline-danger btn-sm" 
                    title="Eliminar producto"
                    onClick={() => { if(confirm('¿Eliminar producto?')) removeFull(item.id) }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="col-md-4">
          <div className="card p-4 shadow-sm bg-light border-0">
            <h4 className="mb-3">Resumen</h4>
            <div className="d-flex justify-content-between mb-3">
              <span>Subtotal</span>
              <span>${total().toLocaleString('es-CL')}</span>
            </div>
            <div className="d-flex justify-content-between mb-4 pb-3 border-bottom">
              <span>Envío</span>
              <span className="text-success">Gratis</span>
            </div>
            <div className="d-flex justify-content-between mb-4">
              <span className="h4">Total</span>
              <span className="h4 fw-bold text-danger">${total().toLocaleString('es-CL')}</span>
            </div>
            <Link to="/pago" className="btn btn-success w-100 btn-lg shadow">
              Proceder al Pago
            </Link>
            <Link to="/catalogo" className="btn btn-outline-secondary w-100 mt-2">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}