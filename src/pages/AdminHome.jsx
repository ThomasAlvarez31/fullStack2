import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminHome() {
  const [stats, setStats] = useState({ products: 0, users: 0, sales: 0, ordersCount: 0 });

  useEffect(() => {
    const rol = localStorage.getItem('rol');
    if (rol !== 'admin') {
      window.location.href = '/login';
    }

    const fetchData = async () => {
      try {
        const resProd = await fetch('http://localhost:4000/api/products');
        const prodData = await resProd.json();
        const resUser = await fetch('http://localhost:4000/api/users');
        const userData = await resUser.json();
        const resOrders = await fetch('http://localhost:4000/api/orders');
        const ordersData = await resOrders.json();
        const totalDinero = ordersData.reduce((acumulador, orden) => {
          return acumulador + (orden.total || 0);
        }, 0);

        setStats({
          products: prodData.length,
          users: userData.length,
          sales: totalDinero,  
          ordersCount: ordersData.length 
        });

      } catch (error) {
        console.error('Error cargando stats:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Panel de Administración</h2>
      
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary h-100 shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4 fw-bold">{stats.products}</h1>
              <p className="lead">Productos en Catálogo</p>
              <Link to="/admin/productos" className="btn btn-light btn-sm text-primary fw-bold">Gestionar Inventario</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-success h-100 shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4 fw-bold">{stats.users}</h1>
              <p className="lead">Usuarios Registrados</p>
              <Link to="/admin/usuarios" className="btn btn-light btn-sm text-success fw-bold">Gestionar Usuarios</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-warning h-100 shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-5 fw-bold text-dark">
                ${stats.sales.toLocaleString('es-CL')}
              </h1>
              <p className="lead text-dark">Ventas Totales</p>
              <small className="text-dark d-block mb-2">({stats.ordersCount} órdenes procesadas)</small>
              <button className="btn btn-light btn-sm text-warning fw-bold disabled">Ver Reporte Financiero</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 p-4 bg-light rounded border shadow-sm">
        <h4>👋 Bienvenido al Centro de Control</h4>
        <p className="text-muted">
          Aquí tienes un resumen en tiempo real de tu tienda <strong>Pauperrimos</strong>. 
          Las cifras de ventas se actualizan automáticamente cada vez que un cliente confirma un pago.
        </p>
      </div>
    </div>
  );
}