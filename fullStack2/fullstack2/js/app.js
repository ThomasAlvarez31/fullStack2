// app.js - funciones básicas para MiTienda
console.log('MiTienda cargado');

const productosMock = [
  {id:1,title:'Camiseta',price:9990,desc:'Camiseta 100% algodón',img:'/assets/img/pngtree-classic-white-t-shirt-perfect-for-custom-printing-with-a-blank-png-image_13485404.png'},
  {id:2,title:'Taza',price:4990,desc:'Taza cerámica 300ml',img:'/assets/img/taza-grande.png'},
  {id:3,title:'Mug termo',price:12990,desc:'Mug para bebidas',img:'/assets/img/pixelcut-export_-_2024-02-01T171258.51020240201-4752-4lxpn0_5f4501f6-15da-434e-ad2a-0e5c761e332e_1800x.webp'}
];

// Render catálogo
function renderCatalogo(){
  const catalogo = document.getElementById('catalogo');
  if(!catalogo) return;
  catalogo.innerHTML = '';
  productosMock.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${p.img}" alt="${p.title}" style="max-width:100%"><h4>${p.title}</h4><p>${p.desc}</p><p>$${p.price}</p><button data-id="${p.id}" class="add">Añadir</button> <a href="producto.html?id=${p.id}">Ver</a>`;
    catalogo.appendChild(card);
  });
}

// Carrito en localStorage
function getCart(){
  return JSON.parse(localStorage.getItem('cart')||'[]');
}
function saveCart(c){
  localStorage.setItem('cart',JSON.stringify(c));
}
function addToCart(id){
  const p = productosMock.find(x=>x.id===Number(id));
  if(!p) return;
  const cart = getCart();
  const item = cart.find(i=>i.id===p.id);
  if(item) item.qty++; else cart.push({id:p.id,title:p.title,price:p.price,qty:1});
  saveCart(cart);
  alert('Añadido al carrito');
}

// Render carrito
function renderCart(){
  const container = document.getElementById('cart-items');
  if(!container) return;
  const cart = getCart();
  container.innerHTML='';
  let total=0;
  if(cart.length===0) container.innerHTML='<p>Carrito vacío</p>';
  cart.forEach(i=>{
    total += i.price * i.qty;
    const div = document.createElement('div');
    div.className='card';
    div.innerHTML=`<h4>${i.title}</h4><p>Precio: $${i.price}</p><p>Cantidad: ${i.qty}</p><button data-id="${i.id}" class="remove">Eliminar</button>`;
    container.appendChild(div);
  });
  const totalEl = document.getElementById('cart-total');
  if(totalEl) totalEl.textContent = 'Total: $'+total;
}

// Validación contacto
function validarContacto(e){
  e.preventDefault();
  const form = e.target;
  const nombre = form.querySelector('#nombre').value.trim();
  const correo = form.querySelector('#correo').value.trim();
  const telefono = form.querySelector('#telefono').value.trim();
  const direccion = form.querySelector('#direccion').value.trim();
  let errores = [];

  if(nombre.length < 3) errores.push('Nombre debe tener al menos 3 caracteres');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errores.push('Correo inválido');
  if(direccion.length < 5) errores.push('Dirección muy corta');
  if(telefono && !/^\+?\d{7,15}$/.test(telefono)) errores.push('Teléfono inválido');

  const listaErrores = form.querySelector('.errores');
  listaErrores.innerHTML = '';
  if(errores.length){
    errores.forEach(msg => {
      const li = document.createElement('div');
      li.textContent = msg;
      listaErrores.appendChild(li);
    });
    return false;
  }

  // Simular envío
  alert('Formulario válido — Gracias por tu compra/contacto');
  form.reset();
  // limpiar carrito
  localStorage.removeItem('cart');
  return true;
}

// Delegación de eventos
document.addEventListener('click', (e)=>{
  if(e.target.matches('.add')) addToCart(e.target.dataset.id);
  if(e.target.matches('.remove')){
    const id = Number(e.target.dataset.id);
    let cart = getCart();
    cart = cart.filter(i=>i.id!==id);
    saveCart(cart);
    renderCart();
  }
  if(e.target.id==='btn-add-cart'){
    const url = new URL(window.location.href);
    const id = Number(url.searchParams.get('id'))||1;
    addToCart(id);
  }
});

document.addEventListener('DOMContentLoaded', ()=>{
  renderCatalogo();
  renderCart();
  renderProducto();
  const form = document.getElementById('form-contacto');
  if(form) form.addEventListener('submit', validarContacto);
});
// ---------------- VALIDACIÓN LOGIN ----------------
function validarLogin(e) {
  e.preventDefault();
  const correo = e.target.querySelector('#correo').value.trim();
  const clave = e.target.querySelector('#clave').value.trim();
  let errores = [];

  // correo requerido + dominios permitidos
  const dominiosPermitidos = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
      !dominiosPermitidos.some(d => correo.endsWith(d))) {
    errores.push("Correo inválido o dominio no permitido");
  }

  // contraseña requerida (4 a 10 caracteres)
  if (clave.length < 4 || clave.length > 10) {
    errores.push("Contraseña debe tener entre 4 y 10 caracteres");
  }

  mostrarErrores(e.target, errores);
  if (errores.length === 0) {
    alert("Login válido ✅");
    e.target.reset();
  }
}

// ---------------- VALIDACIÓN REGISTRO ----------------
function validarRegistro(e) {
  e.preventDefault();
  const run = e.target.querySelector('#run').value.trim();
  const nombre = e.target.querySelector('#nombre').value.trim();
  const apellidos = e.target.querySelector('#apellidos').value.trim();
  const correo = e.target.querySelector('#correo').value.trim();
  const direccion = e.target.querySelector('#direccion').value.trim();

  let errores = [];

  // RUN sin puntos ni guión (7 a 9 dígitos + dígito verificador)
  if (!/^\d{7,9}[0-9kK]$/.test(run)) {
    errores.push("RUN inválido (sin puntos ni guión, ej: 19011022K)");
  }

  // nombre/apellidos requeridos
  if (nombre.length === 0) errores.push("Nombre requerido");
  if (apellidos.length === 0) errores.push("Apellidos requeridos");

  // correo con dominios permitidos
  const dominiosPermitidos = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
  if (!dominiosPermitidos.some(d => correo.endsWith(d))) {
    errores.push("Correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com");
  }

  // dirección requerida
  if (direccion.length < 5) errores.push("Dirección demasiado corta");

  mostrarErrores(e.target, errores);
  if (errores.length === 0) {
    alert("Registro válido ✅");
    e.target.reset();
  }
}

// ---------------- FUNCION AUXILIAR ----------------
function mostrarErrores(form, errores) {
  const div = form.querySelector('.errores');
  div.innerHTML = "";
  errores.forEach(err => {
    const p = document.createElement('p');
    p.textContent = err;
    div.appendChild(p);
  });
}

// Activar validaciones
document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.querySelector('#form-login');
  if (formLogin) formLogin.addEventListener('submit', validarLogin);

  const formRegistro = document.querySelector('#form-registro');
  if (formRegistro) formRegistro.addEventListener('submit', validarRegistro);
});

//Validad login como admin, vendedor o cliente
if (errores.length === 0) {
  if (correo.startsWith("admin@")){
    localStorage.setItem("rol", "admin");
  } else if (correo.startstWith("vendedor@")){
    localStorage.setItem("rol", "vendedor");
  } else {
    localStorage.setItem("rol","cliente");
  }
  alert("Login exitoso");
  window.location.href = "index.html";
}

//Al cargar el admin.html verifica el rol del usuario

document.addEventListener('DOMContentLoaded', () => {
  const rol = localStorage.getItem("rol");
  if (rol !== "admin"){
    alert("Acceso denegado, solo administracion");
    window.location.href = "login.html";
  }
})
// Render detalle de producto
function renderProducto() {
  const detalle = document.getElementById('detalle-producto');
  if (!detalle) return; // si no estamos en producto.html, no hace nada

  const url = new URL(window.location.href);
  const id = Number(url.searchParams.get('id'));
  const p = productosMock.find(x => x.id === id);

  if (!p) {
    detalle.innerHTML = "<p>Producto no encontrado</p>";
    return;
  }

  // Rellenar datos en la página
  document.getElementById('p-title').textContent = p.title;
  document.getElementById('p-img').src = p.img;
  document.getElementById('p-img').alt = p.title;
  document.getElementById('p-desc').textContent = p.desc;
  document.getElementById('p-price').textContent = "$" + p.price;
}
