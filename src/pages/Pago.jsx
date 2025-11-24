import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Pago() {
  const navigate = useNavigate();
  
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    region: "",
    metodo: "tarjeta",
    numeroTarjeta: "",
    expiracion: "",
    cvv: "",
    nombreTarjeta: "",
  });

  const [emailError, setEmailError] = useState('');
  const [expiryError, setExpiryError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        alert("Debes iniciar sesión para realizar el pago.");
        navigate('/login');
        return;
    }

    Promise.all([
      fetch('http://localhost:4000/api/cart', {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
      }).then(res => res.json()),
      fetch('http://localhost:4000/api/products').then(res => res.json())
    ]).then(([cartData, productsData]) => {
      const safeCart = Array.isArray(cartData) ? cartData : [];
      const safeProds = Array.isArray(productsData) ? productsData : [];
      
      setCart(safeCart);
      
      const t = safeCart.reduce((sum, item) => {
        const p = safeProds.find(x => x.id === item.id);
        return sum + (p ? p.price * item.qty : 0);
      }, 0);
      setTotal(t);
    }).catch(err => console.error(err));
  }, [navigate]);

  const handleChange = (e) => {
    const { id, value, name, type } = e.target;
    if (type === 'radio') {
      setForm({ ...form, [name]: value });
      return;
    }
    if (id === 'correo') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setEmailError('Por favor, introduce un formato de correo válido.');
      } else {
        setEmailError('');
      }
    }
    setForm({ ...form, [id]: value });
  };

  const handleCardNumberChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const truncatedValue = rawValue.slice(0, 16);
    const formattedValue = truncatedValue.match(/.{1,4}/g)?.join(' ') || '';
    setForm({ ...form, numeroTarjeta: formattedValue });
  };

  const handleExpiryChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length > 4) rawValue = rawValue.slice(0, 4);
    let formattedValue = rawValue;
    if (rawValue.length > 2) formattedValue = rawValue.slice(0, 2) + '/' + rawValue.slice(2);

    setExpiryError('');
    if (formattedValue.length === 5) {
      const [monthStr, yearStr] = formattedValue.split('/');
      const month = parseInt(monthStr, 10);
      const year = parseInt(`20${yearStr}`, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) setExpiryError('Mes inválido.');
      else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        setExpiryError('Tarjeta expirada.');
      }
    }
    setForm({ ...form, expiracion: formattedValue });
  };

  const handleCvvChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setForm({ ...form, cvv: rawValue.slice(0, 3) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (emailError || expiryError) return alert("Corrige los errores.");
    if (cart.length === 0) return alert("Tu carrito está vacío.");

    const token = localStorage.getItem('authToken');

    try {
      if (form.metodo === 'webpay') {
        const response = await fetch('http://localhost:4000/api/orders/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            cliente: form,
            carro: cart,
            total: total,
            returnUrl: 'http://localhost:4000/api/payment/webpay-confirm'
          })
        });

        const data = await response.json();

        if (data.success) {
          const form = document.createElement("form");
          form.action = data.url;
          form.method = "POST";
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = "token_ws";
          input.value = data.token;
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
        } else {
          alert('Error al iniciar Webpay: ' + data.message);
        }

      } else {
        const response = await fetch('http://localhost:4000/api/orders', {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            cliente: form, 
            carro: cart,
            total: total
          })
        });

        const data = await response.json();
        if (data.success) {
          navigate('/confirmacion');
        } else {
          alert('Hubo un error al procesar el pago.');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el backend.');
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: "800px" }}>
      <main>
        <section>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Información de pago</h2>
            <div className="badge bg-success fs-5">
              Total: ${total.toLocaleString('es-CL')}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="nombre" className="form-label">Nombre*</label>
                <input type="text" id="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="apellido" className="form-label">Apellido*</label>
                <input type="text" id="apellido" className="form-control" value={form.apellido} onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="correo" className="form-label">Correo electrónico*</label>
              <input type="email" id="correo" className={`form-control ${emailError ? 'is-invalid' : ''}`} value={form.correo} onChange={handleChange} required />
              {emailError && <div className="invalid-feedback">{emailError}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="telefono" className="form-label">Teléfono*</label>
              <input type="tel" id="telefono" className="form-control" value={form.telefono} onChange={handleChange} required />
            </div>

            <h4 className="mt-4">Dirección de Envío</h4>
            <div className="mb-3">
              <label htmlFor="direccion" className="form-label">Dirección*</label>
              <input type="text" id="direccion" className="form-control" value={form.direccion} onChange={handleChange} required />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="ciudad" className="form-label">Ciudad*</label>
                <input type="text" id="ciudad" className="form-control" value={form.ciudad} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="region" className="form-label">Región*</label>
                <select id="region" className="form-select" value={form.region} onChange={handleChange} required>
                  <option value="" disabled>Selecciona una región</option>
                  <option value="Arica y Parinacota">Arica y Parinacota</option>
                  <option value="Tarapacá">Tarapacá</option>
                  <option value="Antofagasta">Antofagasta</option>
                  <option value="Atacama">Atacama</option>
                  <option value="Coquimbo">Coquimbo</option>
                  <option value="Valparaíso">Valparaíso</option>
                  <option value="Metropolitana">Región Metropolitana</option>
                  <option value="O'Higgins">O'Higgins</option>
                  <option value="Maule">Región del Maule</option>
                  <option value="Ñuble">Ñuble</option>
                  <option value="Biobío">Región del Biobío</option>
                  <option value="La Araucanía">La Araucanía</option>
                  <option value="Los Ríos">Los Ríos</option>
                  <option value="Los Lagos">Los Lagos</option>
                  <option value="Aysén">Aysén</option>
                  <option value="Magallanes y de la Antártica Chilena">Magallanes y de la Antártica Chilena</option>
                </select>
              </div>
            </div>

            <h4 className="mt-4">Método de pago*</h4>
            <div className="form-check">
              <input className="form-check-input" type="radio" name="metodo" id="metodoTarjeta" value="tarjeta" checked={form.metodo === "tarjeta"} onChange={handleChange}/>
              <label className="form-check-label" htmlFor="metodoTarjeta">Tarjeta de Crédito/Débito</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" name="metodo" id="metodowebpay" value="webpay" checked={form.metodo === "webpay"} onChange={handleChange}/>
              <label className="form-check-label" htmlFor="metodowebpay">Webpay</label>
            </div>
            
            {form.metodo === 'tarjeta' && (
              <div className="mt-3 border p-3 rounded bg-light">
                <h5 className="mb-3">Detalles de la tarjeta</h5>
                <div className="mb-3">
                  <label className="form-label">Número de tarjeta*</label>
                  <input type="text" className="form-control" placeholder="XXXX XXXX XXXX XXXX" value={form.numeroTarjeta} onChange={handleCardNumberChange} required={form.metodo === 'tarjeta'}/>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Expiración (MM/AA)*</label>
                    <input type="text" className={`form-control ${expiryError ? 'is-invalid' : ''}`} placeholder="MM/AA" value={form.expiracion} onChange={handleExpiryChange} required={form.metodo === 'tarjeta'}/>
                    {expiryError && <div className="invalid-feedback">{expiryError}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">CVV*</label>
                    <input type="text" className="form-control" placeholder="123" value={form.cvv} onChange={handleCvvChange} required={form.metodo === 'tarjeta'}/>
                  </div>
                </div>
                 <div className="mt-3">
                  <label className="form-label">Nombre Titular*</label>
                  <input type="text" id="nombreTarjeta" className="form-control" value={form.nombreTarjeta} onChange={handleChange} required={form.metodo === 'tarjeta'}/>
                </div>
              </div>
            )}
            
            <button type="submit" className="btn btn-primary mt-4 w-100 btn-lg shadow-sm">
              Confirmar Pago
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}