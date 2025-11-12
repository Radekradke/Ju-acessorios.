/* ========== CONFIGURAÇÕES ========== */
const WHATSAPP_NUMBER = "5521992344201";
const COMPANY_NAME = "Ju-Acessorios";

const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let currentCategory = 'todos';
let ALL_PRODUCTS = [];

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

/* ========== SISTEMA DE CATEGORIAS ========== */
function updateCategoryCounts(products) {
  const counts = {
    todos: products.length,
    bracelete: products.filter(p => p.category === 'bracelete').length,
    brincos: products.filter(p => p.category === 'brincos').length,
    colares: products.filter(p => p.category === 'colares').length,
    pulseiras: products.filter(p => p.category === 'pulseiras').length
  };

  Object.keys(counts).forEach(cat => {
    const countEl = document.getElementById(`count-${cat}`);
    if (countEl) countEl.textContent = counts[cat];
  });
}

function filterByCategory(category) {
  currentCategory = category;
  currentPage = 1;
  
  // Atualizar botões ativos
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.category === category) {
      btn.classList.add('active');
    }
  });
  
  renderGrid(ALL_PRODUCTS);
}

function getFilteredProducts(products) {
  if (currentCategory === 'todos') {
    return products;
  }
  return products.filter(p => p.category === currentCategory);
}

function renderGrid(PRODUCTS) {
  const filteredProducts = getFilteredProducts(PRODUCTS);
  
  grid.innerHTML = '';
  
  // Adicionar animação de fade
  grid.style.opacity = '0';
  setTimeout(() => {
    grid.style.opacity = '1';
  }, 50);
  
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const visible = filteredProducts.slice(start, end);

  if (visible.length === 0) {
    grid.innerHTML = '<div class="no-products"><p>Nenhum produto encontrado nesta categoria.</p></div>';
    return;
  }

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
          <div class="card-title">${p.title}</div>
          <div class="subtitle">${p.subtitle || ''}</div>
        </div>
        <div class="price">${priceText}<small>/unidade</small></div>
        <div class="actions">
          <button class="btn details" data-id="${p.id}" ${p.sold ? 'disabled' : ''}>Ver Detalhes</button>
          <div class="action-row">
            <button class="btn wpp" data-id="${p.id}" ${p.sold ? 'disabled' : ''}>Pedir</button>
            <button class="btn add-to-bag icon-only" data-id="${p.id}" ${p.sold ? 'disabled' : ''} title="Adicionar à Sacola">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </button>
          </div>
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

  renderPagination(filteredProducts);
}

function renderPagination(filteredProducts) {
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const old = document.querySelector('.pagination');
  if (old) old.remove();

  if (totalPages <= 1) return;

  const container = document.createElement('div');
  container.className = 'pagination';

  const prev = document.createElement('button');
  prev.textContent = '← Anterior';
  prev.className = 'btn details';
  prev.disabled = currentPage === 1;
  prev.onclick = () => {
    currentPage--;
    renderGrid(ALL_PRODUCTS);
    window.scrollTo(0, 0);
  };

  const next = document.createElement('button');
  next.textContent = 'Próxima →';
  next.className = 'btn details';
  next.disabled = currentPage === totalPages;
  next.onclick = () => {
    currentPage++;
    renderGrid(ALL_PRODUCTS);
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
  
  mostrarNotificacao('produto adicionado na sacola'); // Mensagem genérica
}

function atualizarSacola() {
  const sacola = JSON.parse(localStorage.getItem('sacola')) || [];
  const sacolaDiv = document.getElementById('sacola');
  const toggleBtn = document.getElementById('toggleSacola');
  const counter = document.querySelector('.sacola-counter');
  
  if (counter) {
    counter.textContent = sacola.length;
  }
  
  if (toggleBtn) {
    toggleBtn.style.display = sacola.length > 0 ? 'flex' : 'none';
  }
  
  if (sacola.length === 0) {
    sacolaDiv.style.display = 'none';
    return;
  }
  
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

// Função para encurtar URL com TinyURL
async function encurtarUrl(longUrl) {
  try {
    const response = await fetch(`https://api.tinyurl.com/create?url=${encodeURIComponent(longUrl)}`);
    const data = await response.json();
    return data.data.tiny_url;  // Retorna URL curta
  } catch (error) {
    console.error('Erro ao encurtar URL:', error);
    return longUrl;  // Fallback: usa URL longa se falhar
  }
}
async function finalizarSacola() {
  const sacola = JSON.parse(localStorage.getItem('sacola')) || [];
  if (sacola.length === 0) return alert('Sacola vazia!');
  
  // Gerar ID único (timestamp)
  const pedidoId = Date.now().toString();
  
  // Criar objeto JSON da sacola
  const sacolaData = {
    id: pedidoId,
    items: sacola,
    total: sacola.reduce((sum, item) => sum + parseFloat(item.valor), 0)
  };
  
  // Codificar os dados
  const encodedData = btoa(JSON.stringify(sacolaData));
  
  // Criar URL com parâmetro
  const baseUrl = window.location.origin + window.location.pathname;
  const sacolaUrl = `${baseUrl}?sacola=${encodedData}`;
  
  // LOG PARA DEBUG: Ver URL longa antes de encurtar
  console.log('URL longa:', sacolaUrl);
  
  // Encurtar a URL automaticamente
  let shortUrl;
  try {
    shortUrl = await encurtarUrl(sacolaUrl);
    console.log('URL curta:', shortUrl);  // LOG: Ver se encurtou
  } catch (error) {
    console.error('Erro ao encurtar:', error);
    shortUrl = sacolaUrl;  // Fallback: usa URL longa
    console.log('Usando fallback (URL longa):', shortUrl);
  }
  
  // Montar mensagem otimizada do WhatsApp
  let itensResumidos = sacola.map(item => `• ${item.nome} - R$ ${item.valor}`).join('\n');
  let mensagem = `Olá *${COMPANY_NAME}*! \n\nGostaria de finalizar minha compra:\n\n${itensResumidos}\n\n*Total: R$ ${sacolaData.total.toFixed(2)}*\n\n🛍️ Ver sacola completa: ${shortUrl}`;
  
  // LOG PARA DEBUG: Ver mensagem final
  console.log('Mensagem final:', mensagem);
  
  // Enviar via WhatsApp
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
  
  // Limpar sacola local
  localStorage.removeItem('sacola');
  atualizarSacola();
}

// Função para visualizar sacola compartilhada (com opções de imprimir/PDF e mensagem de agradecimento)
function visualizarSacolaCompartilhada(encodedData) {
  try {
    const sacolaData = JSON.parse(atob(encodedData));
    const { id, items, total } = sacolaData;
    
    // Ocultar conteúdo normal e mostrar overlay com animação
    document.body.classList.add('visualizando-sacola');
    
    const overlay = document.createElement('div');
    overlay.id = 'sacola-visualizar-overlay';
    overlay.innerHTML = `
      <div class="sacola-visualizar-container">
        <div class="sacola-visualizar-header">
          <h2>Sacola do Cliente</h2>
          <div class="sacola-id">ID: ${id}</div>
          <button class="sacola-visualizar-fechar" onclick="fecharSacolaVisualizar()" aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="sacola-visualizar-produtos">
          ${items.map((item, index) => `
            <div class="sacola-visualizar-item">
              <div class="sacola-visualizar-numero">${index + 1}</div>
              <img class="sacola-visualizar-foto" src="${item.foto}" alt="${item.nome}" loading="lazy">
              <div class="sacola-visualizar-info">
                <h3>${item.nome}</h3>
                <div class="sacola-visualizar-preco">R$ ${item.valor}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="sacola-visualizar-footer">
          <div class="sacola-visualizar-total">
            <span>Total:</span>
            <div class="sacola-visualizar-total-valor">R$ ${total.toFixed(2)}</div>
          </div>
          <div class="sacola-visualizar-acoes">
            <button class="sacola-visualizar-btn-imprimir" onclick="imprimirSacola()" tabindex="0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <polyline points="6,9 6,2 18,2"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Imprimir
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Animação de fade-in
    setTimeout(() => overlay.style.opacity = '1', 10);
  } catch (e) {
    console.error('Erro ao decodificar sacola:', e);
    alert('Link inválido ou corrompido.');
  }
}

function fecharSacolaVisualizar() {
  const overlay = document.getElementById('sacola-visualizar-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      document.body.classList.remove('visualizando-sacola');
      // Redirecionar para o site principal
      window.location.href = 'https://radekradke.github.io/Ju-acessorios./';
    }, 300);
  }
}

// Função para imprimir a sacola
function imprimirSacola() {
  window.print();
}

/* ========== FUNÇÕES AUXILIARES ========== */
function waLink(number, msg) {
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

function toggleImageZoom() {
  const container = document.querySelector('.modal-img-container');
  isZoomed = !isZoomed;
  container.classList.toggle('zoomed', isZoomed);
  modalImg.style.cursor = isZoomed ? 'zoom-out' : 'zoom-in';
}

function mostrarNotificacao(mensagem) {
  const notif = document.createElement('div');
  notif.className = 'notificacao';
  notif.innerHTML = `
    <span>${mensagem}</span>
    <button onclick="this.parentElement.remove()">×</button>
  `;
  document.body.appendChild(notif);
  
  // Animação de entrada
  setTimeout(() => notif.classList.add('mostrar'), 10);
  
  // Remover automaticamente após 3 segundos
  setTimeout(() => {
    notif.classList.remove('mostrar');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

/* ========== INICIALIZAÇÃO ========== */
document.addEventListener('DOMContentLoaded', () => {
  // Verificar se há parâmetro de sacola na URL
  const urlParams = new URLSearchParams(window.location.search);
  const sacolaParam = urlParams.get('sacola');
  if (sacolaParam) {
    visualizarSacolaCompartilhada(sacolaParam);
    return; // Não carregar produtos normais se visualizando sacola
  }
  
  // Carregar produtos
  fetch('products.json')
    .then(response => response.json())
    .then(data => {
      ALL_PRODUCTS = data;
      updateCategoryCounts(ALL_PRODUCTS);
      renderGrid(ALL_PRODUCTS);
      attachGridEvents(ALL_PRODUCTS);
    })
    .catch(error => console.error('Erro ao carregar produtos:', error));
  
  // Inicializar sacola
  atualizarSacola();
  
  // Evento para toggle da sacola
  const toggleBtn = document.getElementById('toggleSacola');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const sacolaDiv = document.getElementById('sacola');
      sacolaDiv.style.display = sacolaDiv.style.display === 'block' ? 'none' : 'block';
    });
  }

  // Adicionar event listeners aos botões de categoria
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      filterByCategory(category);
    });
  });
});