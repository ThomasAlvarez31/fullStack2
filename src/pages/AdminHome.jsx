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
        const [prodRes, userRes, orderRes] = await Promise.all([
            fetch('http://localhost:4000/api/products'),
            fetch('http://localhost:4000/api/users'),
            fetch('http://localhost:4000/api/orders')
        ]);

        const prodData = await prodRes.json();
        const userData = await userRes.json();
        const ordersData = await orderRes.json();

        // PROTECCIONES MONGODB (Array.isArray)
        const safeProds = Array.isArray(prodData) ? prodData : [];
        const safeUsers = Array.isArray(userData) ? userData : [];
        const safeOrders = Array.isArray(ordersData) ? ordersData : [];

        // Ahora es seguro usar .reduce
        const totalDinero = safeOrders.reduce((acumulador, orden) => {
          return acumulador + (orden.total || 0);
        }, 0);

        setStats({
          products: safeProds.length,
          users: safeUsers.length,
          sales: totalDinero,  
          ordersCount: safeOrders.length 
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
        {/* Productos */}
        <div className="col-md-4">
          <div className="card text-white bg-primary h-100 shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4 fw-bold">{stats.products}</h1>
              <p className="lead">Productos</p>
              <Link to="/admin/productos" className="btn btn-light btn-sm text-primary fw-bold">Gestionar</Link>
            </div>
          </div>
        </div>

        {/* Usuarios */}
        <div className="col-md-4">
          <div className="card text-white bg-success h-100 shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4 fw-bold">{stats.users}</h1>
              <p className="lead">Usuarios</p>
              <Link to="/admin/usuarios" className="btn btn-light btn-sm text-success fw-bold">Gestionar</Link>
            </div>
          </div>
        </div>

        {/* Ventas */}
        <div className="col-md-4">
          <div className="card text-white bg-warning h-100 shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-5 fw-bold text-dark">
                ${stats.sales.toLocaleString('es-CL')}
              </h1>
              <p className="lead text-dark">Ventas Totales</p>
              <small className="text-dark d-block mb-2">({stats.ordersCount} órdenes)</small>
              <Link to="/admin/ventas" className="btn btn-light btn-sm text-warning fw-bold">Ver Historial</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 p-4 bg-light rounded border shadow-sm">
        <h4>👋 Bienvenido Admin</h4>
        <p className="text-muted">
          Sistema conectado a <strong>MongoDB</strong>. Las estadísticas se actualizan en tiempo real.
        </p>
      </div>
    </div>
  );
}