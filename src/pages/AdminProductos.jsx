import React, { useEffect, useState } from 'react';

export default function AdminProductos() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', stock: '', desc: '', img: '' });
  const [editingId, setEditingId] = useState(null); // ID del producto que se está editando

  // Cargar productos al inicio
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('http://localhost:4000/api/products');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  // Manejar Guardar (Crear o Editar)
  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    const productData = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      desc: form.desc,
      img: form.img || '/assets/placeholder.png'
    };

    try {
      let response;
      if (editingId) {
        // MODO EDICIÓN (PUT)
        response = await fetch(`http://localhost:4000/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(productData)
        });
      } else {
        // MODO CREACIÓN (POST)
        response = await fetch('http://localhost:4000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(productData)
        });
      }

      if (response.ok) {
        alert(editingId ? 'Producto actualizado' : 'Producto creado');
        handleCancel(); // Limpiar formulario
        fetchProducts(); // Recargar tabla
      } else {
        alert('Error al guardar');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Cargar datos en el formulario para editar
  const handleEditClick = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      stock: p.stock,
      desc: p.desc,
      img: p.img
    });
    setEditingId(p.id); // Guardamos el ID que estamos editando
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Subir al formulario
  };

  const handleCancel = () => {
    setForm({ name: '', price: '', stock: '', desc: '', img: '' });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar producto?')) return;
    const token = localStorage.getItem('authToken');
    
    await fetch(`http://localhost:4000/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchProducts();
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className={editingId ? "text-warning" : "text-primary"}>
            {editingId ? '✏️ Editando Producto' : '➕ Nuevo Producto'}
          </h2>
          {editingId && <button className="btn btn-secondary" onClick={handleCancel}>Cancelar Edición</button>}
        </div>
        
        {/* FORMULARIO */}
        <form onSubmit={handleSave} className="mb-5 p-4 bg-light rounded border">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Precio</label>
              <input className="form-control" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Stock</label>
              <input className="form-control" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
            </div>
             <div className="col-md-12">
              <label className="form-label">Imagen (URL)</label>
              <input className="form-control" value={form.img} onChange={e => setForm({ ...form, img: e.target.value })} placeholder="https://..." />
            </div>
            <div className="col-md-12">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" rows="2" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} required></textarea>
            </div>
            <div className="col-12">
              <button className={`btn w-100 ${editingId ? 'btn-warning' : 'btn-success'}`}>
                {editingId ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </form>

        {/* TABLA */}
        <h4>Inventario</h4>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Img</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><img src={p.img} alt="prod" style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'4px'}} /></td>
                  <td>{p.name}</td>
                  <td>${p.price.toLocaleString('es-CL')}</td>
                  <td><span className={`badge ${p.stock > 0 ? 'bg-success' : 'bg-danger'}`}>{p.stock}</span></td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(p)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>🗑️</button>
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