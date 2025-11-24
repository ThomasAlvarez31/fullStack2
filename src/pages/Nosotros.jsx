import React from 'react';

export default function Nosotros(){
  return (
    <div className="container mt-5">
      <div className="card p-5 shadow-sm border-0">
        <h2 className="text-center mb-4 text-danger fw-bold">Sobre Pauperrimos</h2>
        <p className="lead text-center mb-5">
            Pauperrimos nació como un proyecto estudiantil con la misión de entregar tecnología accesible sin sacrificar calidad. 
            Nuestro equipo reúne experiencia en desarrollo web y una pasión por crear productos útiles y confiables.
        </p>
        
        <h3 className="text-center mb-4">Nuestro Equipo</h3>
        <div className="row text-center g-4">
          <div className="col-md-4">
              <div className="card p-4 h-100 shadow-sm border-0 bg-light">
                  <h4 className="fw-bold">Anton Knittel</h4>
                  <small className="text-muted text-uppercase">Frontend Developer</small>
              </div>
          </div>
          <div className="col-md-4">
              <div className="card p-4 h-100 shadow-sm border-0 bg-light">
                  <h4 className="fw-bold">Thomás Alvarez</h4>
                  <small className="text-muted text-uppercase">DevOps & Backend</small>
              </div>
          </div>
          <div className="col-md-4">
              <div className="card p-4 h-100 shadow-sm border-0 bg-light">
                  <h4 className="fw-bold">Lave Nita</h4>
                  <small className="text-muted text-uppercase">UX/UI Designer</small>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}