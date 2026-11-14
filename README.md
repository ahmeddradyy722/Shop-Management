# Shop Management

An online shop with a manager dashboard. The project consists of an Angular frontend, a Node.js/Express API server, and a MongoDB database.

The interface supports English and Arabic. Customers can browse and search products, save favorites, manage a cart, and place orders through Stripe. Managers can manage products, categories, inventory, and orders.

## Project structure

- `backend/`: Express server, API routes, MongoDB models, email and payment configuration.
- `shop-frontend/`: Angular storefront and manager dashboard.

## Requirements

- Node.js and npm.
- MongoDB running locally or an accessible MongoDB connection string.
- Stripe test keys to complete checkout from the storefront.
- SMTP configuration is optional and is used to send order confirmation emails.

## Setup and run

### 1. Configure the backend

From the project directory:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

On macOS or Linux, use `cp .env.example .env` instead of `Copy-Item`.

Open `backend/.env` and configure the following values:

| Variable | Purpose |
| --- | --- |
| `PORT` | Server port; defaults to `3000`. |
| `MONGO_URI` | MongoDB connection string. The default uses a local database named `shop_management`. |
| `JWT_SECRET` | A long, random secret used to sign manager login tokens. Change it before deployment. |
| `JWT_EXPIRES_IN` | Manager token lifetime; defaults to `1d`. |
| `MANAGER_EMAIL` and `MANAGER_PASSWORD` | Credentials for the manager account created by the seed command. Use a strong password. |
| `FRONTEND_URL` | Frontend URL; defaults to `http://localhost:4200`. |
| `STRIPE_SECRET_KEY` | Stripe secret key. Use a test key during development. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret; required to update payment status after a successful payment. |
| `SMTP_HOST` and `SMTP_PORT` | SMTP server host and port. Leave unset to disable confirmation emails. |
| `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS` | Optional SMTP connection and authentication settings. |
| `MAIL_FROM` | Sender name and address shown in confirmation emails. |

Never commit or share `.env` files, passwords, or real Stripe keys.

With MongoDB running and the environment configured, create the manager account and sample data:

```powershell
npm run seed
```

The command creates the manager account if it does not exist. It adds sample categories and products only if the database has no categories. The manager credentials are the values configured in `MANAGER_EMAIL` and `MANAGER_PASSWORD`.

Start the backend in the same terminal:

```powershell
npm run dev
```

The server runs at `http://localhost:3000` by default. To check that it is available, open `http://localhost:3000/api/health`. It should return:

```json
{ "status": "ok" }
```

### 2. Configure the frontend

Open a second terminal from the project directory:

```powershell
cd shop-frontend
npm install
npm start
```

Open `http://localhost:4200` in your browser. The frontend currently uses `http://localhost:3000/api` for API requests, and the backend allows requests from `http://localhost:4200` by default.

### 3. Configure Stripe payments

The checkout page uses Stripe Checkout, so a valid `STRIPE_SECRET_KEY` is required. To test payment status updates:

1. Add your Stripe test keys to `backend/.env`.
2. Install and run Stripe CLI, then forward Stripe events to the backend:

   ```powershell
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

3. Copy the `whsec_...` value printed by the command to `STRIPE_WEBHOOK_SECRET`, then restart the backend.

After payment or cancellation, Stripe redirects the customer back to the checkout page. The backend sets the payment status to `paid` after receiving a valid `checkout.session.completed` event. Do not use test keys or development credentials in production.

### 4. Configure email (optional)

The backend sends a confirmation email to the address provided by the customer when SMTP is configured. Example local Mailpit settings:

```env
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM="My Shop <no-reply@shop.local>"
```

Start Mailpit before placing an order, then check the inbox at `http://localhost:8025`. If email is unavailable, the order may still be saved, but the confirmation email will not be sent.

## Using the application

### Storefront pages

| Route | Page |
| --- | --- |
| `/` | Browse products, search, and filter by category. |
| `/items/:id` | View product details. |
| `/favorites` | View favorited products. |
| `/cart` | Review and update the cart. |
| `/buy` | Enter customer details and complete checkout. |

Favorites and cart contents are stored in the browser's `localStorage`; they are not automatically shared across browsers or devices.

### Manager dashboard

Sign in at `/admin/login` with the manager credentials from the environment file. The dashboard lets managers manage categories, products, and stock quantities; review orders; update order status; and add notes. Routes under `/admin` require authentication.

Order statuses are `opened` and `closed`. Payment statuses are `pending`, `paid`, and `failed`. The public API does not expose exact stock quantities; it only indicates whether an item is in stock. Exact quantities are available in the manager interface.

## API overview

All routes below are prefixed with `/api`. Admin routes require a JWT in the `Authorization: Bearer <token>` header.

### Public routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Check server health. |
| `GET` | `/categories` | List categories. |
| `GET` | `/items` | List products; use `search` to search or `category` to filter. |
| `GET` | `/items/:id` | Get a product by ID. |
| `POST` | `/items/by-ids` | Retrieve products by their IDs. |
| `POST` | `/orders` | Create an order directly without Stripe; requires customer and item details. |
| `POST` | `/payments/create-checkout-session` | Create an order and Stripe Checkout session; used by the storefront checkout page. |
| `POST` | `/payments/webhook` | Receive Stripe events; called by Stripe, not directly by the browser. |

Customer details include name, phone number, and email; address is optional. Each order item includes `itemId` and `quantity`. The backend checks stock and calculates the total using product data stored in the database.

### Authentication and admin routes

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/login` | Sign in as a manager and receive a JWT. |
| `GET`, `POST` | `/admin/items` | List or create products. |
| `GET`, `PUT`, `DELETE` | `/admin/items/:id` | Get, update, or delete a product. |
| `POST` | `/admin/uploads/image` | Upload a product image in the `image` form field. |
| `POST` | `/admin/categories` | Create a category. |
| `PUT`, `DELETE` | `/admin/categories/:id` | Update or delete a category. A category with products cannot be deleted. |
| `GET` | `/admin/orders` | List orders; filter using `status`. |
| `GET`, `PATCH` | `/admin/orders/:id` | Get an order, update its status, or add a note. |

## Tests and production build

Backend API tests require the server to be running, MongoDB to be available, and a manager account to be seeded:

```powershell
cd backend
npm run test:api
```

To build the frontend for production:

```powershell
cd shop-frontend
npm run build
```

## Troubleshooting

- **Cannot connect to MongoDB:** Make sure MongoDB is running and `MONGO_URI` is correct.
- **Manager login fails:** Check `MANAGER_EMAIL` and `MANAGER_PASSWORD`, then run `npm run seed`.
- **The frontend cannot reach the API:** Make sure the backend is running on port `3000` and the frontend on port `4200`.
- **Checkout cannot start:** Check that `STRIPE_SECRET_KEY` is a valid Stripe key.
- **Payment status is not updated:** Make sure Stripe CLI is running and `STRIPE_WEBHOOK_SECRET` matches the secret it displays.
- **Confirmation email was not received:** Check the SMTP settings. Email is optional and does not prevent an order from being saved.
"# Shop-Management" 
