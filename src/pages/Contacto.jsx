
import React from 'react';

export default function Contacto(){
  return (
    <div className="card p-3">
      <h2>Contacto</h2>
      <form onSubmit={(e)=>{e.preventDefault(); alert('Mensaje enviado (simulado)')}}>
        <label className="form-label">Nombre<input className="form-control" required /></label>
        <label className="form-label">Correo<input className="form-control" type="email" required /></label>
        <label className="form-label">Mensaje<textarea className="form-control" required></textarea></label>
        <button className="btn btn-primary mt-2">Enviar</button>
      </form>
    </div>
  );
}
