# Sanket Kokate - 3D Interactive Portfolio

Welcome to the source code for my interactive 3D developer portfolio! This project is a highly modern, fully interactive web experience that combines stunning 3D visuals with **real-time multiplayer features**. When visitors browse the site, they can see other live users, chat with them, and interact with the environment together.

## 🌟 Key Features

* **Real-time Multiplayer Presence**: See the live cursors of other people currently browsing the portfolio at the exact same time.
* **Live Floating Reactions**: Click anywhere to send a burst of emojis that bubble up on the screens of every other active visitor instantly!
* **Live Global Chat**: A real-time chatroom built right into the interface so visitors can say hello to each other (or leave a message for me).
* **3D Visuals & Environments**: Built with React Three Fiber to render beautiful, lightweight 3D scenes directly in the browser.
* **Modern UI/UX**: Designed with sleek Tailwind CSS, glassmorphism aesthetics, Framer Motion animations, and responsive layouts.
* **Functional Contact Form**: Direct email integration powered by the Resend API to ensure I never miss a message.

## 🛠️ Technology Stack

**Frontend:**
* [Next.js 14](https://nextjs.org/) (App Router)
* [React](https://react.dev/)
* [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
* [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
* [Socket.io-client](https://socket.io/)

**Backend (Multiplayer Engine):**
* [Node.js](https://nodejs.org/)
* [Express.js](https://expressjs.com/)
* [Socket.io](https://socket.io/) (WebSockets)

**Third-Party Services:**
* [Resend](https://resend.com/) (Email API)
* Hosted on [Vercel](https://vercel.com) (Frontend) and [Render](https://render.com) (Backend)

---

## 🚀 Getting Started (Local Development)

This repository is split into two parts: the **Frontend** (`3d-portfolio-main`) and the **Multiplayer Backend** (`multiplayer-backend`). To run the full experience locally, you need to run both.

### 1. Start the Multiplayer Backend
The backend handles the WebSocket connections for live cursors, chat, and reactions.

```bash
# Navigate to the backend folder
cd multiplayer-backend

# Install dependencies
npm install

# Start the socket server (runs on port 3001)
npm start
```
*You should see `Socket.IO Server listening on port 3001` in your terminal.*

### 2. Configure Frontend Environment Variables
Before starting the frontend, you need to set up your environment variables.

1. Navigate to the frontend folder: `cd 3d-portfolio-main`
2. Create a file named `.env.local` in this folder.
3. Add the following variables to it:

```env
# Points the frontend to your local backend server
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Your API key from Resend (https://resend.com) to make the Contact Form work
RESEND_API_KEY=re_YourResendKeyHere
```

### 3. Start the Frontend
With the backend running and environment variables set, you can start the Next.js app.

```bash
# Ensure you are in the frontend folder
cd 3d-portfolio-main

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 
*Tip: Open a second incognito window or use your phone to see the live multiplayer cursors and reactions in action!*

---

## 🤝 Contributing & Customizing
If you want to use this template for your own portfolio, feel free to fork the repository! 
Make sure to update the `src/data/config.ts` file with your own personal details, social links, and email address (which must match the email you use to sign up for Resend).

## 📄 License
This project is open-source and available under the MIT License.
