import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Carrito() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        setLoading(false); 
        return; 
    }

    const fetchData = async () => {
      try {
        const prodRes = await fetch('http://localhost:4000/api/products');
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);

        // PEDIR CARRITO CON TOKEN
        const cartRes = await fetch('http://localhost:4000/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` } // <--- IMPORTANTE
        });
        
        const cartData = await cartRes.json();
        // El backend devuelve un array directo gracias a tu nuevo server.js
        setCart(Array.isArray(cartData) ? cartData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateServerCart = (newCart) => {
    const token = localStorage.getItem('authToken');
    setCart(newCart);
    
    fetch('http://localhost:4000/api/cart', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(newCart)
    });
  };

  const handleQuantityChange = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const newQty = item.qty + delta;
    const p = products.find(prod => prod.id === id);

    // Validaciones
    if (newQty < 1) return removeItem(id);
    if (p && newQty > p.stock) return alert("No hay suficiente stock");

    const newCart = cart.map(i => i.id === id ? { ...i, qty: newQty } : i);
    updateServerCart(newCart);
  };

  const removeItem = (id) => {
    const newCart = cart.filter(i => i.id !== id);
    updateServerCart(newCart);
  };

  const total = () => {
    return cart.reduce((acc, item) => {
      // Nota: Tu backend ya devuelve el precio en el objeto del carrito, 
      // pero por seguridad lo buscamos en la lista de productos actualizados
      const p = products.find(x => x.id === item.id);
      return acc + (p ? p.price * item.qty : 0);
    }, 0);
  };

  if (loading) return <div className="p-5 text-center">Cargando...</div>;
  
  if (!localStorage.getItem('authToken')) return (
    <div className="text-center mt-5">
        <h3>Debes iniciar sesión</h3>
        <Link to="/login" className="btn btn-primary mt-3">Ir al Login</Link>
    </div>
  );

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
      <h2 className="mb-4">Tu Carrito</h2>
      <div className="row">
        <div className="col-lg-8">
          {cart.map(item => {
            const p = products.find(x => x.id === item.id);
            if (!p) return null;
            return (
              <div key={item.id} className="card mb-3 shadow-sm border-0">
                <div className="card-body d-flex align-items-center">
                  <img src={p.img} alt={p.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px" }} className="me-3"/>
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{p.name}</h5>
                    <p className="text-muted small mb-0">${p.price.toLocaleString('es-CL')}</p>
                  </div>
                  <div className="d-flex align-items-center bg-light rounded px-2 me-3">
                    <button className="btn btn-sm btn-link text-dark" onClick={() => handleQuantityChange(item.id, -1)}>−</button>
                    <span className="mx-2 fw-bold">{item.qty}</span>
                    <button className="btn btn-sm btn-link text-dark" onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                  </div>
                  <div className="text-end me-3">
                    <p className="mb-0 fw-bold">${(p.price * item.qty).toLocaleString('es-CL')}</p>
                  </div>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeItem(item.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="col-lg-4">
          <div className="card p-4 shadow-lg bg-light border-0">
            <h4 className="mb-3">Resumen</h4>
            <div className="d-flex justify-content-between mb-4">
              <span className="h4">Total</span>
              <span className="h4 fw-bold text-danger">${total().toLocaleString('es-CL')}</span>
            </div>
            <Link to="/pago" className="btn btn-success w-100 btn-lg">Proceder al Pago</Link>
          </div>
        </div>
      </div>
    </div>
  );
}