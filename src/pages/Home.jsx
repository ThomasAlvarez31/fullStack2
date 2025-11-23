import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [addedMessage, setAddedMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.slice(0, 3))) 
      .catch(err => console.error(err));
  }, []);

  const handleAdd = (id, cantidad) => {
    fetch('http://localhost:3000/api/cart')
      .then(res => res.json())
      .then(cart => {
        const item = cart.find(i => i.id === id);
        if (item) {
          item.qty += cantidad;
        } else {
          cart.push({ id, qty: cantidad });
        }

        fetch('http://localhost:3000/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cart)
        });

        setAddedMessage(`¡Se agregaron ${cantidad} unidad(es) al carrito!`);
        setTimeout(() => setAddedMessage(''), 3000);
      });
  };

  return (
    <div>
      {addedMessage && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5 shadow" style={{zIndex: 9999}}>
          {addedMessage}
        </div>
      )}

      <div className="row align-items-center mb-5">
        <div className="col-md-6">
          <h1 className="display-5 fw-bold">Oferta del Día</h1>
          <p className="lead">Aprovecha nuestros precios en tecnología de alta gama.</p>
          <Link to="/catalogo" className="btn btn-danger btn-lg">Ver todo el catálogo</Link>
        </div>
        <div className="col-md-6">
          <div className="card p-4 shadow-sm border-0 bg-light">
             <div className="text-center">
                <h3 className="text-primary">Smart Speaker X1</h3>
                <img src="/assets/X1.jpeg" alt="Producto Destacado" className="img-fluid rounded my-3" style={{maxHeight:'200px'}}/>
                <h2 className="text-danger fw-bold">$49.990</h2>
             </div>
          </div>
        </div>
      </div>

      <h3 className="mb-3">Productos Destacados</h3>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {products.map(p => (
          <ProductCard key={p.id} p={p} onAdd={handleAdd} />
        ))}
      </div>
    </div>
  );
}