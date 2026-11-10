
export interface Product {
  readonly id: number;
  readonly name: string;
  readonly priceCents: number;
}

export interface CartItem {
  readonly productId: number;
  readonly quantity: number;
}


export interface CheckoutLine {
  readonly product: Product;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export interface CheckoutSummary {
  readonly lines: readonly CheckoutLine[];
  readonly subtotalCents: number;
  readonly discountPercent: number;
  readonly discountCents: number;
  readonly totalCents: number;
}
