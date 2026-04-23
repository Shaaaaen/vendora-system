// Redirect if user is already logged in
fetch("/api/check_session", { credentials: "include" })
  .then(response => response.json())
  .then(data => {
    if (data.logged_in) {
      window.location.href = "/ingredients"; // Redirect to main page
    }
  })
  .catch(err => {
    // If error occurs, just let user stay on login page
    console.log("Session check failed:", err);
  });

let currentLang = "en";

const translations = {
  en: {
    loginTitle: "Login",
    emailLabel: "Email",
    passwordLabel: "Password",
    email: "example@gmail.com",
    password: "Enter your password here...",
    rememberMe: "Remember me",
    forgot: "Forgot Password?",
    loginBtn: "Login",
    noAccount: "Don't have an account yet?",
    register: "Register for free",
    loginError: "Invalid email or password. Please try again."
  },
  zh: { 
    loginTitle: "登录", 
    emailLabel: "电子邮箱", 
    passwordLabel: "密码", 
    email: "电子邮箱", 
    password: "请输入密码", 
    rememberMe: "记住我",
    forgot: "忘记密码？", 
    loginBtn: "登录", 
    noAccount: "还没有账号？", 
    register: "免费注册", 
    loginError: "邮箱或密码错误，请重试。" },
  ms: { 
    loginTitle: "Log Masuk", 
    emailLabel: "Emel", 
    passwordLabel: "Kata Laluan", 
    email: "Emel", 
    password: "Masukkan kata laluan", 
    rememberMe: "Ingat saya",
    forgot: "Lupa kata laluan?", 
    loginBtn: "Log Masuk", 
    noAccount: "Belum ada akaun?", 
    register: "Daftar percuma", 
    loginError: "Emel atau kata laluan tidak sah. Sila cuba lagi." }, 
  id: { 
    loginTitle: "Masuk", 
    emailLabel: "Email", 
    passwordLabel: "Kata Sandi", 
    email: "Email", 
    password: "Masukkan kata sandi", 
    rememberMe: "Ingat saya",
    forgot: "Lupa kata sandi?", 
    loginBtn: "Masuk", 
    noAccount: "Belum punya akun?", 
    register: "Daftar gratis", 
    loginError: "Email atau kata sandi salah. Silakan coba lagi." }, 
  bn: { 
    loginTitle: "লগইন", 
    emailLabel: "ইমেইল", 
    passwordLabel: "পাসওয়ার্ড", 
    email: "ইমেইল", 
    password: "পাসওয়ার্ড লিখুন", 
    rememberMe: "আমাকে মনে রাখো",
    forgot: "পাসওয়ার্ড ভুলে গেছেন?", 
    loginBtn: "লগইন", 
    noAccount: "একাউন্ট নেই?", 
    register: "বিনামূল্যে নিবন্ধন", 
    loginError: "ইমেইল বা পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।" }, 
  ne: { 
    loginTitle: "लगइन", 
    emailLabel: "इमेल", 
    passwordLabel: "पासवर्ड", 
    email: "इमेल", 
    password: "पासवर्ड प्रविष्ट गर्नुहोस्", 
    rememberMe: "मलाई सम्झनुहोस्",
    forgot: "पासवर्ड बिर्सनुभयो?", 
    loginBtn: "लगइन", 
    noAccount: "खाता छैन?", 
    register: "निःशुल्क दर्ता", 
    loginError: "इमेल वा पासवर्ड गलत छ। फेरि प्रयास गर्नुहोस्।" }, 
  hi: { 
    loginTitle: "लॉगिन", 
    emailLabel: "ईमेल", 
    passwordLabel: "पासवर्ड", 
    email: "ईमेल", 
    password: "पासवर्ड दर्ज करें", 
    rememberMe: "मुझे याद रखें",
    forgot: "पासवर्ड भूल गए?", 
    loginBtn: "लॉगिन", 
    noAccount: "खाता नहीं है?", 
    register: "मुफ्त पंजीकरण", 
    loginError: "ईमेल या पासवर्ड गलत है। कृपया पुनः प्रयास करें।" }, 
  my: { 
    loginTitle: "အကောင့်ဝင်ရန်", 
    emailLabel: "အီးမေးလ်", 
    passwordLabel: "စကားဝှက်", 
    email: "အီးမေးလ်", 
    password: "စကားဝှက်ထည့်ပါ", 
    rememberMe: "အကောင့်မေ့မထားပါနှင့်",
    forgot: "စကားဝှက် မေ့သွားပါသလား?", 
    loginBtn: "အကောင့်ဝင်ရန်", 
    noAccount: "အကောင့် မရှိသေးဘူးလား?", 
    register: "အခမဲ့ စာရင်းသွင်းရန်", 
    loginError: "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။ ပြန်လည်ကြိုးစားပါ။" }, 
  ph: { 
    loginTitle: "Mag-login", 
    emailLabel: "Email", 
    passwordLabel: "Password", 
    email: "Email", 
    password: "Ilagay ang password", 
    rememberMe: "Alalahanin ako",
    forgot: "Nakalimutan ang password?", 
    loginBtn: "Mag-login", 
    noAccount: "Wala pang account?", 
    register: "Magrehistro nang libre", 
    loginError: "Maling email o password. Pakisubukang muli." }, 
  vi: { 
    loginTitle: "Đăng nhập", 
    emailLabel: "Email", 
    passwordLabel: "Mật khẩu", 
    email: "Email", 
    password: "Nhập mật khẩu", 
    rememberMe: "Ghi nhớ đăng nhập",
    forgot: "Quên mật khẩu?", 
    loginBtn: "Đăng nhập", 
    noAccount: "Chưa có tài khoản?", 
    register: "Đăng ký miễn phí", 
    loginError: "Email hoặc mật khẩu không đúng. Vui lòng thử lại." }
};

// Language switch function
function changeLanguage(lang) {
  currentLang = lang;

  document.querySelectorAll("[data-lang]").forEach(el => {
    el.textContent = translations[lang][el.dataset.lang];
  });

  document.querySelectorAll("[data-lang-placeholder]").forEach(el => {
    el.placeholder = translations[lang][el.dataset.langPlaceholder];
  });
}

// Login
function login() {
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
  const rememberMe = document.getElementById("rememberMe").checked;
  const errorMsg = document.getElementById("loginErrorMsg");

  errorMsg.style.display = "none";

  if (!email || !password) {
    errorMsg.textContent = "Please enter email and password.";
    errorMsg.style.display = "block";
    return;
  }

  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, remember_me: rememberMe })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === "success") {
      window.location.href = "/ingredients";
    } else {
      errorMsg.textContent = translations[currentLang].loginError;
      errorMsg.style.display = "block";
    }
  })
  .catch(err => {
    errorMsg.textContent = translations[currentLang].loginError;
    errorMsg.style.display = "block";
  });
}