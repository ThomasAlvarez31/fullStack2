import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard.jsx';

export default function Catalogo(){
  const [productos, setProductos] = useState([]);
  const [addedMessage, setAddedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(error => console.error("Error cargando productos:", error));
  }, []);

  function handleAdd(id, cantidad){
    const productoReal = productos.find(p => p.id === id);
    if (!productoReal) return;

    fetch('http://localhost:3000/api/cart')
      .then(res => res.json())
      .then(cart => {
        const item = cart.find(i => i.id === id);
        const cantidadActualEnCarrito = item ? item.qty : 0;

        if (cantidadActualEnCarrito + cantidad > productoReal.stock) {
          setErrorMessage(`¡No puedes añadir más! Stock máximo: ${productoReal.stock}`);
          setTimeout(() => setErrorMessage(''), 3000);
          return;
        }

        if(item) {
          item.qty += cantidad;
        } else {
          cart.push({id, qty: cantidad});
        }

        fetch('http://localhost:3000/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cart)
        });
        
        setAddedMessage(`Se añadieron ${cantidad} unidad(es) de "${productoReal.name}"`);
        setTimeout(() => setAddedMessage(''), 3000);
      });
  }

  return (
    <div>
      <h2 className="mb-4">Catálogo Completo</h2>

      {addedMessage && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5" style={{zIndex: 9999}}>
          {addedMessage}
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-5" style={{zIndex: 9999}}>
          {errorMessage}
        </div>
      )}

      {productos.length === 0 ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {productos.map(p => <ProductCard key={p.id} p={p} onAdd={handleAdd} />)}
        </div>
      )}
    </div>
  );
}