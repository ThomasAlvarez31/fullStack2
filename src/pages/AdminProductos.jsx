import React, { useEffect, useState } from 'react';

export default function AdminProductos() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', stock: '', desc: '', img: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const productData = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      desc: form.desc,
      img: form.img || '/assets/placeholder.png'
    };

    try {
      if (editingId) {
        await fetch(`http://localhost:3000/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        alert('Producto actualizado correctamente');
      } else {
        await fetch('http://localhost:3000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        alert('Producto creado correctamente');
      }

      setForm({ name: '', price: '', stock: '', desc: '', img: '' });
      setEditingId(null);
      fetchProducts();

    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const handleEditClick = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock, 
      desc: product.desc,
      img: product.img
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setForm({ name: '', price: '', stock: '', desc: '', img: '' });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>{editingId ? '✏️ Editando Producto' : '➕ Agregar Nuevo Producto'}</h2>
          {editingId && <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancelar Edición</button>}
        </div>
        
        <form onSubmit={handleSave} className="mb-5 p-4 bg-light rounded border">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre del Producto</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Precio</label>
              <input className="form-control" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Stock (Cantidad)</label>
              <input 
                className="form-control" 
                type="number" 
                value={form.stock} 
                onChange={e => setForm({ ...form, stock: e.target.value })} 
                required 
                min="0"
              />
            </div>

             <div className="col-md-12">
              <label className="form-label">URL Imagen</label>
              <input className="form-control" value={form.img} onChange={e => setForm({ ...form, img: e.target.value })} placeholder="/assets/..." />
            </div>
            
            <div className="col-md-12">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" rows="2" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} required></textarea>
            </div>
            
            <div className="col-12">
              <button className={`btn w-100 ${editingId ? 'btn-warning' : 'btn-success'}`}>
                {editingId ? 'Actualizar Cambios' : 'Guardar Producto'}
              </button>
            </div>
          </div>
        </form>
        <h4>Inventario Actual</h4>
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
                  <td><img src={p.img} alt="img" style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'5px'}} /></td>
                  <td>{p.name}</td>
                  <td>${p.price.toLocaleString('es-CL')}</td>
                  <td>
                    <span className={`badge ${p.stock > 0 ? 'bg-info text-dark' : 'bg-danger'}`}>
                      {p.stock > 0 ? p.stock : 'AGOTADO'}
                    </span>
                  </td>

                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(p)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Eliminar</button>
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