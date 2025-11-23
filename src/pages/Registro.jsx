import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Registro() {
  const [form, setForm] = useState({ name: '', email: '', password: '', run: '', surname: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.name} ${form.surname}`,
          email: form.email,
          password: form.password,

        })
      });

      const data = await response.json();

      if (data.success) {
        alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
        navigate('/login');
      } else {
        setError('Error al registrar usuario.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center my-5">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="text-center mb-4">Crear Cuenta</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombre</label>
              <input 
                name="name" className="form-control" 
                onChange={handleChange} required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Apellidos</label>
              <input 
                name="surname" className="form-control" 
                onChange={handleChange} required 
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">RUN (Opcional)</label>
            <input 
              name="run" className="form-control" 
              onChange={handleChange} 
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" name="email" className="form-control" 
              onChange={handleChange} required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" name="password" className="form-control" 
              onChange={handleChange} required 
            />
          </div>

          <button type="submit" className="btn btn-success w-100 mt-3">Registrarme</button>
        </form>
      </div>
    </div>
  );
}