function formatProductMessage(product) {
  return `
${product.name}
Precio: $${product.price}

${product.description}

Beneficios principales:
${product.benefits.map(benefit => `- ${benefit}`).join('\n')}

¿Interesado en comprarlo? ¡Escribe "comprar" para hacer tu pedido!
  `.trim();
}

module.exports = { formatProductMessage };