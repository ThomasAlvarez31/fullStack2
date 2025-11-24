import React, { useEffect, useState } from 'react';

export default function AdminVentas() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('http://localhost:4000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Ordenar por fecha (más reciente primero)
        const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) : [];
        setOrders(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Historial de Ventas</h2>

      {orders.length === 0 ? (
        <div className="alert alert-info">No hay ventas registradas aún.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover shadow-sm bg-white">
            <thead className="table-dark">
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Detalle Productos</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>
                    {new Date(order.fecha).toLocaleDateString()}<br/>
                    <small className="text-muted">{new Date(order.fecha).toLocaleTimeString()}</small>
                  </td>
                  <td>
                    <strong>{order.cliente.nombre} {order.cliente.apellido}</strong><br/>
                    <small>{order.cliente.email}</small>
                  </td>
                  <td>
                    <ul className="mb-0 ps-3">
                      {order.productos.map((prod, idx) => (
                        <li key={idx} className="small">
                           (x{prod.qty}) Nombre: {prod.product || prod.name} 
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="fw-bold text-success">
                    ${order.total ? order.total.toLocaleString('es-CL') : 0}
                  </td>
                  <td>
                    <span className={`badge ${order.status === 'Pagada' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}