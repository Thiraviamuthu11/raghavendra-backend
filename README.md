# Raghavendra Automobiles — Backend

Express.js REST API for the Amaron Battery Dealer website.

## Project Structure

```
backend/
├── server.js              # Entry point
├── package.json
├── .env.example           # Copy to .env and fill in values
├── data/
│   └── batteries.js       # Product + compatibility data
└── routes/
    ├── products.js        # Battery listing & Battery Finder
    ├── cart.js            # Session-based cart
    ├── contact.js         # Contact form + email notification
    └── checkout.js        # Razorpay payment integration
```

## Quick Start

```bash
cd backend
npm install
cp .env.example .env       # Edit .env with your settings
npm run dev                # Development with auto-reload
# or
npm start                  # Production
```

Visit `http://localhost:3000` — serves the frontend HTML directly.

---

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | All batteries (optional `?type=bike\|car`) |
| GET | `/api/products/:id` | Single battery |
| GET | `/api/products/finder/compatibility` | Full compatibility map |
| GET | `/api/products/finder/result?vehicleType=car&brand=Maruti&model=Swift+Petrol` | Battery for a vehicle |

### Cart (session-based)
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | — | Get current cart |
| POST | `/api/cart/add` | `{ productId, qty? }` | Add item |
| PATCH | `/api/cart/update` | `{ productId, qty }` | Update quantity |
| DELETE | `/api/cart/remove/:productId` | — | Remove item |
| DELETE | `/api/cart/clear` | — | Empty cart |

### Contact
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/contact` | `{ fname, lname?, phone, email?, service?, message? }` | Submit enquiry |

### Checkout (Razorpay)
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/checkout/create-order` | — | Create Razorpay order from cart |
| POST | `/api/checkout/verify-payment` | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` | Verify payment |

### Misc
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

---

## Connecting the Frontend

In `index.html`, replace the hardcoded `submitContact()` and `checkout()` JS functions to call these API endpoints:

```js
// Example: submit contact form
async function submitContact() {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fname: document.getElementById('cf-fname').value,
      phone: document.getElementById('cf-phone').value,
    }),
  });
  const data = await res.json();
  showToast(data.message);
}

// Example: add to cart
async function addToCart(id) {
  const res = await fetch('/api/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ productId: id }),
  });
  const data = await res.json();
  showToast(data.message);
}
```

---

## Optional Upgrades

- **Database**: Replace the in-memory `batteries.js` array with MongoDB (mongoose) or PostgreSQL (pg/prisma)
- **Sessions**: Swap `MemoryStore` for `connect-mongo` (MongoDB) or `connect-redis`
- **Auth**: Add admin login with `passport` + `bcrypt` to manage inventory
- **Payments**: Fill in Razorpay keys in `.env` to go live
- **Email**: Add Gmail App Password or use SendGrid/Resend for reliable delivery
