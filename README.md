# My AI School Tools

Your personal AI-powered study partner. This web application helps students learn more effectively by transforming their study materials into summaries, flashcards, and more.

## About The Project

In today's fast-paced academic world, students are often overwhelmed with dense reading materials, long lectures, and extensive notes. My AI School Tools was created to address this challenge. It's a modern web application that leverages the speed and power of AI to provide students with practical utilities for their daily study routines.

Instead of just reading text, you can now interact with it. Turn a lengthy chapter into a quick summary, automatically generate flashcards to test your knowledge, or get a daily dose of educational trivia. This project aims to make learning more efficient, interactive, and engaging.

### Key Features

*   **📚 AI Text Summarizer:** Paste in any text—from articles to lecture notes—and receive a concise summary highlighting the key points and a concluding paragraph. Perfect for quick reviews and grasping core concepts.
*   **📇 Automatic Flashcard Generator:** Transform your study materials into a set of digital flashcards. The AI automatically creates questions, answers, and even assigns a difficulty level ('easy', 'medium', 'hard') to help you focus your efforts.
*   **🧪 Formula Extractor (In Progress):** Pulls mathematical and scientific formulas from your text, rendering them clearly for easier study and review.
*   **💡 Daily Educational Fact:** Kickstart your curiosity with a random, interesting, and useful fact, with a focus on STEM fields.

### Built With

This project is a full-stack application built with modern web technologies.

*   **Frontend:** [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
*   **Backend:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
*   **AI Integration:** [Groq API](https://groq.com/) for high-speed language model inference.

---

## Getting Started (For Developers)

To get a local copy up and running, follow these steps.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   An API key from [GroqCloud](https://console.groq.com/keys)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd my-ai-school-tools
    ```
2.  **Install frontend dependencies:**
    ```sh
    npm install
    ```
3.  **Install backend dependencies:**
    ```sh
    cd server
    npm install
    ```

### Environment Configuration

The backend requires a `.env` file to store your API key and other settings.

1.  Navigate to the `server/` directory.
2.  Create a new file named `.env`.
3.  Add the following content, replacing the placeholder values:

    ```env
    # server/.env

    # Your API key from GroqCloud
    GROQ_API_KEY="your_groq_api_key_here"

    # The port for the backend server
    PORT=5000

    # The URL of the frontend for CORS
    FRONTEND_URL="http://localhost:5173"
    ```

## Running the Application

You will need two separate terminal windows to run both the frontend and backend.

1.  **Start the Backend Server:**
    ```sh
    # From the server/ directory
    npm start
    ```
    The API will be running on `http://localhost:5000`.

2.  **Start the Frontend Dev Server:**
    ```sh
    # From the project's root directory (my-ai-school-tools/)
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:5173`.

## Deployment & Hosting

This application is designed to be deployed as two separate services: a static frontend and a backend API server.

### Frontend (React + Vite)

The frontend is a static site that can be built using `npm run build`. The output in the `dist/` folder can be deployed to any static hosting provider.

*   **Recommended Platforms:** Vercel, Netlify, GitHub Pages

### Backend (Express.js)

The Node.js server can be hosted on any platform that supports Node.js applications.

*   **Recommended Platforms:** Render, Heroku, DigitalOcean

Remember to configure the `GROQ_API_KEY` and `FRONTEND_URL` environment variables in your hosting provider's settings to match your production environment.
