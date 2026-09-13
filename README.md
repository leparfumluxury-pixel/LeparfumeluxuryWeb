# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## Razorpay website review

Set these in `.env` before you submit the live site. They appear on Contact Us, the footer, and policy pages:

```
BUSINESS_EMAIL=your-real-inbox@domain.com
BUSINESS_PHONE=+91XXXXXXXXXX
```

Legal name and the Bengaluru shop address live in `app/config/business.ts`.

After you deploy on **HTTPS**, submit in the Razorpay Dashboard (Account & Settings → Business website details):

| Field | Path |
| --- | --- |
| Website URL | your live domain |
| About us | `/about` |
| Contact us | `/contact` |
| Pricing details | `/pricing` |
| Terms and conditions | `/terms` |
| Privacy policy | `/privacy` |
| Shipping policy | `/shipping` |
| Cancellation and refunds | `/refunds` |

Also upload a sample invoice (PNG, JPG, or PDF). Checkout does not require a customer login.

Keep test keys until Razorpay approves the site. Then replace `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` with live values and point the webhook to `/api/webhooks/razorpay`.

---

Built with ❤️ using React Router.
