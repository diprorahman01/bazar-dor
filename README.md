# 🛒 বাজার দর | BazarDor

### Smart Grocery Price Tracker for Bangladesh

**BazarDor (বাজার দর)** is a modern grocery price tracking web application designed for people in Bangladesh. It helps users check daily grocery prices, monitor price changes, and compare products across different categories.

The application provides a simple, responsive, and user-friendly interface with Bengali language support, making everyday grocery price information easy to understand.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Next.js 16 | Full-stack React framework with App Router |
| React | Building interactive user interfaces |
| TypeScript | Type-safe application development |
| Tailwind CSS v4 | Responsive UI styling |
| DaisyUI | UI components and design utilities |
| MongoDB Atlas | Cloud database for user information |
| Better Auth | Authentication and session management |
| Google OAuth | Google account sign-in |
| GitHub OAuth | GitHub account sign-in |
| REST API | Fetching grocery product and price data |
| Vercel | Deployment platform |

---

## ✨ 5 Key Features

### 1. 📊 Daily Grocery Price Tracking
- View updated grocery product prices.
- Check prices in Bangladeshi Taka (৳).
- Display prices and product information in Bengali.
- View price changes compared with previous prices.

### 2. 📂 Category-Based Product Browsing
- Browse products by grocery categories.
- Explore rice, lentils, oil, vegetables, fish, meat, and other essentials.
- View product details, prices, and units.
- Navigate easily between categories and individual products.

### 3. ↕️ Product Price Sorting
Sort grocery products using three options:
- **ডিফল্ট** — Default product order.
- **দাম: কম থেকে বেশি** — Lowest price to highest.
- **দাম: বেশি থেকে কম** — Highest price to lowest.

The sorting system supports Bengali numerals and compares actual numeric prices.

### 4. 🔐 Secure User Authentication
- Create an account using email and password.
- Sign in with Google.
- Sign in with GitHub.
- Manage user sessions using Better Auth.
- Store account information securely using MongoDB Atlas.

### 5. 👤 User Profile and Responsive Experience
- View personal profile information.
- Update the user's display name.
- Sign out securely.
- Enjoy a responsive layout across mobile, tablet, and desktop devices.
- See loading skeletons while product information is being fetched.

---

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account
- Google OAuth credentials (for Google login)
- GitHub OAuth credentials (for GitHub login)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

**2. Navigate to the project**

```bash
cd YOUR_REPOSITORY
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure environment variables**

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_secure_auth_secret
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

Never commit `.env` or real credentials to GitHub.

**5. Start the development server**

```bash
npm run dev
```

**6. Open the application**

Visit `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```text
bazar-dor/
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── api/
│   │   ├── category/
│   │   │   └── [slug]/
│   │   ├── product/
│   │   │   └── [slug]/
│   │   ├── profile/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   └── lib/
├── package.json
└── README.md
```

---

## 🌐 Deployment

The application is designed for deployment on **Vercel**.

To deploy:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables.
4. Update the OAuth callback URLs for the production domain.
5. Deploy the application.

---

## 📌 Project Information

**Project Name:** বাজার দর (BazarDor)  
**Project Type:** Grocery Price Tracking Web Application  
**Language:** Bengali (বাংলা)  
**Framework:** Next.js  
**Database:** MongoDB Atlas

---

### Made with ❤️ for Bangladesh