import React, { useEffect, useState } from 'react';

export default function AdminUsuarios() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar a este usuario?')) return;
    
    try {
      await fetch(`http://localhost:4000/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm">
        <h2 className="mb-4">Gestión de Usuarios</h2>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.role === 'admin' ? (
                      <span className="badge bg-danger">Administrador</span>
                    ) : (
                      <span className="badge bg-primary">Cliente</span>
                    )}
                  </td>
                  <td>
                    {u.role !== 'admin' ? (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>
                        Eliminar
                      </button>
                    ) : (
                      <span className="text-muted small">No editable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}