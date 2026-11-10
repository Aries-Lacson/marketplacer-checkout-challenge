# Marketplacer Checkout Challenge

A command-line shopping cart application built with TypeScript and Node.js. It loads products from a JSON catalog, manages cart quantities, and calculates checkout totals using tiered percentage discounts.

## Requirements

- Node.js 22
- npm

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Aries-Lacson/marketplacer-checkout-challenge.git
cd marketplacer-checkout-challenge
```

Install dependencies:

```bash
npm ci
```

Start the application:

```bash
npm run dev
```

Alternatively, build and run the compiled application:

```bash
npm run build
npm start
```

Run these commands from the repository root so the application can locate `data/products.json`.

## Features

- List available products and prices
- Add products to the shopping cart
- Add multiple quantities of a product
- Update quantities or remove products
- View the cart with calculated totals
- Apply the highest eligible discount
- Display a checkout summary
- Handle invalid input without terminating the session

## Discount Rules

Discounts are based on the subtotal before any discount is applied.

| Subtotal | Discount |
|---|---|
| $20.00 or less | 0% |
| Greater than $20.00 | 10% |
| Greater than $50.00 | 15% |
| Greater than $100.00 | 20% |

Only the highest eligible discount is applied.

For example, a cart containing one of each supplied product has:

- Subtotal: $204.56
- Discount: 20%
- Discount amount: $40.91
- Final total: $163.65

## Application Structure

```text
src/
├── domain/
│   ├── types.ts
│   ├── money.ts
│   ├── shopping-cart.ts
│   ├── promotion-engine.ts
│   └── checkout-service.ts
├── infrastructure/
│   └── json-product-catalog.ts
├── cli/
│   └── menu.ts
└── index.ts
```

The application separates business logic from terminal interaction.

- **Product catalog:** Loads and validates product data.
- **Shopping cart:** Manages product IDs and quantities.
- **Promotion engine:** Evaluates discount thresholds.
- **Checkout service:** Calculates line totals, subtotal, discount, and final total.
- **CLI:** Handles user interaction and displays results.

## Design Decisions

### Integer-based money calculations

Product prices are converted from decimal strings into integer cents. This avoids common floating-point precision problems in monetary calculations.

Discount calculations use integer arithmetic with a documented half-up rounding rule.

### Separation of responsibilities

Cart state, discount eligibility, checkout calculation, and terminal interaction are implemented independently.

The checkout engine can be tested without starting the CLI or accessing the terminal.

### Configurable promotions

The promotion engine accepts configurable discount tiers, allowing thresholds and percentages to change without modifying the checkout service.

### In-memory cart

Cart contents are maintained in memory. Persistence is intentionally omitted because the challenge does not require user accounts, saved carts, or database integration.

## Testing

Run the complete test suite:

```bash
npm test
```

Run TypeScript checks:

```bash
npm run typecheck
```

Run ESLint:

```bash
npm run lint
```

Build the application:

```bash
npm run build
```

Run all four checks before submitting changes.

The tests cover:

- Price parsing and formatting
- Product catalog validation
- Cart operations and quantity management
- Discount thresholds and rounding
- Checkout calculations
- Integration with the provided JSON catalog
- Interactive CLI behavior and invalid input recovery

## Assumptions

- Product prices are nonnegative USD amounts.
- Discounts apply to the entire pre-discount subtotal.
- Discount thresholds use strictly greater-than comparisons.
- Only one discount tier applies.
- Discount amounts are rounded to the nearest cent using half-up rounding.
- Tax, shipping, inventory, payments, and persistence are outside the challenge scope.
- The application is run from the repository root.

## Technology

TypeScript, Node.js, Vitest, and ESLint.
