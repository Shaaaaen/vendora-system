# 🦀 Vendora System

A **Vendor Sales Management System** built with Python (Flask) for managing products, ingredients, sales, and forecasting.

---

## 📁 Project Structure

```
vendora-system/
│
├── py/                         # Python backend (Flask application)
│   ├── app.py                  # Main Flask app — routes, logic, server entry point
│   ├── evaluate_models.py      # Sales forecasting model evaluation
│   ├── seed_data.py            # Script to seed initial data into the database
│   ├── tempCodeRunnerFile.py   # Temporary file (can be ignored)
│   └── wmape.chart.py          # WMAPE (forecast accuracy) chart generation
│
├── static/                     # Frontend static assets
│   ├── assets/                 # Images and other media assets
│   ├── css/
│   │   ├── mainpage.css        # Styles for main pages
│   │   └── style.css           # Global stylesheet
│   └── js/
│       ├── add_ingredient.js   # Logic for adding ingredients
│       ├── add_products.js     # Logic for adding products
│       ├── add_sales.js        # Logic for recording sales
│       ├── bg.js               # Background/animation scripts
│       ├── dashboard.js        # Dashboard charts and stats
│       ├── login.js            # Login page logic
│       ├── main.js             # General shared JavaScript
│       └── signup.js           # Signup page logic
│
├── templates/                  # HTML templates (Jinja2 / Flask)
│   ├── components/
│   │   ├── footer.html         # Shared footer component
│   │   ├── header.html         # Shared header/navbar component
│   │   └── sidebar.html        # Sidebar navigation component
│   ├── main_pages/
│   │   ├── dashboard.html      # Main dashboard page
│   │   ├── forecast.html       # Sales forecast page
│   │   ├── ingredients.html    # Ingredient management page
│   │   ├── products.html       # Product management page
│   │   ├── sales.html          # Sales tracking page
│   │   └── settings.html       # User settings page
│   ├── base.html               # Base template (extended by all pages)
│   ├── login.html              # Login page
│   ├── reset_psw.html          # Reset password page
│   ├── security.html           # Security settings page
│   ├── signup.html             # Registration page
│   └── splash.html             # Splash / landing page
│
├── .gitattributes              # Git line ending settings
├── .gitignore                  # Files excluded from Git
├── Dockerfile                  # Docker configuration
├── Procfile                    # Process file (for deployment)
├── requirements.txt            # Python dependencies
└── README.md                   # Project documentation (this file)
```

---

## ⚙️ Prerequisites

Make sure you have the following installed before running the system:

- [Python 3.9+](https://www.python.org/downloads/)
- [pip](https://pip.pypa.io/en/stable/)
- (Optional) [Docker](https://www.docker.com/) — if running via Docker

---

## 🚀 How to Run the System (Locally)

### 1. Clone the Repository

```bash
git clone https://github.com/Shaaaaen/vendora-system.git
cd vendora-system
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Seed Initial Data (Optional)

If you want to populate the database with starter data:

```bash
python py/seed_data.py
```

### 4. Run the Flask App

```bash
python py/app.py
```

### 5. Open in Browser

Once the server is running, open your browser and go to:

```
http://127.0.0.1:5000
```

You will be greeted by the splash/login page. Create an account or log in to access the system.

---

## 🐳 How to Run with Docker (Optional)

### 1. Build the Docker Image

```bash
docker build -t vendora-system .
```

### 2. Run the Container

```bash
docker run -p 5000:5000 vendora-system
```

### 3. Open in Browser

```
http://localhost:5000
```

---

## 🖥️ System Pages

| Page | Description |
|------|-------------|
| **Splash** | Welcome / landing page |
| **Login / Signup** | User authentication |
| **Dashboard** | Overview of sales stats and charts |
| **Products** | Add and manage products |
| **Ingredients** | Track and manage ingredients |
| **Sales** | Record and view sales transactions |
| **Forecast** | View AI-generated sales forecast |
| **Settings** | Update profile and account settings |
| **Security** | Change password and security options |

---

## 📦 Key Dependencies

All dependencies are listed in `requirements.txt`. Main ones include:

- **Flask** — Web framework
- **Cloudinary** — Cloud image storage (for avatar/product images)
- Other libraries for forecasting and data processing

---

## 👥 Team

Developed as part of a vendor sales management project.
