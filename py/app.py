import os
import uuid
import threading
import time
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
import mysql.connector
import bcrypt
from werkzeug.utils import secure_filename
from PIL import Image
from datetime import datetime, timedelta
from datetime import date as date_obj

# --- Setup ---
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
load_dotenv(os.path.join(project_root, '.env'))

template_dir = os.path.join(project_root, 'templates')
static_dir   = os.path.join(project_root, 'static')
UPLOAD_FOLDER      = os.path.join(project_root, 'static', 'assets', 'images', 'profile')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
CORS(app)

app.secret_key = os.environ.get('SECRET_KEY', 'fallback_secret')

# ── Session / cookie config ───────────────────────────────────
# FIX: These three lines make Remember Me work on Railway (HTTPS).
# Without SESSION_COOKIE_SECURE the browser silently drops the cookie
# after a page reload on an HTTPS origin. Without SESSION_COOKIE_SAMESITE
# the cross-site fetch from the login JS loses the session.
app.config['PERMANENT_SESSION_LIFETIME']  = timedelta(days=30)
app.config['SESSION_COOKIE_SECURE']       = True      # HTTPS only (Railway always HTTPS)
app.config['SESSION_COOKIE_SAMESITE']     = 'Lax'     # required for normal navigation
app.config['SESSION_COOKIE_HTTPONLY']     = True       # JS cannot read cookie (security)

# ── Cloudinary (avatar storage) ───────────────────────────────
# pip install cloudinary
# Add CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name to Railway env vars
# OR set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET separately
import cloudinary
import cloudinary.uploader
cloudinary.config(
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key    = os.environ.get('CLOUDINARY_API_KEY'),
    api_secret = os.environ.get('CLOUDINARY_API_SECRET'),
    secure     = True
)

# ── Background forecast cache ─────────────────────────────────
# FIX: Cache now stores all 3 horizons (3/7/12) in one entry.
# Switching range tabs just slices the cached array — no refit.
# { user_id: {'result': {...}, 'computed_at': float} }
_forecast_cache   = {}
_forecast_running = {}   # user_id -> True while background thread active
_forecast_lock    = threading.Lock()
FORECAST_TTL_SECS = 3600   # re-run if older than 1 hour

# ── Incremental model store ────────────────────────────────────
# Keeps trained XGBoost model + last-seen row count per user.
# On refit: if row count grew by <30%, warm-start from previous
# model instead of training from scratch — saves ~60-80% time.
# { user_id: {'xgb_model': XGBRegressor, 'trained_on': int, 'last_row_hash': str} }
_model_store      = {}
_model_store_lock = threading.Lock()
# Prophet window cap: never train on more than this many days.
# Older data adds almost no accuracy but multiplies fit time.
PROPHET_MAX_DAYS  = 365

# --- DB ---
def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        import urllib.parse
        parsed = urllib.parse.urlparse(database_url)
        return mysql.connector.connect(
            host=parsed.hostname,
            port=parsed.port or 3306,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path.lstrip('/')
        )
    return mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', '777'),
        database=os.environ.get('DB_NAME', 'vendora_db')
    )

# --- Context ---
@app.context_processor
def inject_user():
    user_id = session.get('user_id')
    if not user_id:
        return dict(user=None)
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.*, cur.currency_code, cur.symbol, IFNULL(cur.exchange_rate, 1.0) AS exchange_rate
        FROM users u
        LEFT JOIN currency cur ON u.currency_id = cur.currency_id
        WHERE u.user_id = %s
    """, (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return dict(user=user)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Public Pages ---
@app.route('/api/check_session')
def check_session():
    if session.get('user_id'):
        # FIX: was returning {"loggedIn": True} but login.js was checking data.logged_in
        # Keeping camelCase here AND fixing login.js to match — both consistent now
        return jsonify({"loggedIn": True})
    return jsonify({"loggedIn": False})

@app.route('/')
def splash():
    return render_template('splash.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/signup')
def signup_page():
    return render_template('signup.html')

@app.route('/security')
def security():
    return render_template('security.html')

# --- Auth API ---
@app.route('/api/signup', methods=['POST'])
def register():
    data              = request.json
    username          = data.get('username')
    email             = data.get('email')
    password          = data.get('password')
    security_key      = data.get('securityKey')
    security_question = data.get('securityQuestion')
    security_answer   = data.get('securityAnswer')
    currency_id       = 265
    role              = "Vendor"
    language          = "English"
    db     = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close(); db.close()
        return jsonify({"status": "fail", "message": "Email already exists"})
    hashed_pw     = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    hashed_answer = bcrypt.hashpw(security_answer.encode('utf-8'), bcrypt.gensalt())
    try:
        cursor.execute("""
            INSERT INTO users
            (currency_id, username, email, password, security_key, security_question, security_answer, role, language)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (currency_id, username, email, hashed_pw.decode('utf-8'),
              security_key, security_question, hashed_answer.decode('utf-8'), role, language))
        db.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        print(e)
        return jsonify({"status": "error"}), 500
    finally:
        cursor.close(); db.close()

@app.route('/api/login', methods=['POST'])
def login_api():
    data             = request.json
    email            = data.get('email')
    password_attempt = data.get('password')
    remember_me      = data.get('remember_me', False)

    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT user_id, password FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close(); conn.close()

    if user:
        stored_hash = user['password'].encode('utf-8')
        if bcrypt.checkpw(password_attempt.encode('utf-8'), stored_hash):
            session['user_id'] = user['user_id']
            if remember_me:
                session.permanent = True
            else:
                session.permanent = False

            # Pre-warm forecast cache in background
            uid = user['user_id']
            with _forecast_lock:
                cached = _forecast_cache.get(uid)
            needs_warmup = (
                cached is None or
                (time.time() - cached.get('computed_at', 0)) > FORECAST_TTL_SECS
            )
            if needs_warmup:
                with _forecast_lock:
                    already_running = _forecast_running.get(uid, False)
                if not already_running:
                    with _forecast_lock:
                        _forecast_running[uid] = True
                    t = threading.Thread(target=_background_forecast,
                                         args=(uid, 'MY'), daemon=True)
                    t.start()

            return jsonify({"status": "success"})

    return jsonify({"status": "fail"}), 401

# --- INGREDIENTS ROUTES ---
@app.route('/ingredients')
def ingredients():
    user_id = session.get('user_id')
    if not user_id:
        return redirect('/login')
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM ingredient WHERE user_id = %s", (user_id,))
    ingredients = cursor.fetchall()
    cursor.close(); conn.close()
    return render_template('main_pages/ingredients.html', header_title="My Business", ingredients=ingredients)

@app.route('/api/add_ingredient', methods=['POST'])
def add_ingredient():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"status": "error", "message": "Not logged in"}), 401
    data   = request.json
    conn   = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO ingredient
        (user_id, ingredient_name, unit, current_stock, target_stock, price_per_unit)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (user_id, data['ingredient_name'], data['unit'],
          data['current_stock'], data['target_stock'], data['price_per_unit']))
    conn.commit()
    cursor.close(); conn.close()
    return jsonify({"status": "success"})

@app.route('/api/edit_ingredient/<int:id>', methods=['PUT'])
def edit_ingredient(id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"status": "error", "message": "Not logged in"}), 401
    data = request.json
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE ingredient
            SET ingredient_name=%s, unit=%s, current_stock=%s, target_stock=%s, price_per_unit=%s
            WHERE ingredient_id=%s AND user_id=%s
        """, (data.get('ingredient_name'), data.get('unit'), data.get('current_stock'),
              data.get('target_stock'), data.get('price_per_unit'), id, user_id))
        conn.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close(); conn.close()

@app.route('/api/delete_ingredient/<int:id>', methods=['DELETE'])
def delete_ingredient(id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"status": "error"}), 401
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM product_ingredient WHERE ingredient_id = %s AND user_id = %s", (id, user_id))
        cursor.execute("DELETE FROM ingredient WHERE ingredient_id = %s AND user_id = %s", (id, user_id))
        conn.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close(); conn.close()

@app.route('/api/get_ingredients')
def get_ingredients():
    user_id = session.get('user_id')
    if not user_id: return jsonify([])
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT ingredient_id, ingredient_name, unit
        FROM ingredient WHERE user_id = %s ORDER BY ingredient_name
    """, (user_id,))
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(data)

@app.route('/api/get_low_stock')
def get_low_stock():
    user_id = session.get('user_id')
    if not user_id: return jsonify([])
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM ingredient WHERE user_id = %s
        AND target_stock > 0 AND current_stock < target_stock
        ORDER BY current_stock ASC
    """, (user_id,))
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(data)

# --- PRODUCT ROUTES ---
@app.route('/products')
def products():
    user_id = session.get('user_id')
    if not user_id: return redirect('/login')
    return render_template('main_pages/products.html', header_title="My Business")

@app.route('/api/add_product', methods=['POST'])
def add_product():
    user_id = session.get('user_id')
    if not user_id: return jsonify({"status": "error"}), 401
    data          = request.json
    product_name  = data.get('product_name')
    selling_price = data.get('selling_price')
    product_icon  = data.get('product_icon', '🍽️')
    ingredients   = data.get('ingredients', [])
    conn   = get_db_connection()
    cursor = conn.cursor()
    try:
        conn.start_transaction()
        cursor.execute("""
            INSERT INTO product (user_id, product_name, selling_price, product_icon)
            VALUES (%s, %s, %s, %s)
        """, (user_id, product_name, selling_price, product_icon))
        product_id = cursor.lastrowid
        for item in ingredients:
            cursor.execute("""
                INSERT INTO product_ingredient (product_id, ingredient_id, quantity_used, user_id)
                VALUES (%s, %s, %s, %s)
            """, (product_id, item['ingredient_id'], item['quantity_used'], user_id))
        conn.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error"}), 500
    finally:
        cursor.close(); conn.close()

@app.route('/api/get_products')
def get_products():
    user_id = session.get('user_id')
    if not user_id: return jsonify([])
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM product WHERE user_id = %s ORDER BY product_id DESC", (user_id,))
    products = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(products)

@app.route('/api/get_product_recipe/<int:product_id>')
def get_product_recipe(product_id):
    user_id = session.get('user_id')
    if not user_id: return jsonify([])
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT pi.*, i.ingredient_name, i.unit
        FROM product_ingredient pi
        JOIN ingredient i ON pi.ingredient_id = i.ingredient_id
        WHERE pi.product_id = %s AND pi.user_id = %s ORDER BY pi.ingredient_id
    """, (product_id, user_id))
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(data)

@app.route('/api/get_ingredients_full')
def get_ingredients_full():
    user_id = session.get('user_id')
    if not user_id: return jsonify([])
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT ingredient_id, ingredient_name, unit, price_per_unit, current_stock, target_stock
        FROM ingredient WHERE user_id = %s ORDER BY ingredient_name
    """, (user_id,))
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(data)

@app.route('/api/edit_product/<int:product_id>', methods=['PUT'])
def edit_product(product_id):
    user_id = session.get('user_id')
    if not user_id: return jsonify({"status": "error"}), 401
    data          = request.json
    product_name  = data.get('product_name')
    selling_price = data.get('selling_price')
    product_icon  = data.get('product_icon', '🍽️')
    ingredients   = data.get('ingredients', [])
    conn   = get_db_connection()
    cursor = conn.cursor()
    try:
        conn.start_transaction()
        cursor.execute("""
            UPDATE product SET product_name=%s, selling_price=%s, product_icon=%s
            WHERE product_id=%s AND user_id=%s
        """, (product_name, selling_price, product_icon, product_id, user_id))
        cursor.execute("DELETE FROM product_ingredient WHERE product_id=%s AND user_id=%s", (product_id, user_id))
        for item in ingredients:
            cursor.execute("""
                INSERT INTO product_ingredient (product_id, ingredient_id, quantity_used, user_id)
                VALUES (%s, %s, %s, %s)
            """, (product_id, item['ingredient_id'], item['quantity_used'], user_id))
        conn.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close(); conn.close()

@app.route('/api/delete_product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    user_id = session.get('user_id')
    if not user_id: return jsonify({"status": "error"}), 401
    conn   = get_db_connection()
    cursor = conn.cursor()
    try:
        conn.start_transaction()
        cursor.execute("DELETE FROM sale_item WHERE product_id=%s AND user_id=%s", (product_id, user_id))
        cursor.execute("DELETE FROM product_ingredient WHERE product_id=%s AND user_id=%s", (product_id, user_id))
        cursor.execute("DELETE FROM product WHERE product_id=%s AND user_id=%s", (product_id, user_id))
        conn.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close(); conn.close()

@app.route('/api/get_products_simple')
def get_products_simple():
    user_id = session.get('user_id')
    if not user_id: return jsonify([])
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT product_id, product_name, selling_price
        FROM product WHERE user_id=%s ORDER BY product_name
    """, (user_id,))
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(data)

# --- SALES ROUTES ---
@app.route('/sales')
def sales():
    return render_template('main_pages/sales.html', header_title="My Business")

@app.route('/api/record_sale', methods=['POST'])
def record_sale():
    user_id = session.get('user_id')
    if not user_id: return jsonify({"status": "error"}), 401
    data  = request.json
    items = data.get('items')
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        for item in items:
            pid = item['product_id']
            qty = item['quantity']
            cursor.execute("SELECT selling_price FROM product WHERE product_id=%s AND user_id=%s", (pid, user_id))
            product = cursor.fetchone()
            if not product: raise Exception("Product not found")
            total_price = product['selling_price'] * qty
            cursor.execute("""
                SELECT s.sale_id, si.quantity FROM sale s
                JOIN sale_item si ON s.sale_id = si.sale_id
                WHERE s.user_id=%s AND si.product_id=%s AND DATE(s.sale_date)=CURDATE()
            """, (user_id, pid))
            existing_sale = cursor.fetchone()
            if existing_sale:
                sale_id = existing_sale['sale_id']
                old_qty = existing_sale['quantity']
                diff    = qty - old_qty
                cursor.execute("UPDATE sale SET total_amount=%s WHERE sale_id=%s", (total_price, sale_id))
                cursor.execute("UPDATE sale_item SET quantity=%s WHERE sale_id=%s AND product_id=%s", (qty, sale_id, pid))
                cursor.execute("SELECT ingredient_id, quantity_used FROM product_ingredient WHERE product_id=%s", (pid,))
                for recipe in cursor.fetchall():
                    cursor.execute("""
                        UPDATE ingredient SET current_stock=current_stock-(%s)
                        WHERE ingredient_id=%s AND user_id=%s
                    """, (recipe['quantity_used'] * diff, recipe['ingredient_id'], user_id))
            else:
                cursor.execute("INSERT INTO sale (user_id, total_amount) VALUES (%s, %s)", (user_id, total_price))
                new_sale_id = cursor.lastrowid
                cursor.execute("INSERT INTO sale_item (sale_id, product_id, quantity, user_id) VALUES (%s,%s,%s,%s)",
                               (new_sale_id, pid, qty, user_id))
                cursor.execute("SELECT ingredient_id, quantity_used FROM product_ingredient WHERE product_id=%s", (pid,))
                for recipe in cursor.fetchall():
                    cursor.execute("""
                        UPDATE ingredient SET current_stock=current_stock-%s
                        WHERE ingredient_id=%s AND user_id=%s
                    """, (recipe['quantity_used'] * qty, recipe['ingredient_id'], user_id))
        conn.commit()
        # Invalidate forecast cache so next visit reflects new sales
        with _forecast_lock:
            _forecast_cache.pop(user_id, None)
        return jsonify({"status": "success"})
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)})
    finally:
        cursor.close(); conn.close()

@app.route('/api/record_historical_sale', methods=['POST'])
def record_historical_sale():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"status": "error", "message": "Not logged in"}), 401
    data         = request.json
    sale_date    = data.get('sale_date')
    total_profit = data.get('total_profit')
    items        = data.get('items', [])
    if not sale_date or total_profit is None:
        return jsonify({"status": "error", "message": "sale_date and total_profit are required"}), 400
    try:
        from datetime import datetime as dt
        dt.strptime(sale_date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid date format, use YYYY-MM-DD"}), 400
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute("""
            INSERT INTO sale (user_id, sale_date, total_amount) VALUES (%s, %s, %s)
        """, (user_id, sale_date, float(total_profit)))
        new_sale_id = cursor.lastrowid
        for item in items:
            pid = item.get('product_id')
            qty = item.get('quantity', 1)
            if pid:
                cursor.execute("""
                    INSERT INTO sale_item (sale_id, product_id, quantity, user_id) VALUES (%s,%s,%s,%s)
                """, (new_sale_id, pid, qty, user_id))
        conn.commit()
        with _forecast_lock:
            _forecast_cache.pop(user_id, None)
        return jsonify({"status": "success", "sale_id": new_sale_id})
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close(); conn.close()

@app.route('/api/get_today_recorded_products')
def get_today_recorded_products():
    user_id = session.get('user_id')
    if not user_id: return jsonify({})
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT si.product_id, si.quantity FROM sale s
        JOIN sale_item si ON s.sale_id = si.sale_id
        WHERE s.user_id=%s AND DATE(s.sale_date)=CURDATE()
    """, (user_id,))
    rows = cursor.fetchall()
    data = {row['product_id']: row['quantity'] for row in rows}
    cursor.close(); conn.close()
    return jsonify(data)

@app.route('/api/get_sales')
def get_sales():
    user_id = session.get('user_id')
    if not user_id: return jsonify([])
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM sale WHERE user_id=%s ORDER BY sale_date DESC", (user_id,))
    sales = cursor.fetchall()
    for s in sales:
        cursor.execute("""
            SELECT si.quantity, p.product_name FROM sale_item si
            JOIN product p ON si.product_id=p.product_id
            WHERE si.sale_id=%s AND si.user_id=%s
        """, (s['sale_id'], user_id))
        s['items'] = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(sales)

# --- DASHBOARD ROUTES ---
@app.route('/dashboard')
def dashboard():
    return render_template('main_pages/dashboard.html', header_title="Dashboard")

@app.route('/api/dashboard/today_stats')
def dashboard_today_stats():
    user_id = session.get('user_id')
    if not user_id: return jsonify({}), 401
    selected_date = request.args.get('date', str(date_obj.today()))
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT COALESCE(SUM(s.total_amount),0) AS revenue,
               COALESCE(SUM(si_t.qty),0) AS total_qty
        FROM sale s
        LEFT JOIN (SELECT sale_id, SUM(quantity) AS qty FROM sale_item WHERE user_id=%s GROUP BY sale_id) si_t
            ON s.sale_id=si_t.sale_id
        WHERE s.user_id=%s AND DATE(s.sale_date)=%s
    """, (user_id, user_id, selected_date))
    row       = cursor.fetchone()
    revenue   = float(row['revenue']   or 0)
    total_qty = int(row['total_qty']   or 0)
    cursor.execute("""
        SELECT COALESCE(SUM(si.quantity*pi.quantity_used*i.price_per_unit),0) AS cost
        FROM sale s
        JOIN sale_item si ON s.sale_id=si.sale_id
        JOIN product_ingredient pi ON si.product_id=pi.product_id AND pi.user_id=s.user_id
        JOIN ingredient i ON pi.ingredient_id=i.ingredient_id
        WHERE s.user_id=%s AND DATE(s.sale_date)=%s
    """, (user_id, selected_date))
    cost = float(cursor.fetchone()['cost'] or 0)
    cursor.close(); conn.close()
    return jsonify({'revenue': revenue, 'total_qty': total_qty, 'cost': round(cost, 2)})

@app.route('/api/dashboard/top_seller')
def dashboard_top_seller():
    user_id = session.get('user_id')
    if not user_id: return jsonify({'name': '—'})
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.product_name, SUM(si.quantity) AS total_qty
        FROM sale s JOIN sale_item si ON s.sale_id=si.sale_id
        JOIN product p ON si.product_id=p.product_id
        WHERE s.user_id=%s AND DATE(s.sale_date)=CURDATE()
        GROUP BY si.product_id, p.product_name ORDER BY total_qty DESC LIMIT 1
    """, (user_id,))
    row = cursor.fetchone()
    cursor.close(); conn.close()
    return jsonify({'name': row['product_name'] if row else '—'})

@app.route('/api/dashboard/monthly_sales')
def dashboard_monthly_sales():
    user_id = session.get('user_id')
    if not user_id: return jsonify({})
    year   = request.args.get('year', date_obj.today().year)
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT MONTH(sale_date) AS month, COALESCE(SUM(total_amount),0) AS revenue
        FROM sale WHERE user_id=%s AND YEAR(sale_date)=%s GROUP BY MONTH(sale_date)
    """, (user_id, year))
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify({row['month']: float(row['revenue']) for row in rows})

@app.route('/api/dashboard/weekly_sales')
def dashboard_weekly_sales():
    user_id = session.get('user_id')
    if not user_id: return jsonify({})
    year  = request.args.get('year',  date_obj.today().year)
    month = request.args.get('month', date_obj.today().month)
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT (DAYOFWEEK(sale_date)-1) AS dow, COALESCE(SUM(total_amount),0) AS revenue
        FROM sale WHERE user_id=%s AND YEAR(sale_date)=%s AND MONTH(sale_date)=%s GROUP BY dow
    """, (user_id, year, month))
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify({row['dow']: float(row['revenue']) for row in rows})

@app.route('/api/dashboard/product_sales')
def dashboard_product_sales():
    user_id = session.get('user_id')
    if not user_id: return jsonify([])
    year  = request.args.get('year',  date_obj.today().year)
    month = request.args.get('month', date_obj.today().month)
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.product_name,
               COALESCE(SUM(si.quantity),0) AS total_qty,
               COALESCE(SUM(si.quantity*p.selling_price),0) AS total_revenue
        FROM sale s JOIN sale_item si ON s.sale_id=si.sale_id
        JOIN product p ON si.product_id=p.product_id
        WHERE s.user_id=%s AND YEAR(s.sale_date)=%s AND MONTH(s.sale_date)=%s
        GROUP BY si.product_id, p.product_name ORDER BY total_qty DESC
    """, (user_id, year, month))
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify([{'product_name': r['product_name'], 'total_qty': int(r['total_qty']),
                     'total_revenue': float(r['total_revenue'])} for r in rows])

@app.route('/api/dashboard/expenses')
def get_expenses():
    user_id = session.get('user_id')
    if not user_id: return jsonify([])
    month  = request.args.get('month', date_obj.today().month)
    year   = request.args.get('year',  date_obj.today().year)
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT category, amount FROM expense WHERE user_id=%s AND month=%s AND year=%s",
                   (user_id, month, year))
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(rows)

@app.route('/api/dashboard/save_expense', methods=['POST'])
def save_expense():
    user_id = session.get('user_id')
    if not user_id: return jsonify({'status': 'error'}), 401
    data     = request.json
    category = data.get('category')
    amount   = float(data.get('amount', 0))
    month    = int(data.get('month', date_obj.today().month))
    year     = int(data.get('year',  date_obj.today().year))
    if category not in ('rental', 'fnb', 'other'):
        return jsonify({'status': 'error', 'message': 'Invalid category'}), 400
    conn   = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO expense (user_id, category, amount, month, year) VALUES (%s,%s,%s,%s,%s)
            ON DUPLICATE KEY UPDATE amount=VALUES(amount)
        """, (user_id, category, amount, month, year))
        conn.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        conn.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        cursor.close(); conn.close()

# --- FORECAST ROUTES ---
@app.route('/forecast')
def forecast():
    return render_template('main_pages/forecast.html', header_title="Forecast")

# --- SETTINGS ROUTES ---
@app.route('/settings')
def settings():
    user_id = session.get('user_id')
    if not user_id: return redirect('/login')
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.*, cur.currency_code, cur.symbol
        FROM users u LEFT JOIN currency cur ON u.currency_id=cur.currency_id
        WHERE u.user_id=%s
    """, (user_id,))
    user = cursor.fetchone()
    try:
        cursor.execute("SELECT *, IFNULL(exchange_rate, 1.0) AS exchange_rate FROM currency ORDER BY currency_code")
    except Exception:
        cursor.execute("SELECT *, 1.0 AS exchange_rate FROM currency ORDER BY currency_code")
    currencies = cursor.fetchall()
    cursor.close(); conn.close()
    return render_template('main_pages/settings.html', header_title="Settings",
                           user=user, currencies=currencies)

@app.route('/update_settings', methods=['POST'])
def update_settings():
    user_id = session.get('user_id')
    if not user_id: return jsonify({"status": "error", "message": "Not logged in"}), 401
    username    = request.form.get('username')
    currency_id = request.form.get('currency_id')
    fields = []; values = []
    if username:    fields.append("username=%s");    values.append(username)
    if currency_id: fields.append("currency_id=%s"); values.append(currency_id)
    if not fields:  return jsonify({"status": "error", "message": "No fields to update"})
    values.append(user_id)
    sql = f"UPDATE users SET {', '.join(fields)} WHERE user_id=%s"
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(sql, values)
        conn.commit()
        return jsonify({"status": "success", "message": "Settings saved successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": "Database update failed"}), 500
    finally:
        cursor.close(); conn.close()

# ── AVATAR UPLOAD (Cloudinary — survives Render restarts) ────
@app.route('/upload_avatar', methods=['POST'])
def upload_avatar():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"status": "error", "message": "Not logged in"}), 401

    file = request.files.get('avatar')
    if not file or file.filename == '':
        return jsonify({"status": "error", "message": "No file uploaded"}), 400
    if not allowed_file(file.filename):
        return jsonify({"status": "error", "message": "File type not allowed"}), 400

    # Validate it's a real image before uploading
    try:
        img = Image.open(file)
        img.verify()
        file.seek(0)
    except Exception:
        return jsonify({"status": "error", "message": "Invalid image file"}), 400

    try:
        # Upload to Cloudinary — overwrites previous avatar for same user
        result = cloudinary.uploader.upload(
            file,
            folder      = "vendora/avatars",
            public_id   = f"user_{user_id}",
            overwrite   = True,
            transformation = [{"width": 300, "height": 300, "crop": "fill", "gravity": "face"}]
        )
        avatar_url = result['secure_url']  # permanent HTTPS URL — never disappears
    except Exception as e:
        print("Cloudinary upload error:", e)
        return jsonify({"status": "error", "message": "Upload to cloud storage failed"}), 500

    # Save the full URL (not just filename) into the database
    try:
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET avatar=%s WHERE user_id=%s", (avatar_url, user_id))
        conn.commit()
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close(); conn.close()

    return jsonify({"status": "success", "avatar_url": avatar_url})

# --- CURRENCY ROUTES ---
@app.route('/api/migrate_exchange_rate')
def migrate_exchange_rate():
    conn   = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE currency ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(18,6) NOT NULL DEFAULT 1.000000")
        conn.commit()
        return jsonify({"status": "success", "message": "exchange_rate column ensured"})
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close(); conn.close()

@app.route('/api/get_currency_rate')
def get_currency_rate():
    user_id = session.get('user_id')
    if not user_id: return jsonify({"rate": 1.0})
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT cur.exchange_rate FROM users u
            JOIN currency cur ON u.currency_id=cur.currency_id WHERE u.user_id=%s
        """, (user_id,))
        row  = cursor.fetchone()
        rate = float(row['exchange_rate']) if row and row.get('exchange_rate') else 1.0
        return jsonify({"rate": rate})
    except Exception:
        return jsonify({"rate": 1.0})
    finally:
        cursor.close(); conn.close()

@app.route('/api/update_currency_rate', methods=['POST'])
def update_currency_rate():
    user_id = session.get('user_id')
    if not user_id: return jsonify({"status": "error"}), 401
    data          = request.json
    currency_id   = data.get('currency_id')
    exchange_rate = data.get('exchange_rate')
    if not currency_id or exchange_rate is None:
        return jsonify({"status": "error", "message": "currency_id and exchange_rate required"}), 400
    conn   = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE currency SET exchange_rate=%s WHERE currency_id=%s",
                       (float(exchange_rate), int(currency_id)))
        conn.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close(); conn.close()

@app.route('/api/sync_exchange_rates', methods=['POST'])
def sync_exchange_rates():
    import urllib.request, json as json_lib
    try:
        url = "https://open.er-api.com/v6/latest/MYR"
        with urllib.request.urlopen(url, timeout=8) as response:
            data = json_lib.loads(response.read().decode())
        if data.get('result') != 'success':
            return jsonify({"status": "error", "message": "API returned failure"}), 502
        rates = data.get('rates', {})
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT currency_id, currency_code FROM currency")
        currencies = cursor.fetchall()
        updated = 0; skipped = []
        for cur in currencies:
            code = cur['currency_code'].strip().upper()
            if code in rates:
                cursor.execute("UPDATE currency SET exchange_rate=%s WHERE currency_id=%s",
                               (float(rates[code]), cur['currency_id']))
                updated += 1
            else:
                skipped.append(code)
        conn.commit()
        cursor.close(); conn.close()
        return jsonify({"status": "success", "updated": updated, "skipped": skipped,
                        "source": "open.er-api.com", "base": "MYR",
                        "next_update": data.get('time_next_update_utc', 'unknown')})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# CORE FORECAST ENGINE
# FIX: Always computes 12 days (max). Tab switching just slices.
# FIX: Replaced LSTM (TensorFlow, ~500MB) with XGBoost (~5MB).
# ─────────────────────────────────────────────────────────────
def _run_forecast_engine(user_id, country_code='MY'):
    import pandas as pd
    import numpy as np
    import holidays as hol_lib
    from datetime import timedelta, datetime as dt

    FORECAST_DAYS = 12   # Always predict max; frontend slices [0:3], [0:7], [0:12]

    # Fetch daily sales
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT DATE(sale_date) AS ds, SUM(total_amount) AS y
        FROM sale WHERE user_id=%s GROUP BY DATE(sale_date) ORDER BY ds
    """, (user_id,))
    rows = cursor.fetchall()
    cursor.close(); conn.close()

    if len(rows) < 7:
        return {'status': 'no_data', 'message': 'Need at least 7 days of sales data.',
                'rows': len(rows)}

    df_full = pd.DataFrame(rows)
    df_full['ds'] = pd.to_datetime(df_full['ds'])
    df_full['y']  = df_full['y'].astype(float)
    df_full = df_full.sort_values('ds').drop_duplicates('ds').reset_index(drop=True)

    full_range = pd.date_range(df_full['ds'].min(), df_full['ds'].max(), freq='D')
    df_full = df_full.set_index('ds').reindex(full_range, fill_value=0).reset_index()
    df_full.columns = ['ds', 'y']

    N_total = len(df_full)   # true total row count — used for incremental check
    today   = pd.Timestamp(dt.today().date())

    # ── Prophet window cap: cap training to last PROPHET_MAX_DAYS ──────
    # Accuracy plateaus after ~1 year of daily data; older rows just slow fit.
    # XGBoost uses all rows (it's fast regardless) for better lag features.
    if N_total > PROPHET_MAX_DAYS:
        df = df_full.iloc[-PROPHET_MAX_DAYS:].copy().reset_index(drop=True)
    else:
        df = df_full.copy()

    N     = len(df)     # windowed length — used by Prophet/fold logic
    df_xgb = df_full.copy()  # XGBoost always sees full history

    CLOSING_THRESHOLD = 0.90
    LOW_SALES_PCT     = 0.05
    LOOKBACK_DAYS     = min(28, max(7, N // 4))
    WINDOW_SIZE       = min(14, max(7, N // 10))
    EVALUATION_PERIOD = min(7, max(3, N // 10))

    if N >= 200:
        N_FOLDS = 5; FOLD_STRIDE = 30
    elif N >= 90:
        N_FOLDS = 4; FOLD_STRIDE = 14
    elif N >= 30:
        N_FOLDS = 3; FOLD_STRIDE = 7
    else:
        N_FOLDS = 2; FOLD_STRIDE = max(3, (N - EVALUATION_PERIOD - WINDOW_SIZE) // 3)

    years = sorted(set(df['ds'].dt.year.tolist() + [(today + timedelta(days=FORECAST_DAYS)).year]))
    try:
        h_lib = hol_lib.country_holidays(country_code, years=years)
    except Exception:
        h_lib = {}
    hol_ts = {pd.Timestamp(k): v for k, v in h_lib.items()}

    prophet_hols_df = pd.DataFrame(
        [{'ds': ts, 'holiday': nm.replace(' ', '_')} for ts, nm in hol_ts.items()]
    ) if hol_ts else pd.DataFrame(columns=['ds', 'holiday'])
    if not prophet_hols_df.empty:
        prophet_hols_df['ds'] = pd.to_datetime(prophet_hols_df['ds'])

    def add_payday(frame):
        frame = frame.copy()
        frame['ds']        = pd.to_datetime(frame['ds'])
        frame['is_payday'] = frame['ds'].dt.day.apply(lambda d: 1 if d >= 25 or d <= 5 else 0)
        return frame

    def detect_closing_days(df_train_raw):
        cutoff = df_train_raw['ds'].max() - timedelta(days=LOOKBACK_DAYS)
        recent = df_train_raw[df_train_raw['ds'] >= cutoff].copy()
        recent['is_zero'] = (recent['y'] == 0).astype(int)
        summary = recent.groupby(recent['ds'].dt.dayofweek)['is_zero'].mean()
        return summary[summary >= CLOSING_THRESHOLD].index.tolist()

    def calc_metrics(y_true, y_pred):
        y_true = np.array(y_true, dtype=float)
        y_pred = np.clip(np.array(y_pred, dtype=float), 0, None)
        mae    = float(np.mean(np.abs(y_true - y_pred)))
        rmse   = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
        mask   = y_true > 0
        if mask.sum() == 0:
            return {'wmape_open': 1.0, 'mae': round(mae, 2), 'rmse': round(rmse, 2), 'accuracy': 0.0}
        yt, yp     = y_true[mask], y_pred[mask]
        wmape_open = float(np.sum(np.abs(yt - yp)) / (np.sum(yt) + 1e-8))
        accuracy   = round(max(0.0, min(100.0, (1 - wmape_open) * 100)), 1)
        return {'wmape_open': round(wmape_open, 4), 'mae': round(mae, 2),
                'rmse': round(rmse, 2), 'accuracy': accuracy}

    MIN_TRAIN    = max(WINDOW_SIZE + EVALUATION_PERIOD, 14)
    fold_indices = []
    for i in range(N_FOLDS, 0, -1):
        s = N - i * FOLD_STRIDE
        e = s + EVALUATION_PERIOD
        if s >= MIN_TRAIN and e <= N:
            fold_indices.append((s, e))
    if not fold_indices:
        s = max(MIN_TRAIN, N - EVALUATION_PERIOD - 1)
        e = s + EVALUATION_PERIOD
        if e <= N:
            fold_indices = [(s, e)]

    # Prophet fold runner
    def run_prophet_fold(s, apply_rules):
        from prophet import Prophet
        df_train_raw = df.iloc[:s].copy()
        df_test      = df.iloc[s:s + EVALUATION_PERIOD].copy()
        df_clean     = df_train_raw.copy()
        if len(df_clean) > 30:
            df_clean = df_clean[df_clean['y'] >= df_clean['y'].quantile(LOW_SALES_PCT)]
        df_train = add_payday(df_clean)
        cp_scale = 0.05 if len(df_train) < 60 else 0.15
        m = Prophet(
            seasonality_mode        = 'additive' if len(df_train) < 60 else 'multiplicative',
            changepoint_prior_scale = cp_scale,
            holidays_prior_scale    = 10,
            daily_seasonality       = False,
            weekly_seasonality      = len(df_train) >= 14,
            yearly_seasonality      = len(df_train) >= 90,
            holidays = prophet_hols_df if (not prophet_hols_df.empty and len(df_train) >= 30) else None,
        )
        if len(df_train) >= 14:
            fourier_order = min(3, max(1, len(df_train) // 20))
            m.add_seasonality(name='weekly_custom', period=7, fourier_order=fourier_order, prior_scale=10)
        m.add_regressor('is_payday')
        m.fit(df_train)
        future   = m.make_future_dataframe(periods=EVALUATION_PERIOD, freq='D', include_history=False)
        future   = add_payday(future)
        forecast = m.predict(future)
        if apply_rules:
            closing = detect_closing_days(df_train_raw)
            mask    = forecast['ds'].dt.dayofweek.isin(closing)
            forecast.loc[mask, ['yhat', 'yhat_lower', 'yhat_upper']] = 0
        bt = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].merge(
            df_test[['ds', 'y']], on='ds', how='left').fillna(0)
        bt['yhat'] = bt['yhat'].clip(lower=0)
        return bt, calc_metrics(bt['y'], bt['yhat'])

    # XGBoost fold runner — uses full history for better lag features
    def run_xgb_fold(s):
        from xgboost import XGBRegressor
        df_feat = df_xgb.copy()
        df_feat['is_payday']  = df_feat['ds'].dt.day.apply(lambda d: 1 if d >= 25 or d <= 5 else 0)
        df_feat['dow']        = df_feat['ds'].dt.dayofweek
        df_feat['is_holiday'] = df_feat['ds'].apply(lambda d: 1 if pd.Timestamp(d) in hol_ts else 0)
        df_feat['lag_1']      = df_feat['y'].shift(1).fillna(0)
        df_feat['lag_7']      = df_feat['y'].shift(7).fillna(0)
        df_feat['roll_7']     = df_feat['y'].rolling(7, min_periods=1).mean()
        FEATURES = ['is_payday', 'dow', 'is_holiday', 'lag_1', 'lag_7', 'roll_7']
        train = df_feat.iloc[:s]
        test  = df_feat.iloc[s:s + EVALUATION_PERIOD]
        if len(train) < 10:
            raise ValueError("Not enough training data for XGBoost")
        # ── Incremental warm-start ──────────────────────────────────
        # If we have a previous model trained on similar data,
        # warm-start from it: only 30 new estimators instead of 100.
        # This cuts refit time by ~70% when data grows incrementally.
        with _model_store_lock:
            stored = _model_store.get(user_id)
        prev_n = stored['trained_on'] if stored else 0
        use_warmstart = (
            stored is not None and
            prev_n > 0 and
            abs(len(train) - prev_n) / max(prev_n, 1) < 0.30  # <30% new data
        )
        if use_warmstart:
            mdl = stored['xgb_model']
            mdl.set_params(n_estimators=mdl.n_estimators + 30)
            mdl.fit(train[FEATURES], train['y'],
                    xgb_model=mdl.get_booster(),
                    eval_set=[(test[FEATURES], test['y'])],
                    verbose=False)
        else:
            mdl = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1,
                               subsample=0.8, verbosity=0, random_state=42)
            mdl.fit(train[FEATURES], train['y'])
        preds = np.clip(mdl.predict(test[FEATURES]), 0, None)
        return test, calc_metrics(test['y'].values, preds), mdl, df_feat, FEATURES

    _empty_m = {'wmape_open': 1.0, 'mae': 0.0, 'rmse': 0.0, 'accuracy': 0.0}
    h_metrics = []; p_metrics = []; x_metrics = []
    last_xgb_bundle = None
    use_xgb = N >= 20   # XGBoost works with less data than LSTM needed

    for s, e in fold_indices:
        try:
            _, mh = run_prophet_fold(s, apply_rules=True);  h_metrics.append(mh)
        except Exception: h_metrics.append(_empty_m.copy())
        try:
            _, mp = run_prophet_fold(s, apply_rules=False); p_metrics.append(mp)
        except Exception: p_metrics.append(_empty_m.copy())
        if use_xgb:
            try:
                _, mx, mdl, df_feat, FEATURES = run_xgb_fold(s)
                x_metrics.append(mx); last_xgb_bundle = (mdl, df_feat, FEATURES)
            except Exception: x_metrics.append(_empty_m.copy())

    def avg_m(ml):
        if not ml: return _empty_m.copy()
        return {k: round(float(np.mean([m[k] for m in ml if k in m])), 4) for k in ml[0]}

    p_avg = avg_m(p_metrics)
    h_avg = avg_m(h_metrics)
    x_avg = avg_m(x_metrics) if x_metrics else _empty_m.copy()

    # ── Persist trained XGBoost model for next incremental run ──
    if last_xgb_bundle is not None:
        mdl_to_save, _, _ = last_xgb_bundle
        with _model_store_lock:
            _model_store[user_id] = {
                'xgb_model':  mdl_to_save,
                'trained_on': N_total,
            }

    # Generate actual future forecasts (12 days)
    from prophet import Prophet
    def prophet_future(apply_rules):
        df_clean = df.copy()
        if len(df_clean) > 30:
            df_clean = df_clean[df_clean['y'] >= df_clean['y'].quantile(LOW_SALES_PCT)]
        df_train = add_payday(df_clean)
        cp_scale = 0.05 if len(df_train) < 60 else 0.15
        m = Prophet(
            seasonality_mode='additive' if len(df_train) < 60 else 'multiplicative',
            changepoint_prior_scale=cp_scale, holidays_prior_scale=10,
            daily_seasonality=False, weekly_seasonality=len(df_train) >= 14,
            yearly_seasonality=len(df_train) >= 90,
            holidays=prophet_hols_df if (not prophet_hols_df.empty and len(df_train) >= 30) else None,
        )
        if len(df_train) >= 14:
            fourier_order = min(3, max(1, len(df_train) // 20))
            m.add_seasonality(name='weekly_custom', period=7, fourier_order=fourier_order, prior_scale=10)
        m.add_regressor('is_payday')
        m.fit(df_train)
        future = m.make_future_dataframe(periods=FORECAST_DAYS, freq='D', include_history=False)
        future = add_payday(future)
        fc     = m.predict(future)
        if apply_rules:
            closing = detect_closing_days(df)
            mask    = fc['ds'].dt.dayofweek.isin(closing)
            fc.loc[mask, ['yhat', 'yhat_lower', 'yhat_upper']] = 0
        return [{'date': str(r['ds'].date()), 'predicted': round(max(0, r['yhat']), 2),
                 'lower': round(max(0, r['yhat_lower']), 2), 'upper': round(max(0, r['yhat_upper']), 2)}
                for _, r in fc.iterrows()]

    try:    prophet_result = prophet_future(apply_rules=False)
    except: prophet_result = []
    try:    hybrid_result  = prophet_future(apply_rules=True)
    except: hybrid_result  = []

    # XGBoost future forecast
    xgb_result  = []
    xgb_skipped = not use_xgb or last_xgb_bundle is None
    if not xgb_skipped:
        try:
            mdl, df_feat, FEATURES = last_xgb_bundle
            # Build feature rows for future dates — use full history for accurate lags
            hist = df_xgb.copy()
            future_rows = []
            for fi in range(FORECAST_DAYS):
                fd = today + timedelta(days=fi)
                lag_1 = float(hist['y'].iloc[-1]) if len(hist) >= 1 else 0.0
                lag_7 = float(hist['y'].iloc[-7]) if len(hist) >= 7 else 0.0
                roll7 = float(hist['y'].iloc[-7:].mean()) if len(hist) >= 7 else float(hist['y'].mean())
                row = {
                    'is_payday':  1 if fd.day >= 25 or fd.day <= 5 else 0,
                    'dow':        fd.weekday(),
                    'is_holiday': 1 if pd.Timestamp(fd) in hol_ts else 0,
                    'lag_1':      lag_1,
                    'lag_7':      lag_7,
                    'roll_7':     roll7,
                }
                future_rows.append(row)
                pred_val = float(np.clip(mdl.predict(pd.DataFrame([row])[FEATURES])[0], 0, None))
                new_row  = pd.DataFrame([{'ds': pd.Timestamp(fd), 'y': pred_val,
                                           'is_payday': row['is_payday'], 'dow': row['dow'],
                                           'is_holiday': row['is_holiday']}])
                hist = pd.concat([hist, new_row], ignore_index=True)

            future_df  = pd.DataFrame(future_rows)[FEATURES]
            preds      = np.clip(mdl.predict(future_df), 0, None)
            xgb_result = [{'date': str((today + timedelta(days=i)).date()),
                           'predicted': round(float(v), 2)} for i, v in enumerate(preds)]
        except Exception as ex:
            xgb_skipped = True
            print("XGBoost future error:", ex)

    # Winner selection
    candidates = {'prophet': p_avg['wmape_open'], 'hybrid': h_avg['wmape_open']}
    if not xgb_skipped and xgb_result:
        candidates['xgb'] = x_avg['wmape_open']
    winner      = min(candidates, key=candidates.get)
    best_result = {'prophet': prophet_result, 'hybrid': hybrid_result,
                   'xgb': xgb_result}.get(winner, prophet_result)

    # Low stock warnings
    low_stock = []
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT AVG(total_amount) as avg_rev FROM sale
            WHERE user_id=%s AND sale_date>=DATE_SUB(CURDATE(),INTERVAL 30 DAY)
        """, (user_id,))
        avg_daily = float((cursor.fetchone() or {}).get('avg_rev') or 0)
        cursor.execute("""
            SELECT ingredient_name, unit, current_stock, target_stock
            FROM ingredient WHERE user_id=%s AND target_stock>0
        """, (user_id,))
        total_fc  = sum(r['predicted'] for r in (best_result or []))
        scale     = max(0.5, min((total_fc / (avg_daily * FORECAST_DAYS)) if avg_daily > 0 else 1.0, 3.0))
        for ing in cursor.fetchall():
            need = float(ing['target_stock']) * FORECAST_DAYS * scale
            if need > float(ing['current_stock']):
                low_stock.append({'ingredient_name': ing['ingredient_name'], 'unit': ing['unit'],
                                  'current_stock': float(ing['current_stock']),
                                  'projected_need': round(need, 2),
                                  'shortage': round(need - float(ing['current_stock']), 2)})
        cursor.close(); conn.close()
    except Exception: pass

    recent = [{'date': str(r['ds'].date()), 'actual': round(float(r['y']), 2)}
              for _, r in df[df['ds'] >= (today - timedelta(days=2))].iterrows()]

    return {
        'status': 'ok', 'winner': winner,
        'xgb_skipped': xgb_skipped, 'total_rows': N_total,
        'prophet': {'predictions': prophet_result, 'metrics': p_avg},
        'hybrid':  {'predictions': hybrid_result,  'metrics': h_avg},
        'xgb':     {'predictions': xgb_result,     'metrics': x_avg},
        'best_predictions': best_result,
        'recent_actuals':   recent,
        'low_stock_warnings': low_stock,
    }


def _background_forecast(user_id, country_code='MY'):
    try:
        result = _run_forecast_engine(user_id, country_code)
        with _forecast_lock:
            _forecast_cache[user_id] = {'result': result, 'computed_at': time.time()}
    except Exception as e:
        print(f"Background forecast error for user {user_id}: {e}")
        with _forecast_lock:
            _forecast_cache[user_id] = {
                'result': {'status': 'error', 'message': str(e)},
                'computed_at': time.time()
            }
    finally:
        with _forecast_lock:
            _forecast_running.pop(user_id, None)


# ─────────────────────────────────────────────────────────────
# FORECAST API
# FIX: cache stores all 12 days; tabs just slice — no refit
# ─────────────────────────────────────────────────────────────
@app.route('/api/forecast')
def api_forecast():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Not logged in'}), 401

    try:    days = int(request.args.get('days', 7))
    except: days = 7
    days = min(max(days, 1), 12)   # clamp to 1–12
    country_code = request.args.get('country', 'MY').upper()

    with _forecast_lock:
        cached  = _forecast_cache.get(user_id)
        running = _forecast_running.get(user_id, False)

        # Return cached result (slice to requested days) if fresh
        if cached and (time.time() - cached.get('computed_at', 0)) < FORECAST_TTL_SECS:
            result = dict(cached['result'])
            # Slice all prediction arrays to requested horizon — no recompute needed
            for key in ('prophet', 'hybrid', 'xgb'):
                if key in result and isinstance(result.get(key, {}).get('predictions'), list):
                    result[key] = dict(result[key])
                    result[key]['predictions'] = result[key]['predictions'][:days]
            if isinstance(result.get('best_predictions'), list):
                result['best_predictions'] = result['best_predictions'][:days]
            result['days']           = days
            result['from_cache']     = True
            result['cache_age_mins'] = round((time.time() - cached['computed_at']) / 60, 1)
            return jsonify(result)

        if running:
            return jsonify({'status': 'computing',
                            'message': 'Forecast is being computed, please wait…'})

        _forecast_running[user_id] = True

    t = threading.Thread(target=_background_forecast,
                         args=(user_id, country_code), daemon=True)
    t.start()
    return jsonify({'status': 'computing',
                    'message': 'Forecast started, computing in background…'})


@app.route('/api/forecast/refresh', methods=['POST'])
def api_forecast_refresh():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Not logged in'}), 401
    country_code = (request.json or {}).get('country', 'MY').upper()
    with _forecast_lock:
        _forecast_cache.pop(user_id, None)
    t = threading.Thread(target=_background_forecast, args=(user_id, country_code), daemon=True)
    t.start()
    return jsonify({'status': 'ok', 'message': 'Forecast refresh started in background.'})


@app.route('/api/import_sales_csv', methods=['POST'])
def import_sales_csv():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Not logged in'}), 401
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file uploaded.'}), 400
    file = request.files['file']
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'status': 'error', 'message': 'Only .csv files are accepted.'}), 400
    try:
        import pandas as pd, io
        content = file.read().decode('utf-8-sig')
        df = pd.read_csv(io.StringIO(content))
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        date_aliases    = ['date', 'ds', 'sale_date', 'day', 'transaction_date', 'order_date']
        revenue_aliases = ['revenue', 'total_sales', 'total_amount', 'amount', 'sales',
                           'y', 'daily_revenue', 'price', 'net_sales', 'gross_sales', 'income', 'turnover']
        date_col = next((c for c in date_aliases    if c in df.columns), None)
        rev_col  = next((c for c in revenue_aliases if c in df.columns), None)
        if not date_col or not rev_col:
            return jsonify({'status': 'error', 'message': f'Columns found: {df.columns.tolist()}. Need date + revenue columns.'}), 400
        df_import = df[[date_col, rev_col]].copy()
        df_import.columns = ['date', 'revenue']
        df_import['date']    = pd.to_datetime(df_import['date'], errors='coerce')
        df_import['revenue'] = pd.to_numeric(df_import['revenue'], errors='coerce')
        df_import = df_import.dropna(subset=['date', 'revenue'])
        df_import = df_import[df_import['revenue'] > 0]
        df_import['date'] = df_import['date'].dt.date
        df_import = df_import.groupby('date', as_index=False)['revenue'].sum()
        if len(df_import) == 0:
            return jsonify({'status': 'error', 'message': 'No valid rows found after parsing.'}), 400
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT DATE(sale_date) AS d FROM sale WHERE user_id=%s", (user_id,))
        existing = {str(r['d']) for r in cursor.fetchall()}
        imported = skipped = errors = 0
        for _, row in df_import.iterrows():
            d = str(row['date'])
            if d in existing:
                skipped += 1; continue
            try:
                cursor.execute("INSERT INTO sale (user_id, sale_date, total_amount) VALUES (%s,%s,%s)",
                               (user_id, d, float(row['revenue'])))
                imported += 1
            except Exception:
                errors += 1
        conn.commit()
        cursor.close(); conn.close()
        with _forecast_lock:
            _forecast_cache.pop(user_id, None)
        t = threading.Thread(target=_background_forecast, args=(user_id, 'MY'), daemon=True)
        t.start()
        return jsonify({'status': 'ok', 'imported': imported, 'skipped': skipped, 'errors': errors,
                        'total': len(df_import),
                        'message': f'Imported {imported} rows. Forecast updating in background.'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# --- RESET PASSWORD ROUTES ---
@app.route('/reset_password')
def reset_password_page():
    return render_template('reset_psw.html')

@app.route('/api/reset/verify_email', methods=['POST'])
def reset_verify_email():
    email = request.json.get('email', '').strip()
    if not email: return jsonify({"status": "fail", "message": "Email is required"}), 400
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT user_id, security_key FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close(); conn.close()
    if not user: return jsonify({"status": "fail", "message": "Email not found"}), 404
    session['reset_email'] = email
    return jsonify({"status": "success", "security_key": user['security_key']})

@app.route('/api/reset/verify_security_key', methods=['POST'])
def reset_verify_security_key():
    confirmed = request.json.get('confirmed', False)
    if not session.get('reset_email'): return jsonify({"status": "fail", "message": "Session expired"}), 401
    if not confirmed:
        session.pop('reset_email', None)
        return jsonify({"status": "fail", "message": "Security key not recognised"})
    session['reset_key_verified'] = True
    return jsonify({"status": "success"})

@app.route('/api/reset/get_security_question', methods=['GET'])
def reset_get_security_question():
    email = session.get('reset_email')
    if not email or not session.get('reset_key_verified'): return jsonify({"status": "fail", "message": "Unauthorised"}), 401
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT security_question FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close(); conn.close()
    if not user: return jsonify({"status": "fail", "message": "User not found"}), 404
    return jsonify({"status": "success", "security_question": user['security_question']})

@app.route('/api/reset/verify_security_answer', methods=['POST'])
def reset_verify_security_answer():
    email = session.get('reset_email')
    if not email or not session.get('reset_key_verified'): return jsonify({"status": "fail", "message": "Unauthorised"}), 401
    answer = request.json.get('answer', '').strip()
    if not answer: return jsonify({"status": "fail", "message": "Answer is required"}), 400
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT security_answer FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close(); conn.close()
    if not user: return jsonify({"status": "fail", "message": "User not found"}), 404
    if bcrypt.checkpw(answer.encode('utf-8'), user['security_answer'].encode('utf-8')):
        session['reset_answer_verified'] = True
        return jsonify({"status": "success"})
    return jsonify({"status": "fail", "message": "Incorrect answer"}), 401

@app.route('/api/reset/update_password', methods=['POST'])
def reset_update_password():
    email = session.get('reset_email')
    if not email or not session.get('reset_key_verified') or not session.get('reset_answer_verified'):
        return jsonify({"status": "fail", "message": "Unauthorised"}), 401
    new_password = request.json.get('password', '').strip()
    if not new_password or len(new_password) < 6:
        return jsonify({"status": "fail", "message": "Password must be at least 6 characters"}), 400
    hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    conn   = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET password=%s WHERE email=%s", (hashed_pw.decode('utf-8'), email))
        conn.commit()
        for k in ('reset_email', 'reset_key_verified', 'reset_answer_verified'):
            session.pop(k, None)
        return jsonify({"status": "success"})
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close(); conn.close()

# --- LOGOUT ---
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login_page'))

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False, threaded=True)
