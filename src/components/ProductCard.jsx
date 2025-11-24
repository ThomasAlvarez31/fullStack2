import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ p, onAdd }) {
  const [cantidad, setCantidad] = useState(1);

  // Validar que no escriban manualmente más del stock
  const handleCantidadChange = (e) => {
    let valor = Number(e.target.value);
    if (valor > p.stock) valor = p.stock; // Si se pasa, lo bajamos al máximo
    if (valor < 1) valor = 1;
    setCantidad(valor);
  };

  return (
    <div className="col">
      <div className="card h-100 shadow-sm">
        <img 
          src={p.img} 
          alt={p.name} 
          className="card-img-top" 
          style={{ height: '200px', objectFit: 'cover' }} 
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{p.name}</h5>
          <p className="card-text text-muted small flex-grow-1">{p.desc}</p>
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            <p className="text-danger fw-bold fs-5 mb-0">${p.price.toLocaleString('es-CL')}</p>
            {/* Mostrar Stock */}
            <small className={`fw-bold ${p.stock === 0 ? 'text-danger' : 'text-success'}`}>
              {p.stock === 0 ? 'Agotado' : `Disponibles: ${p.stock}`}
            </small>
          </div>
          
          <div className="d-flex align-items-center gap-2 mt-2">
            <input 
              type="number" 
              min="1" 
              max={p.stock} // Límite HTML
              className="form-control text-center" 
              style={{ width: '60px' }} 
              value={cantidad}
              onChange={handleCantidadChange}
              disabled={p.stock === 0} // Deshabilitar si no hay stock
            />
            
            <button 
              className="btn btn-primary w-100" 
              onClick={() => onAdd(p.id, cantidad)}
              disabled={p.stock === 0} // Botón apagado si no hay stock
            >
              {p.stock === 0 ? 'Sin Stock' : 'Añadir'}
            </button>
          </div>
          
          <Link to={`/producto/${p.id}`} className="btn btn-outline-secondary w-100 mt-2">
            Ver Detalle
          </Link>
        </div>
      </div>
    </div>
  );
}