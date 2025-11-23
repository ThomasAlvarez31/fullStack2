import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Producto() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3000/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('No encontrado');
        return res.json();
      })
      .then(data => setP(data))
      .catch(err => console.error(err));
  }, [id]);

  function addToCart() {
    fetch('http://localhost:3000/api/cart')
      .then(res => res.json())
      .then(cart => {
        const item = cart.find(i => i.id === Number(id));
        if (item) item.qty += cantidad;
        else cart.push({ id: Number(id), qty: cantidad });

        fetch('http://localhost:3000/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cart)
        });

        setAddedMessage(`¡Se agregaron ${cantidad} unidad(es) de ${p.name}!`);
        setTimeout(() => setAddedMessage(''), 3000);
      });
  }

  if (!p) return <div className="p-5">Cargando...</div>;

  return (
    <div className="card p-4 shadow-sm">
      {addedMessage && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5 shadow" style={{zIndex: 9999}}>
          {addedMessage}
        </div>
      )}

      <div className="row">
        <div className="col-md-5">
          <img src={p.img} alt={p.name} className="img-fluid rounded shadow-sm" />
        </div>
        <div className="col-md-7 d-flex flex-column justify-content-center">
          <h2 className="mb-3">{p.name}</h2>
          <p className="text-danger fw-bold fs-3">${p.price.toLocaleString('es-CL')}</p>
          <p className="text-muted lead">{p.desc}</p>
          
          <div className="mt-4 p-3 bg-light rounded border">
             <label className="form-label fw-bold">Cantidad:</label>
             <div className="d-flex gap-3">
               <input 
                 type="number" 
                 min="1" 
                 className="form-control" 
                 style={{width:'80px'}} 
                 value={cantidad} 
                 onChange={(e) => setCantidad(Number(e.target.value))}
               />
               <button className="btn btn-primary px-4" onClick={addToCart}>
                 Añadir al Carrito 🛒
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}