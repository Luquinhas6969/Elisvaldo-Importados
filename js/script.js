/**
 * script.js
 * -----------------------------------------------------------------------
 * Carrega data/produtos.json e gera todo o catálogo dinamicamente:
 * cards de produto, seção de destaque, filtro de categoria, busca,
 * estados de carregamento/erro/vazio e o link de compra pelo WhatsApp.
 * -----------------------------------------------------------------------
 */

(function () {
  "use strict";

  let TODOS_PRODUTOS = [];
  let categoriaAtiva = "Todos";
  let termoBusca = "";

  const gridEl = document.getElementById("productsGrid");
  const emptyStateEl = document.getElementById("emptyState");
  const errorStateEl = document.getElementById("errorState");
  const resultCountEl = document.getElementById("resultCount");
  const categoryBarEl = document.getElementById("categoryBar");
  const heroHighlightsEl = document.getElementById("heroHighlights");
  const searchInput = document.getElementById("searchInput");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const menuToggle = document.getElementById("menuToggle");
  const headerTools = document.querySelector(".header-tools");

  document.getElementById("footerYear").textContent = new Date().getFullYear();

  aplicarConfiguracoesDeMarca();
  configurarWhatsappFlutuante();
  configurarMenuMobile();
  carregarProdutos();

  // -----------------------------------------------------------------
  // CONFIGURAÇÃO DE MARCA (nome da loja, iniciais)
  // -----------------------------------------------------------------
  function aplicarConfiguracoesDeMarca() {
    const nome = (window.CONFIG && CONFIG.STORE_NAME) || "Nego Importados";
    const inicial = nome.trim().charAt(0).toUpperCase() || "S";

    document.title = `${nome} — Catálogo`;
    setText("brandNameText", nome);
    setText("footerStoreName", nome);
    setText("brandMark", inicial);
    setText("footerBrandMark", inicial);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // -----------------------------------------------------------------
  // CARREGAMENTO DOS PRODUTOS
  // -----------------------------------------------------------------
  function carregarProdutos() {
    const path = (window.CONFIG && CONFIG.PRODUTOS_JSON_PATH) || "data/produtos.json";

    fetch(path, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar " + path);
        return res.json();
      })
      .then((produtos) => {
        TODOS_PRODUTOS = Array.isArray(produtos) ? produtos : [];
        montarCategorias(TODOS_PRODUTOS);
        montarDestaques(TODOS_PRODUTOS);
        renderizarGrid();
      })
      .catch((erro) => {
        console.error(erro);
        gridEl.innerHTML = "";
        errorStateEl.hidden = false;
      });
  }

  // -----------------------------------------------------------------
  // CATEGORIAS
  // -----------------------------------------------------------------
  function montarCategorias(produtos) {
    const categorias = Array.from(
      new Set(produtos.map((p) => p.categoria).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));

    categoryBarEl.innerHTML = "";

    const todas = ["Todos", ...categorias];
    todas.forEach((categoria) => {
      const btn = document.createElement("button");
      btn.className = "category-pill" + (categoria === categoriaAtiva ? " active" : "");
      btn.type = "button";
      btn.textContent = categoria;
      btn.addEventListener("click", () => {
        categoriaAtiva = categoria;
        document
          .querySelectorAll(".category-pill")
          .forEach((el) => el.classList.remove("active"));
        btn.classList.add("active");
        renderizarGrid();
      });
      categoryBarEl.appendChild(btn);
    });
  }

  // -----------------------------------------------------------------
  // SEÇÃO DE DESTAQUE (HERO)
  // -----------------------------------------------------------------
  function montarDestaques(produtos) {
    const destaques = produtos.filter((p) => p.destaque).slice(0, 3);
    const listaFinal = destaques.length > 0 ? destaques : produtos.slice(0, 3);

    heroHighlightsEl.innerHTML = "";

    listaFinal.forEach((produto) => {
      const card = document.createElement("a");
      card.className = "highlight-card";
      card.href = "#catalogo";

      const img = document.createElement("img");
      img.src = produto.imagem;
      img.alt = produto.nome;
      img.loading = "lazy";

      const price = document.createElement("span");
      price.className = "highlight-price";
      price.textContent = formatarPreco(produto.preco);

      card.appendChild(img);
      card.appendChild(price);
      heroHighlightsEl.appendChild(card);
    });
  }

  // -----------------------------------------------------------------
  // BUSCA
  // -----------------------------------------------------------------
  let debounceId = null;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceId);
    const valor = e.target.value;
    debounceId = setTimeout(() => {
      termoBusca = valor.trim().toLowerCase();
      renderizarGrid();
    }, 200);
  });

  clearFiltersBtn.addEventListener("click", () => {
    termoBusca = "";
    categoriaAtiva = "Todos";
    searchInput.value = "";
    document.querySelectorAll(".category-pill").forEach((el, i) => {
      el.classList.toggle("active", i === 0);
    });
    renderizarGrid();
  });

  // -----------------------------------------------------------------
  // RENDERIZAÇÃO DO GRID
  // -----------------------------------------------------------------
  function renderizarGrid() {
    let lista = TODOS_PRODUTOS;

    if (categoriaAtiva !== "Todos") {
      lista = lista.filter((p) => p.categoria === categoriaAtiva);
    }

    if (termoBusca) {
      lista = lista.filter((p) => {
        const alvo = `${p.nome} ${p.descricao || ""}`.toLowerCase();
        return alvo.includes(termoBusca);
      });
    }

    resultCountEl.textContent = `${lista.length} produto${lista.length === 1 ? "" : "s"} encontrado${lista.length === 1 ? "" : "s"}`;

    gridEl.innerHTML = "";

    if (lista.length === 0) {
      emptyStateEl.hidden = false;
      return;
    }
    emptyStateEl.hidden = true;

    const fragment = document.createDocumentFragment();
    lista.forEach((produto) => fragment.appendChild(criarCardProduto(produto)));
    gridEl.appendChild(fragment);
  }

  function criarCardProduto(produto) {
    const card = document.createElement("article");
    card.className = "product-card";

    const media = document.createElement("div");
    media.className = "product-media";

    const img = document.createElement("img");
    img.src = produto.imagem;
    img.alt = produto.nome;
    img.loading = "lazy";
    img.onerror = () => {
      img.src =
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23EFEAD9"/><text x="150" y="155" font-family="sans-serif" font-size="16" fill="%2358564C" text-anchor="middle">Sem imagem</text></svg>'
        );
    };
    media.appendChild(img);

    if (produto.categoria) {
      const tag = document.createElement("span");
      tag.className = "category-tag";
      tag.textContent = produto.categoria;
      media.appendChild(tag);
    }

    const body = document.createElement("div");
    body.className = "product-body";

    const titulo = document.createElement("h3");
    titulo.textContent = produto.nome;

    const desc = document.createElement("p");
    desc.className = "product-desc";
    desc.textContent = produto.descricao || "";

    const preco = document.createElement("p");
    preco.className = "product-price";
    preco.textContent = formatarPreco(produto.preco);

    const btnComprar = document.createElement("button");
    btnComprar.className = "buy-btn";
    btnComprar.type = "button";
    btnComprar.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.8c1.8 1 3.9 1.5 6.3 1.5 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-2 0-3.9-.5-5.5-1.5l-.4-.2-4.6 1.1 1.1-4.4-.3-.4C5.2 17.7 4.7 16.4 4.7 15c0-5.7 4.6-10.3 10.3-10.3S25.3 9.3 25.3 15 21.7 24.8 16 24.8z"/></svg><span>Comprar pelo WhatsApp</span>';
    btnComprar.addEventListener("click", () => {
      window.open(gerarLinkWhatsapp(produto.nome), "_blank", "noopener");
    });

    body.appendChild(titulo);
    body.appendChild(desc);
    body.appendChild(preco);
    body.appendChild(btnComprar);

    card.appendChild(media);
    card.appendChild(body);
    return card;
  }

  // -----------------------------------------------------------------
  // WHATSAPP
  // -----------------------------------------------------------------
 function formatarNumeroWhatsapp(numero) {
  // Remove parênteses, hífens, espaços e o sinal '+'
  const numLimpo = (numero || "").replace(/\D/g, "");
  return numLimpo;
}

function gerarLinkWhatsapp(nomeProduto) {
  const numeroBruto = (window.CONFIG && CONFIG.WHATSAPP_NUMBER) || "";
  const numero = formatarNumeroWhatsapp(numeroBruto);

  const template =
    (window.CONFIG && CONFIG.WHATSAPP_MESSAGE_TEMPLATE) ||
    "Olá! Tenho interesse no produto: {produto}.";
  const mensagem = template.replace("{produto}", nomeProduto);

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

function configurarWhatsappFlutuante() {
  const link = document.getElementById("floatingWhatsapp");
  const footerLink = document.getElementById("footerWhatsapp");
  const numeroBruto = (window.CONFIG && CONFIG.WHATSAPP_NUMBER) || "";
  const numero = formatarNumeroWhatsapp(numeroBruto);

  const mensagemGenerica = encodeURIComponent(
    "Olá! Vim pelo catálogo online e gostaria de mais informações."
  );
  const href = `https://wa.me/${numero}?text=${mensagemGenerica}`;

  if (link) link.href = href;
  if (footerLink) footerLink.href = href;
}

  // -----------------------------------------------------------------
  // MENU MOBILE
  // -----------------------------------------------------------------
  function configurarMenuMobile() {
    if (!menuToggle) return;
    menuToggle.addEventListener("click", () => {
      const aberto = headerTools.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(aberto));
    });
  }

  // -----------------------------------------------------------------
  // UTILITÁRIOS
  // -----------------------------------------------------------------
  function formatarPreco(valor) {
    const numero = Number(valor) || 0;
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
})();
