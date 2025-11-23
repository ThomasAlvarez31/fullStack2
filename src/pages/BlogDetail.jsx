
import React from 'react';
import { useParams } from 'react-router-dom';
export default function BlogDetail(){
  const { slug } = useParams();
  if(slug === 'la-historia-de-pauperrimos'){
    return <div className="card p-3"><h2>La historia de Pauperrimos</h2><p>Corría el invierno de 2024 cuando tres estudiantes se juntaron para resolver un problema...</p></div>
  }
  return <div className="card p-3"><h2>Novedades recientes</h2><p>Este mes lanzamos el Smart Speaker X2...</p></div>
}
