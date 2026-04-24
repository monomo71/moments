# Moments: Client Photo Gallery

An open-source, self-hostable photo delivery platform for photographers. Built with a sleek, minimalist "Brutalist" design language (Wefactly-style). 

Moments allows you to create individual client galleries, customize their colors and typography, securely upload high-res photos, and give your clients a stunning branded experience where they can view, select, and instantly download their wedding or event photos as a ZIP.

## 🚀 Features
- **Admin Dashboard:** Secure login (`admin`/`admin` default) to create and manage client projects.
- **Client Branding:** Custom passwords, event dates, unlimited Web Fonts (Google Fonts), HEX background/accent colors per client.
- **High-Res Photo Engine:** Automatic on-the-fly WebP thumbnail generation using `sharp` for fast gallery load times, while keeping original files intact.
- **Client Experience:** Clients log in with just their password to a gorgeous masonry grid, full-screen lightbox, and instant bulk `.ZIP` downloads of their selections or the entire album.

## 🛠 Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Lucide React (Icons).
- **Backend:** Node.js, Express, Multer (File Uploads), Archiver (ZIP).
- **Database:** SQLite with Prisma ORM v6.

## 💻 Local Setup & Installation

### Requirements
- Node.js (v18+ recommended)
- npm or yarn

### 1. Clone & Install
Clone the repository to your local machine:
\`\`\`bash
git clone <your-repo-url>
cd moments
\`\`\`

### 2. Backend Setup
Navigate to the backend, install the dependencies, push the database schema, and start the development server:
\`\`\`bash
cd backend
npm install
npx prisma db push
npx tsx src/index.ts
\`\`\`
*The backend will run on \`http://localhost:4001\`.*

### 3. Frontend Setup
In a new terminal window, navigate to the frontend directory, install dependencies, and start the Vite environment:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
*The frontend will run on \`http://localhost:5176\` (or the nearest available port).*

### 4. Admin Access
Open your browser and navigate to the frontend URL (e.g. \`${window.location.origin}/admin/login\`).
- **Username:** `admin`
- **Password:** `simagu`

*Note: You can change the default credentials within the database or backend initialization logic.*

## 📸 Client Flow
1. Create a new client portal in the Admin Dashboard.
2. Customize the design settings (Title, Font, Colors) and setup a client password.
3. Drag & drop or browse to upload High-Resolution .JPGs. 
4. Provide the client with the login URL (`/client/login`) and their unique password.

## 📄 License
MIT License
