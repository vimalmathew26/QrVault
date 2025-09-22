
# QRVault

A full-stack web application for creating, scanning, and managing QR codes. This project demonstrates a modern web development workflow using Next.js for both frontend and backend logic, with a MongoDB database for persistent storage.

---

## Features

* QR Code Generation: Create QR codes from any URL or text data.
* Customization: Apply custom foreground and background colors to generated codes with a live preview.
* QR Code Scanning: Scan codes using the device's camera or by uploading an image file.
* Persistent History: All generated and scanned codes are saved to a central "Vault".
* Data Management: Search, sort, and filter your entire QR code history.
* Record Editing: Update the labels of generated codes or the notes on scanned codes via an interactive modal.

---

## Tech Stack

* Core Framework: Next.js (App Router)
* Backend: Next.js API Routes & Server Actions
* Database: MongoDB
* ODM: Mongoose (for schema validation and database interaction)
* Styling: Tailwind CSS
* Component Library: Shadcn/UI
* QR Code Generation: qrcode library
* QR Code Scanning: qr-scanner library
* Validation: Zod
* Deployment: Vercel

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

You must have the following installed on your local machine:

* Node.js (v18 or later recommended)
* npm or yarn
* A MongoDB database instance (you can get a free cluster from MongoDB Atlas).

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/qrvault.git
cd qrvault
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

The application requires a connection string to your MongoDB database.

Create a file named `.env.local` in the root of the project.
Add your MongoDB connection string to this file, like so:

```env
MONGODB_URI="your_mongodb_connection_string_goes_here"
```

Replace the placeholder with the actual URI provided by MongoDB Atlas.
This file is ignored by Git to keep your credentials secure.

---

### 4. Run the Application

#### Production Build (recommended)

```bash
npm run build
npm start
```

#### Development Server (slower, for development only)

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

---

## Functionality in Detail

### The Vault (Dashboard)

* Central hub with tabs for "Generated" and "Scanned" code histories.
* Real-time search filtering by label, note, or data.
* Sorting options by date or alphabetically.

### QR Code Generation

* **Path**: `/create`
* Input text/URL → live preview.
* Customizable colors.
* Saves validated data to MongoDB via Server Actions.

### QR Code Scanning

* **Path**: `/scan`
* Two methods:

  * Camera scanning via live video feed.
  * Image upload decoding.
* Saves decoded results and optional notes to MongoDB.

### Record Management and Editing

* Each record card opens a modal with detailed QR info.
* Users can update labels/notes inline.
* Changes saved via `findByIdAndUpdate`, with instant dashboard refresh.

