/* ========== CONFIGURAÇÕES ========== */
const WHATSAPP_NUMBER = "5521992344201";
const COMPANY_NAME = "Ju-Acessorios";

const ITEMS_PER_PAGE = 12;
let currentPage = 1;

const grid = document.getElementById('grid');
const modalBack = document.getElementById('modalBack');
const modalTitle = document.getElementById('modalTitle');
const modalImg = document.getElementById('modalImg');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalWpp = document.getElementById('modalWpp');
const modalMore = document.getElementById('modalMore');
const closeBtn = document.getElementById('closeBtn');

let isZoomed = false;

/* Helper: carregar products.json */
async function loadProducts() {
  try {
    const resp = await fetch('./products.json', {cache: "no-store"});
    if (!resp.ok) throw new Error('no products.json');
    const json = await resp.json();
    if (!Array.isArray(json)) throw new Error('products.json inválido');
    return json;
  } catch (e) {
    const fallback = [];
    for (let i = 1; i <= 60; i++) {
      fallback.push({
        id: `p${i}`,
        title: `Produto ${i}`,
        subtitle: "Acessório Exclusivo",
        price: "R$ —",
        img: `images/produto${i}.jpeg`,
        desc: `Descrição do Produto ${i}.`,
        badge: i <= 6 ? "Novo" : "Coleção",
        sold: false
      });
    }
    return fallback;
  }
}

function waLink(phone, text) {
  const t = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${t}`;
}

function toggleImageZoom() {
  const imgContainer = document.querySelector('.modal-img-container');
  const img = document.getElementById('modalImg');
  
  if (!isZoomed) {
    imgContainer.classList.add('zoomed');
    img.style.cursor = 'zoom-out';
    modalMore.textContent = '🔍 Voltar ao Normal';
    isZoomed = true;
  } else {
    imgContainer.classList.remove('zoomed');
    img.style.cursor = 'zoom-in';
    modalMore.textContent = 'Ver Mais Detalhes';
    isZoomed = false;
  }
}

function renderGrid(PRODUCTS) {
  grid.innerHTML = '';
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const visible = PRODUCTS.slice(start, end);

  visible.forEach((p, index) => {
    const c = document.createElement('article');
    c.className = 'card';
    c.style.animationDelay = `${0.05 * index}s`;

    const soldBadge = p.sold ? `<div class="badge badge-sold">Esgotado</div>` : `<div class="badge">${p.badge || ''}</div>`;
    const priceText = p.price && p.price !== "R$ —" && p.price !== "" ? p.price : "R$ —";

    c.innerHTML = `
      <div class="thumb-container">
        <img class="thumb" src="${p.img}" alt="${p.title}">
        ${soldBadge}
      </div>
      <div class="card-content">
        <div class="card-header">
          <div class="title">${p.title}</div>
          <div class="subtitle">${p.subtitle || ''}</div>
        </div>
        <div class="price">${priceText}<small>/unidade</small></div>
        <div class="actions">
          <button class="btn details" data-id="${p.id}" ${p.sold ? 'disabled' : ''}>Ver Detalhes</button>
          <button class="btn wpp" data-id="${p.id}" ${p.sold ? 'disabled' : ''}>Pedir</button>
          <button class="btn add-to-bag" data-id="${p.id}" ${p.sold ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    if (p.sold) {
      c.style.opacity = '0.6';
      c.style.pointerEvents = 'none';
      c.style.cursor = 'not-allowed';
    }

    grid.appendChild(c);
  });

  renderPagination(PRODUCTS);
}

function renderPagination(PRODUCTS) {
  const totalPages = Math.ceil(PRODUCTS.length / ITEMS_PER_PAGE);
  const old = document.querySelector('.pagination');
  if (old) old.remove();

  const container = document.createElement('div');
  container.className = 'pagination';

  const prev = document.createElement('button');
  prev.textContent = '← Anterior';
  prev.className = 'btn details';
  prev.disabled = currentPage === 1;
  prev.onclick = () => {
    currentPage--;
    renderGrid(PRODUCTS);
    window.scrollTo(0, 0);
  };

  const next = document.createElement('button');
  next.textContent = 'Próxima →';
  next.className = 'btn details';
  next.disabled = currentPage === totalPages;
  next.onclick = () => {
    currentPage++;
    renderGrid(PRODUCTS);
    window.scrollTo(0, 0);
  };

  const info = document.createElement('span');
  info.style.color = '#666';
  info.style.margin = '0 20px';
  info.textContent = `Página ${currentPage} de ${totalPages}`;

  container.appendChild(prev);
  container.appendChild(info);
  container.appendChild(next);

  grid.appendChild(container);
}

function attachGridEvents(PRODUCTS) {
  grid.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const product = PRODUCTS.find(x => x.id === id);
    if (!product || product.sold) return;

    if (btn.classList.contains('add-to-bag')) {
      const valorNumerico = product.price.replace('R$', '').replace(',', '.').trim() || '0';
      adicionarProduto(product.img, product.title, valorNumerico);
      return;
    }

    if (btn.classList.contains('wpp')) {
      const pageUrl = location.href.split('#')[0];
      const msg = `Olá *${COMPANY_NAME}*! \n\nTenho interesse em:\n\n *${product.title}*\n ${product.price}\n\n Mostruário: ${pageUrl}`;
      window.open(waLink(WHATSAPP_NUMBER, msg), '_blank');
    } else if (btn.classList.contains('details')) {
      isZoomed = false;
      modalTitle.textContent = product.title;
      modalImg.src = product.img;
      modalImg.alt = product.title;
      modalImg.style.cursor = 'zoom-in';
      modalDesc.textContent = product.desc;
      modalPrice.textContent = product.price;
      modalMore.textContent = 'Ver Mais Detalhes';
      modalBack.style.display = "flex";
      
      document.querySelector('.modal-img-container').classList.remove('zoomed');

      modalWpp.onclick = () => {
        const pageUrl = location.href.split('#')[0];
        const msg = `Olá *${COMPANY_NAME}*! \n\nGostaria de saber mais sobre:\n\n *${product.title}*\n${product.subtitle}\n ${product.price}\n\n ${product.desc}\n\n🔗 Link: ${pageUrl}`;
        window.open(waLink(WHATSAPP_NUMBER, msg), '_blank');
      };
      
      modalMore.onclick = toggleImageZoom;
      modalImg.onclick = toggleImageZoom;

      const modalAddToBag = document.getElementById('modalAddToBag');
      if (modalAddToBag) {
        modalAddToBag.onclick = () => {
          const valorNumerico = product.price.replace('R$', '').replace(',', '.').trim() || '0';
          adicionarProduto(product.img, product.title, valorNumerico);
        };
      }
    }
  });

  closeBtn.addEventListener('click', () => {
    modalBack.style.display = 'none';
    isZoomed = false;
    document.querySelector('.modal-img-container').classList.remove('zoomed');
  });
  
  modalBack.addEventListener('click', (e) => {
    if (e.target === modalBack) {
      modalBack.style.display = 'none';
      isZoomed = false;
      document.querySelector('.modal-img-container').classList.remove('zoomed');
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBack.style.display === 'flex') {
      modalBack.style.display = 'none';
      isZoomed = false;
      document.querySelector('.modal-img-container').classList.remove('zoomed');
    }
  });
}

/* ========== FUNÇÕES DA SACOLA ========== */
function adicionarProduto(foto, nome, valor) {
  let sacola = JSON.parse(localStorage.getItem('sacola')) || [];
  sacola.push({ foto, nome, valor });
  localStorage.setItem('sacola', JSON.stringify(sacola));
  atualizarSacola();
  
  // Feedback visual
  mostrarNotificacao('Produto adicionado à sacola!');
}

function atualizarSacola() {
  const sacola = JSON.parse(localStorage.getItem('sacola')) || [];
  const sacolaDiv = document.getElementById('sacola');
  const toggleBtn = document.getElementById('toggleSacola');
  const counter = document.querySelector('.sacola-counter');
  
  // Atualizar contador no header
  if (counter) {
    counter.textContent = sacola.length;
  }
  
  // Mostrar/ocultar botão da sacola
  if (toggleBtn) {
    toggleBtn.style.display = sacola.length > 0 ? 'flex' : 'none';
  }
  
  // Se sacola vazia, ocultar
  if (sacola.length === 0) {
    sacolaDiv.style.display = 'none';
    return;
  }
  
  // Montar HTML da sacola
  let html = `
    <div id="sacola-header">
      <h3>Minha Sacola</h3>
      <button id="sacola-close">×</button>
    </div>
  `;
  
  sacola.forEach((item, index) => {
    html += `
      <div class="sacola-item">
        <img src="${item.foto}" alt="${item.nome}">
        <div class="sacola-item-info">
          <div class="sacola-item-title">${item.nome}</div>
          <div class="sacola-item-price">R$ ${item.valor}</div>
          <button onclick="removerProduto(${index})">Remover</button>
        </div>
      </div>
    `;
  });
  
  const total = sacola.reduce((sum, item) => sum + parseFloat(item.valor), 0);
  html += `
    <div id="sacola-total">
      <span>Total:</span>
      <span id="sacola-total-value">R$ ${total.toFixed(2)}</span>
    </div>
    <button class="finalizar" onclick="finalizarSacola()">Finalizar Pedido</button>
  `;
  
  sacolaDiv.innerHTML = html;
  
  // Adicionar evento de fechar
  document.getElementById('sacola-close').onclick = () => {
    sacolaDiv.style.display = 'none';
  };
}

function removerProduto(index) {
  let sacola = JSON.parse(localStorage.getItem('sacola')) || [];
  sacola.splice(index, 1);
  localStorage.setItem('sacola', JSON.stringify(sacola));
  atualizarSacola();
  mostrarNotificacao('Produto removido da sacola');
}

function finalizarSacola() {
  const sacola = JSON.parse(localStorage.getItem('sacola')) || [];
  if (sacola.length === 0) return alert('Sacola vazia!');
  
  let mensagem = `Olá *${COMPANY_NAME}*! \n\nGostaria de finalizar minha compra:\n\n`;
  sacola.forEach(item => {
    mensagem += `• ${item.nome}: R$ ${item.valor}\n`;
  });
  const total = sacola.reduce((sum, item) => sum + parseFloat(item.valor), 0);
  mensagem += `\n*Total: R$ ${total.toFixed(2)}*`;
  
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
  localStorage.removeItem('sacola');
  atualizarSacola();
}
function mostrarNotificacao(msg) {
  const notif = document.createElement('div');
  notif.textContent = msg;
  notif.className = window.innerWidth <= 768 ? 'notificacao-mobile' : '';
  notif.style.cssText = `
    position: fixed;
    top: ${window.innerWidth <= 768 ? '80px' : '100px'};
    right: ${window.innerWidth <= 768 ? '10px' : '20px'};
    ${window.innerWidth <= 768 ? 'left: 10px;' : ''}
    background: linear-gradient(135deg, #28a745, #218838);
    color: white;
    padding: ${window.innerWidth <= 768 ? '12px 20px' : '15px 25px'};
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
    z-index: 10000;
    animation: slideInRight 0.4s ease-out;
    font-weight: 600;
    font-size: ${window.innerWidth <= 768 ? '14px' : '15px'};
    text-align: center;
  `;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => notif.remove(), 300);
  }, 2000);
}
// Toggle da sacola
document.addEventListener('DOMContentLoaded', () => {
  atualizarSacola();
  
  const toggleBtn = document.getElementById('toggleSacola');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const sacolaDiv = document.getElementById('sacola');
      sacolaDiv.style.display = sacolaDiv.style.display === 'none' ? 'block' : 'none';
    });
  }
});

(async function init() {
  const PRODUCTS = await loadProducts();
  renderGrid(PRODUCTS);
  attachGridEvents(PRODUCTS);
})();
