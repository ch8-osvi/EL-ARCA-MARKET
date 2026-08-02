/**
 * Utilidades financieras precisas para El Arca Market.
 * Evita errores de precisión de coma flotante en JavaScript.
 * Maneja internamente los montos como enteros en centavos / unidades menores.
 */

/**
 * Convierte un monto decimal (ej. 12.50) a centavos (1250).
 */
export function toCents(amount: number): number {
  return Math.round((amount || 0) * 100);
}

/**
 * Convierte centavos (1250) a monto decimal (12.50).
 */
export function fromCents(cents: number): number {
  return (cents || 0) / 100;
}

/**
 * Formatea un valor numérico como moneda según la configuración local de El Arca Market.
 */
export function formatMoney(
  amount: number,
  symbol: string = "$",
  decimals: number = 2
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formatted = safeAmount.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol} ${formatted}`;
}

/**
 * Multiplica un precio unitario por una cantidad manteniendo precisión.
 */
export function multiplyMoney(price: number, quantity: number): number {
  const priceInCents = toCents(price);
  const totalCents = Math.round(priceInCents * quantity);
  return fromCents(totalCents);
}

/**
 * Suma un arreglo de valores monetarios con precisión.
 */
export function sumMoney(amounts: number[]): number {
  const totalCents = amounts.reduce((acc, curr) => acc + toCents(curr), 0);
  return fromCents(totalCents);
}

/**
 * Resta dos montos (a - b) con precisión.
 */
export function subtractMoney(a: number, b: number): number {
  return fromCents(toCents(a) - toCents(b));
}

/**
 * Calcula el porcentaje de ganancia bruta / margen sobre la venta.
 * gananciaBruta = (ingresoNeto - costo)
 * margen = (gananciaBruta / ingresoNeto) * 100
 */
export function calculateGrossMargin(ingresoNeto: number, costo: number): number {
  if (!ingresoNeto || ingresoNeto <= 0) return 0;
  const ganancia = subtractMoney(ingresoNeto, costo);
  return Math.round((ganancia / ingresoNeto) * 10000) / 100;
}

/**
 * Calcula el recargo sobre costo (Markup).
 * markup = (gananciaBruta / costo) * 100
 */
export function calculateMarkup(ingresoNeto: number, costo: number): number {
  if (!costo || costo <= 0) return 0;
  const ganancia = subtractMoney(ingresoNeto, costo);
  return Math.round((ganancia / costo) * 10000) / 100;
}
