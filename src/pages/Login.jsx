import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.token) { // 🛑 Busca 'data.token' además de 'data.success'
        // 🛑 Guardar el TOKEN para futuras peticiones
        localStorage.setItem('authToken', data.token); 
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('rol', data.user.role);
        
        alert(`¡Bienvenido de nuevo, ${data.user.name}!`);
        window.location.href = "/"; 
      } else {
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error: No se puede conectar con el servidor (Backend caído)');
    }
  };
  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input 
              type="email" className="form-control" 
              value={email} onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" className="form-control" 
              value={password} onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Entrar</button>
        </form>
        <div className="text-center mt-3">
            <small>Admin: <b>admin@pauperrimos.cl</b> / <b>123</b></small>
        </div>
      </div>
    </div>
  );
}