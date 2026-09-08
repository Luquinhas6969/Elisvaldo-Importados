/**
 * config.js
 * -----------------------------------------------------------------------
 * ÚNICO lugar onde você precisa editar o número de WhatsApp da loja e
 * outras configurações gerais do catálogo.
 * -----------------------------------------------------------------------
 */

const CONFIG = {
  // Número do WhatsApp da loja, no formato internacional, SOMENTE DÍGITOS.
  // Exemplo: 55 (Brasil) + DDD (99) + número (999999999)
  WHATSAPP_NUMBER: "5563984143781",

  // Mensagem enviada ao WhatsApp quando o cliente clica em "Comprar".
  // {produto} será substituído automaticamente pelo nome do produto.
  WHATSAPP_MESSAGE_TEMPLATE: "Olá! Tenho interesse no produto: {produto}.",

  // Caminho do arquivo com os produtos do catálogo.
  PRODUTOS_JSON_PATH: "data/produtos.json",

  // Nome da loja (exibido no header e no rodapé).
  STORE_NAME: "Nego Importados",

  // URL do backend (usado pela ferramenta de importação em admin/).
  // Se o backend rodar localmente na porta padrão, não precisa alterar.
  BACKEND_URL: "http://localhost:3000",
};

// Impede que o objeto seja alterado acidentalmente em outros arquivos.
Object.freeze(CONFIG);
