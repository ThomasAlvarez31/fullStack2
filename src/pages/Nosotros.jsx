
import React from 'react';

export default function Nosotros(){
  return (
    <div className="card p-3">
      <h2>Nosotros</h2>
      <p>Pauperrimos nació como un proyecto estudiantil con la misión de entregar tecnología accesible sin sacrificar calidad. Nuestro equipo reúne experiencia en desarrollo web y una pasión por crear productos útiles y confiables.</p>
      <h3>Equipo</h3>
      <div className="row">
        <div className="col-md-4 card p-3">Anton Knittel<br/><small>Frontend</small></div>
        <div className="col-md-4 card p-3">Thomás <Alvarez></Alvarez><br/><small>DevOps</small></div>
        <div className="col-md-4 card p-3">Eduardo Cota<br/><small>UX/UI</small></div>
      </div>
    </div>
  );
}
