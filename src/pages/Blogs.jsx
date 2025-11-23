
import React from 'react';
import { Link } from 'react-router-dom';
export default function Blogs(){
  return (
    <div>
      <h2>Blog</h2>
      <div className="row row-cols-1 row-cols-md-2 g-3">
        <div className="card p-3"><h4><Link to="/blogs/la-historia-de-pauperrimos">La historia de Pauperrimos</Link></h4><p>Cómo nació el proyecto y primeros desafíos.</p></div>
        <div className="card p-3"><h4><Link to="/blogs/novedades-pauperrimos">Novedades recientes</Link></h4><p>Últimos lanzamientos y mejoras.</p></div>
      </div>
    </div>
  );
}
