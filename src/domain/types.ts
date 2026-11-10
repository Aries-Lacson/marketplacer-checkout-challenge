
export interface Product {
  readonly id: number;
  readonly name: string;
  readonly priceCents: number;
}

export interface CartItem {
  readonly productId: number;
  readonly quantity: number;
}
