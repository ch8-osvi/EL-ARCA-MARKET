import { describe, it, expect } from "vitest";
import { toCents, fromCents, multiplyMoney, calculateGrossMargin } from "../lib/money";

describe("Pruebas Unitarias de Cálculos Financieros", () => {
  it("debe convertir decimales a centavos y viceversa sin errores de flotantes", () => {
    expect(toCents(12.5)).toBe(1250);
    expect(fromCents(1250)).toBe(12.5);
  });

  it("debe multiplicar precio por cantidad con precisión monetaria", () => {
    expect(multiplyMoney(1.5, 3)).toBe(4.5);
    expect(multiplyMoney(0.8, 10)).toBe(8.0);
  });

  it("debe calcular el margen bruto en porcentaje", () => {
    // Venta: $100, Costo: $60 => Ganancia: $40 => Margen: 40%
    expect(calculateGrossMargin(100, 60)).toBe(40);
  });
});
