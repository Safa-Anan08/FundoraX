# FundoraX — Crowdfunding Platform

FundoraX is a next-generation MERN crowdfunding platform built with **Next.js 16 (App Router)**, **TypeScript**, **Node.js**, **Express**, and **MongoDB**. It features a credit-based funding ecosystem, Stripe Test Mode payment processing, Google OAuth 2.0 integration, role-based authorization (`Supporter`, `Creator`, `Admin`), creator payout withdrawal workflows, and real-time notification alerts.

---

## 🌐 Live Production URLs & Repositories

* **Frontend Live Application:** [https://fundorax-iota.vercel.app](https://fundorax-iota.vercel.app)
* **Backend Live API:** [https://fundorax-server.onrender.com](https://fundorax-server.onrender.com)
* **Client GitHub Repository:** [https://github.com/Safa-Anan08/FundoraX](https://github.com/Safa-Anan08/FundoraX)
* **Server GitHub Repository:** [https://github.com/Safa-Anan08/FundoraX-Server](https://github.com/Safa-Anan08/FundoraX-Server)

---

## 🔑 Demo Login Credentials

For testing and auditing all role-specific features, use the following credentials:

| Role | Email | Password | Initial Credits |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@fundorax.com` | `admin123` | 10,000 Credits |
| **Creator** | `creator@fundorax.com` | `creator123` | 20 Credits |
| **Supporter** | `supporter@fundorax.com` | `supporter123` | 50 Credits |

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Lucide Icons, Swiper.js, React Hot Toast, Axios
* **Backend:** Node.js, Express 5, MongoDB / Mongoose, JWT (JSON Web Tokens), bcryptjs, Cookie-Parser, CORS
* **Authentication:** JWT Token Auth & Google OAuth 2.0 Redirect Flow
* **Payments & Financials:** Stripe API (PaymentIntents & Idempotent Raw Webhook Verification)
* **Image Hosting:** ImgBB API Integration
* **Hosting & Deployment:** Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

---

## ✨ Key Feature Bullet Points

1. **Authentication & Google OAuth 2.0:** Secure JWT authentication supporting email/password registration and Google OAuth redirect login. Business rules enforce that new Google users strictly receive the `Supporter` role and 50 initial credits.
2. **Backend Role-Based Access Control (RBAC):** `verifyToken` and `authorizeRoles('Supporter', 'Creator', 'Admin')` middleware enforced on Express API routes, independent of frontend page guards.
3. **Credit-Based Crowdfunding Engine:** Supporters receive 50 initial credits upon sign-up; Creators receive 20 credits. Credits are assigned strictly once per account creation.
4. **Stripe Test Mode Integration:** Purchase credit packages (100 credits / $10, 300 credits / $25, 800 credits / $60, 1500 credits / $110). Server validates pricing; Stripe Webhooks verify raw signatures and enforce idempotency by transaction ID.
5. **Campaign Creation & ImgBB Uploads:** Creators can submit campaigns with minimum pledge rules, deadline tracking, category selection, and cover image uploads via ImgBB API.
6. **Contribution Pledge & Approval Workflow:** Supporters pledge credits to active approved campaigns. Creators review pledges in their dashboard to approve (adding to campaign raised amount) or reject (refunding supporter credits).
7. **Creator Withdrawal Payout System:** Payout conversion rate of 20 raised credits = $1 USD ($10 USD / 200 credits minimum). Automated validation checks available credits and locks payout requests pending Admin processing.
8. **Admin Control & Moderation Queues:** System Admins can review pending campaign applications, authorize withdrawal payouts, manage user roles, delete accounts, and view platform financial statistics.
9. **Automatic Contributor Refund Loop:** Deleting a campaign automatically refunds all approved credit contributions back to supporters' wallets with instant notification alerts.
10. **Campaign Flagging & Audit Reports:** Supporters can report suspicious campaigns with detailed reasons. Admins review audit reports and can suspend violating campaigns (`status = suspended`).
11. **Real-Time Notification System:** Floating navigation popup with unread badge counter alerting users to pledge approvals, rejections, payouts, and campaign status changes.
12. **Responsive SaaS Dashboard Layout:** Fully responsive layout with mobile drawer navigation, backdrop overlays, statistics cards, and data tables with horizontal scroll protection.

---

## ⚙️ Environment Variables Setup

Create environment files using the templates below. **Do NOT commit `.env` or `.env.local` files to Git.**

### Frontend Environment Variables (`fundorax-client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key_here
```

### Backend Environment Variables (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fundorax?retryWrites=true&w=majority
JWT_SECRET=your_jwt_super_secret_key_here
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## 🚀 Local Installation & Setup Guide

### 1. Clone the Repositories
```bash
git clone https://github.com/Safa-Anan08/FundoraX.git fundorax-client
git clone https://github.com/Safa-Anan08/FundoraX-Server.git server
```

### 2. Setup & Run Backend (`server`)
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`. On first run, it automatically seeds initial database records (Admin, Creator, Supporter, sample campaigns).

### 3. Setup & Run Frontend (`fundorax-client`)
```bash
cd ../fundorax-client
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Build & Verification Commands

### Frontend Production Build
```bash
npm run build
```

### Backend Server Health Check
```bash
curl http://localhost:5000/api/health
```

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).
