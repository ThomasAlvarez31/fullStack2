import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Producto() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');

  useEffect(() => {
    fetch(`http://localhost:4000/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('No encontrado');
        return res.json();
      })
      .then(data => setP(data))
      .catch(err => console.error(err));
  }, [id]);

  function addToCart() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert("Debes iniciar sesión para comprar.");
        window.location.href = '/login';
        return;
    }

    fetch('http://localhost:4000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Protección Array
        const cart = Array.isArray(data) ? data : [];

        // Buscar producto por ID (manejo de string/number)
        const item = cart.find(i => i.id === id || i.id === Number(id));
        
        const currentQty = item ? item.qty : 0;
        if (currentQty + cantidad > p.stock) {
           alert(`No puedes agregar más. Stock disponible: ${p.stock}`);
           return;
        }

        if (item) item.qty += cantidad;
        else cart.push({ id: p.id, qty: cantidad }); 

        fetch('http://localhost:4000/api/cart', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cart)
        });

        setAddedMessage(`¡Se agregaron ${cantidad} unidad(es) de ${p.name}!`);
        setTimeout(() => setAddedMessage(''), 3000);
      })
      .catch(err => console.error("Error carrito:", err));
  }

  if (!p) return <div className="p-5 text-center">Cargando...</div>;

  return (
    <div className="container mt-5">
        {addedMessage && (
          <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5 text-center shadow" style={{zIndex:9999}}>
            {addedMessage}
          </div>
        )}

        <div className="card shadow p-4">
            <div className="row">
                <div className="col-md-6">
                  <img src={p.img} className="img-fluid rounded shadow-sm" alt={p.name} style={{maxHeight: '400px', objectFit: 'contain'}}/>
                </div>
                <div className="col-md-6 d-flex flex-column justify-content-center">
                    <h2 className="display-6 fw-bold">{p.name}</h2>
                    <h3 className="text-danger fw-bold my-3">${p.price.toLocaleString('es-CL')}</h3>
                    <p className="lead fs-6">{p.desc}</p>
                    
                    <div className="mt-3">
                      <span className={`badge ${p.stock > 0 ? 'bg-success' : 'bg-danger'} fs-6`}>
                        {p.stock > 0 ? `Stock Disponible: ${p.stock}` : "Agotado"}
                      </span>
                    </div>
                    
                    <div className="d-flex gap-2 mt-4">
                        <input 
                          type="number" 
                          min="1" 
                          max={p.stock} 
                          className="form-control w-25 text-center" 
                          value={cantidad} 
                          onChange={e => setCantidad(Number(e.target.value))}
                          disabled={p.stock === 0}
                        />
                        <button 
                          onClick={addToCart} 
                          className="btn btn-primary flex-grow-1 shadow-sm" 
                          disabled={p.stock === 0}
                        >
                          {p.stock === 0 ? 'Sin Stock' : 'Añadir al Carrito 🛒'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}