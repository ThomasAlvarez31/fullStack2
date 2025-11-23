
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Pago from './pages/Pago';
import Catalogo from './pages/Catalogo';
import Producto from './pages/Producto';
import Carrito from './pages/Carrito';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Nosotros from './pages/Nosotros';
import Confirmacion from './pages/Confirmacion';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import AdminProductos from './pages/AdminProductos';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminHome from './pages/AdminHome';


export default function App(){
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container my-4">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/catalogo" element={<Catalogo/>} />
          <Route path="/producto/:id" element={<Producto/>} />
          <Route path="/pago" element={<Pago/>} />
          <Route path="/carrito" element={<Carrito/>} />
          <Route path="/contacto" element={<Contacto/>} />
          <Route path="/confirmacion" element={<Confirmacion/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/registro" element={<Registro/>} />
          <Route path="/nosotros" element={<Nosotros/>} />
          <Route path="/blogs" element={<Blogs/>} />
          <Route path="/blogs/:slug" element={<BlogDetail/>} />
          <Route path="/admin" element={<AdminHome/>} />
          <Route path="/admin/productos" element={<AdminProductos/>} />
          <Route path="/admin/usuarios" element={<AdminUsuarios/>} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
