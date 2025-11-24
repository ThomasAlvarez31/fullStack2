
const seedProducts = [
  { id: 1, name: 'Smart Speaker X1', price: 49990, desc: 'Altavoz inteligente con buen sonido', img: '/assets/X1.jpeg ', category: 'Audio' },
  { id: 2, name: 'Auriculares NoiseLess Pro', price: 79990, desc: 'Cancelación de ruido activa', img: '/assets/Audifonos.jpeg', category: 'Audio' },
  { id: 3, name: 'Cargador Solar Pocket', price: 19990, desc: 'Cargador portátil con panel solar', img: '/assets/Cargador.jpeg', category: 'Accesorios' },
];

const seedUsers = [
  { id: 1, run: '19011022K', name: 'Admin', email: 'admin@duoc.cl', role: 'admin' },
  { id: 2, run: '12345678K', name: 'Cliente Demo', email: 'cliente@gmail.com', role: 'cliente' }
];

export function initData(){
  if(!localStorage.getItem('pau_products')) localStorage.setItem('pau_products', JSON.stringify(seedProducts));
  if(!localStorage.getItem('pau_users')) localStorage.setItem('pau_users', JSON.stringify(seedUsers));
  if(!localStorage.getItem('pau_cart')) localStorage.setItem('pau_cart', JSON.stringify([]));
}

export function getProducts(){ return JSON.parse(localStorage.getItem('pau_products')||'[]') }
export function saveProducts(products){ localStorage.setItem('pau_products', JSON.stringify(products)) }

export function getUsers(){ return JSON.parse(localStorage.getItem('pau_users')||'[]') }
export function saveUsers(users){ localStorage.setItem('pau_users', JSON.stringify(users)) }

export function getCart(){ return JSON.parse(localStorage.getItem('pau_cart')||'[]') }
export function saveCart(cart){ localStorage.setItem('pau_cart', JSON.stringify(cart)) }

initData();
