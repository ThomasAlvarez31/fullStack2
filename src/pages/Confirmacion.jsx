import React from 'react';
import { Link } from 'react-router-dom';

export default function Confirmacion() {
  return (
    <div className="container text-center py-5">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '450px', margin: '0 auto' }}>
        <img 
          src="/assets/tick-verde.png" 
          alt="Confirmación de compra" 
          className="mx-auto mb-3" 
          style={{ width: '100px', height: '100px' }} 
        />
        <h2 className="card-title mb-3">¡Compra realizada con éxito!</h2>
        <p className="card-text text-muted">
          Gracias por tu confianza. Hemos recibido tu pedido y pronto recibirás un correo con los detalles.
        </p>
        <div className="mt-4">
          <Link to="/" className="btn btn-primary px-4">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
