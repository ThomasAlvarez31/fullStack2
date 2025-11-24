import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard.jsx';

export default function Catalogo(){
  const [productos, setProductos] = useState([]);
  const [addedMessage, setAddedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/products')
      .then(res => res.json())
      .then(data => setProductos(Array.isArray(data) ? data : []))
      .catch(error => console.error("Error cargando productos:", error));
  }, []);

  function handleAdd(id, cantidad){
    // 1. RECUPERAR TOKEN
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        alert("Debes iniciar sesión para comprar.");
        window.location.href = '/login';
        return;
    }

    const productoReal = productos.find(p => p.id === id);
    if (!productoReal) return;

    // 2. PEDIR CARRITO CON TOKEN
    fetch('http://localhost:4000/api/cart', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    })
      .then(res => res.json())
      .then(data => {
        // 3. PROTECCIÓN: Si data es error u objeto, usar []
        const cart = Array.isArray(data) ? data : [];
        
        const item = cart.find(i => i.id === id);
        const cantidadActual = item ? item.qty : 0;

        if (cantidadActual + cantidad > productoReal.stock) {
          setErrorMessage(`¡Stock insuficiente! Quedan: ${productoReal.stock}`);
          setTimeout(() => setErrorMessage(''), 3000);
          return;
        }

        if(item) { item.qty += cantidad; } 
        else { cart.push({id, qty: cantidad}); }

        // 4. GUARDAR CON TOKEN
        return fetch('http://localhost:4000/api/cart', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cart)
        });
      })
      .then(res => res ? res.json() : null)
      .then(() => {
        setAddedMessage(`Se añadieron ${cantidad} de "${productoReal.name}"`);
        setTimeout(() => setAddedMessage(''), 3000);
      })
      .catch(err => console.error("Error carrito:", err));
  }

  return (
    <div>
      <h2 className="mb-4">Catálogo Completo</h2>
      {addedMessage && <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5 shadow" style={{zIndex:9999}}>{addedMessage}</div>}
      {errorMessage && <div className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-5 shadow" style={{zIndex:9999}}>{errorMessage}</div>}

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {productos.map(p => <ProductCard key={p.id} p={p} onAdd={handleAdd} />)}
      </div>
    </div>
  );
}