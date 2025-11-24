import React, { useEffect, useState } from 'react';

export default function AdminUsuarios() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'cliente' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  };

  // Preparar edición
  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role });
  };

  // Guardar cambios
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    try {
        const res = await fetch(`http://localhost:4000/api/users/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(form)
        });
        
        if (res.ok) {
            alert('Usuario actualizado');
            setEditingId(null);
            fetchUsers();
        } else {
            alert('Error al actualizar');
        }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar usuario?')) return;
    const token = localStorage.getItem('authToken');
    await fetch(`http://localhost:4000/api/users/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchUsers();
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm">
        <h2 className="mb-4">Gestión de Usuarios</h2>

        {/* FORMULARIO DE EDICIÓN (Solo aparece si editas) */}
        {editingId && (
            <form onSubmit={handleUpdate} className="mb-4 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                <h4>✏️ Editando a: {form.name}</h4>
                <div className="row g-2">
                    <div className="col-md-4">
                        <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre" />
                    </div>
                    <div className="col-md-4">
                        <input className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" />
                    </div>
                    <div className="col-md-2">
                        <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                            <option value="cliente">Cliente</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="col-md-2 d-flex gap-2">
                        <button type="submit" className="btn btn-success w-100">Guardar</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)}>X</button>
                    </div>
                </div>
            </form>
        )}

        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(u)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}>Eliminar</button>
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