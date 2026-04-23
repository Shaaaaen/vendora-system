let currentLang = "en";

const translations = {
  en: {
    welcome: "Welcome to Vendora!",
    subtitle: "Start managing your small business easily.",
    signup: "Sign Up",
    username: "Username",
    email: "Email",
    password: "Password",
    confirm: "Confirm Password",
    next: "Next",
    securityTitle: "Security Setup",
    securityKey: "Security Key",
    securityQuestion: "Security Question",
    answer: "Your Answer",
    signupBtn: "Sign Up",
    select: "Select question",
    alreadyHaveAccount: "Already have an account?",
    login: "Login",
    SecKey: "Enter a unique security key",
    q1: "What was the name of your first pet?",
    q2: "Who was your best friend as a child?",
    q3: "What is your favorite color?",
    q4: "What is your mother's name?",
    q5: "What is your father's name?",
    q6: "What was the name of your secondary school?",
    q7: "What was your favorite subject in school?",
    q8: "What was the brand of your first mobile phone?",
    q9: "What is the name of the city where you were born?",
    q10: "What is your favorite sport?",
    fillAll: "Please fill all fields",
    passwordMismatch: "Passwords do not match",
    signupSuccess: "Signup successful!"
  },
  zh: {
    welcome: "欢迎来到 Vendora!",
    subtitle: "轻松管理您的小型企业。",
    signup: "注册",
    username: "用户名",
    email: "电子邮箱",
    password: "密码",
    confirm: "确认密码",
    next: "下一步",
    securityTitle: "安全设置",
    securityKey: "安全密钥",
    securityQuestion: "安全问题",
    answer: "答案",
    signupBtn: "注册",
    select: "选择问题",
    alreadyHaveAccount: "已经有账号？",
    login: "登录",
    SecKey: "输入一个独特的安全密钥",
    q1: "你第一只宠物的名字是什么？",
    q2: "你童年时最好的朋友是谁？",
    q3: "你最喜欢的颜色是什么？",
    q4: "你母亲的名字是什么？",
    q5: "你父亲的名字是什么？",
    q6: "你中学的名字是什么？",
    q7: "你在学校最喜欢的科目是什么？",
    q8: "你的第一部手机品牌是什么？",
    q9: "你出生的城市叫什么名字？",
    q10: "你最喜欢的运动是什么？",
    fillAll: "请填写所有字段",
    passwordMismatch: "密码不匹配",
    signupSuccess: "注册成功！"
  },
  ms: {
    welcome: "Selamat datang ke Vendora!",
    subtitle: "Urus perniagaan kecil anda dengan mudah.",
    signup: "Daftar",
    username: "Nama pengguna",
    email: "Emel",
    password: "Kata laluan",
    confirm: "Sahkan kata laluan",
    next: "Seterusnya",
    securityTitle: "Keselamatan",
    securityKey: "Kunci keselamatan",
    securityQuestion: "Soalan keselamatan",
    answer: "Jawapan",
    signupBtn: "Daftar",
    select: "Pilih soalan",
    alreadyHaveAccount: "Sudah ada akaun?",
    login: "Log masuk",
    SecKey: "Masukkan kunci keselamatan yang unik",
    q1: "Apakah nama haiwan peliharaan pertama anda?",
    q2: "Siapakah kawan baik anda semasa kecil?",
    q3: "Apakah warna kegemaran anda?",
    q4: "Apakah nama ibu anda?",
    q5: "Apakah nama bapa anda?",
    q6: "Apakah nama sekolah menengah anda?",
    q7: "Apakah subjek kegemaran anda di sekolah?",
    q8: "Apakah jenama telefon pertama anda?",
    q9: "Apakah nama bandar tempat anda dilahirkan?",
    q10: "Apakah sukan kegemaran anda?",
    fillAll: "Sila lengkapkan semua medan",
    passwordMismatch: "Kata laluan tidak sepadan",
    signupSuccess: "Pendaftaran berjaya!"
  },
  id: {
    welcome: "Selamat datang di Vendora!",
    subtitle: "Kelola bisnis kecil Anda dengan mudah.",
    signup: "Daftar",
    username: "Nama pengguna",
    email: "Email",
    password: "Kata sandi",
    confirm: "Konfirmasi kata sandi",
    next: "Berikutnya",
    securityTitle: "Pengaturan keamanan",
    securityKey: "Kunci keamanan",
    securityQuestion: "Pertanyaan keamanan",
    answer: "Jawaban",
    signupBtn: "Daftar",
    select: "Pilih pertanyaan",
    alreadyHaveAccount: "Sudah punya akun?",
    login: "Masuk",
    SecKey: "Masukkan kunci keamanan yang unik",
    q1: "Siapa nama hewan peliharaan pertama Anda?",
    q2: "Siapa sahabat terbaik Anda saat kecil?",
    q3: "Apa warna favorit Anda?",
    q4: "Siapa nama ibu Anda?",
    q5: "Siapa nama ayah Anda?",
    q6: "Apa nama sekolah menengah Anda?",
    q7: "Apa mata pelajaran favorit Anda di sekolah?",
    q8: "Apa merek ponsel pertama Anda?",
    q9: "Apa nama kota tempat Anda lahir?",
    q10: "Apa olahraga favorit Anda?",
    fillAll: "Harap isi semua kolom",
    passwordMismatch: "Kata sandi tidak cocok",
    signupSuccess: "Pendaftaran berhasil!"
  },
  bn: {
    welcome: "Vendora-তে স্বাগতম!",
    subtitle: "সহজে আপনার ছোট ব্যবসা পরিচালনা করুন।",
    signup: "নিবন্ধন",
    username: "ব্যবহারকারীর নাম",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    confirm: "পাসওয়ার্ড নিশ্চিত করুন",
    next: "পরবর্তী",
    securityTitle: "নিরাপত্তা সেটআপ",
    securityKey: "নিরাপত্তা কী",
    securityQuestion: "নিরাপত্তা প্রশ্ন",
    answer: "উত্তর",
    signupBtn: "নিবন্ধন",
    select: "প্রশ্ন নির্বাচন করুন",
    alreadyHaveAccount: "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
    login: "লগইন",
    SecKey: "একটি অনন্য সিকিউরিটি কী লিখুন",
    q1: "আপনার প্রথম পোষা প্রাণীর নাম কী ছিল?",
    q2: "শৈশবে আপনার সেরা বন্ধু কে ছিল?",
    q3: "আপনার প্রিয় রং কী?",
    q4: "আপনার মায়ের নাম কী?",
    q5: "আপনার বাবার নাম কী?",
    q6: "আপনার মাধ্যমিক বিদ্যালয়ের নাম কী ছিল?",
    q7: "স্কুলে আপনার প্রিয় বিষয় কী ছিল?",
    q8: "আপনার প্রথম মোবাইল ফোনের ব্র্যান্ড কী ছিল?",
    q9: "আপনি যে শহরে জন্মগ্রহণ করেছেন তার নাম কী?",
    q10: "আপনার প্রিয় খেলা কী?",
    fillAll: "দয়া করে সব ক্ষেত্র পূরণ করুন",
    passwordMismatch: "পাসওয়ার্ড মেলেনি",
    signupSuccess: "নিবন্ধন সফল!"
  },
  ne: {
    welcome: "Vendora मा स्वागत छ!",
    subtitle: "तपाईंको सानो व्यवसाय सजिलै व्यवस्थापन गर्नुहोस्।",
    signup: "दर्ता",
    username: "प्रयोगकर्ता नाम",
    email: "इमेल",
    password: "पासवर्ड",
    confirm: "पासवर्ड पुष्टि गर्नुहोस्",
    next: "अर्को",
    securityTitle: "सुरक्षा सेटअप",
    securityKey: "सुरक्षा कुञ्जी",
    securityQuestion: "सुरक्षा प्रश्न",
    answer: "उत्तर",
    signupBtn: "दर्ता",
    select: "प्रश्न छान्नुहोस्",
    alreadyHaveAccount: "पहिले नै खाता छ?",
    login: "लगइन",
    SecKey: "एउटा अद्वितीय सुरक्षा कुञ्जी प्रविष्ट गर्नुहोस्",
    q1: "तपाईंको पहिलो घरपालुवा जनावरको नाम के थियो?",
    q2: "बाल्यकालमा तपाईंको सबैभन्दा राम्रो साथी को थियो?",
    q3: "तपाईंको मनपर्ने रङ के हो?",
    q4: "तपाईंकी आमाको नाम के हो?",
    q5: "तपाईंका बुवाको नाम के हो?",
    q6: "तपाईंको माध्यमिक विद्यालयको नाम के थियो?",
    q7: "विद्यालयमा तपाईंको मनपर्ने विषय के थियो?",
    q8: "तपाईंको पहिलो मोबाइल फोनको ब्रान्ड के थियो?",
    q9: "तपाईं जन्मिएको सहरको नाम के हो?",
    q10: "तपाईंको मनपर्ने खेल के हो?",
    fillAll: "कृपया सबै फिल्डहरू भर्नुहोस्",
    passwordMismatch: "पासवर्ड मेल खाँदैन",
    signupSuccess: "दर्ता सफल!"
  },
  hi: {
    welcome: "Vendora में आपका स्वागत है!",
    subtitle: "अपने छोटे व्यवसाय को आसानी से प्रबंधित करें।",
    signup: "पंजीकरण",
    username: "उपयोगकर्ता नाम",
    email: "ईमेल",
    password: "पासवर्ड",
    confirm: "पासवर्ड की पुष्टि करें",
    next: "अगला",
    securityTitle: "सुरक्षा सेटअप",
    securityKey: "सुरक्षा कुंजी",
    securityQuestion: "सुरक्षा प्रश्न",
    answer: "उत्तर",
    signupBtn: "पंजीकरण",
    select: "प्रश्न चुनें",
    alreadyHaveAccount: "क्या पहले से खाता है?",
    login: "लॉगिन",
    SecKey: "एक अद्वितीय सुरक्षा कुंजी दर्ज करें",
    q1: "आपके पहले पालतू जानवर का नाम क्या था?",
    q2: "बचपन में आपका सबसे अच्छा मित्र कौन था?",
    q3: "आपका पसंदीदा रंग क्या है?",
    q4: "आपकी माता का नाम क्या है?",
    q5: "आपके पिता का नाम क्या है?",
    q6: "आपके माध्यमिक विद्यालय का नाम क्या था?",
    q7: "स्कूल में आपका पसंदीदा विषय क्या था?",
    q8: "आपके पहले मोबाइल फोन का ब्रांड क्या था?",
    q9: "आप जिस शहर में पैदा हुए उसका नाम क्या है?",
    q10: "आपका पसंदीदा खेल कौन सा है?",
    fillAll: "कृपया सभी फ़ील्ड भरें",
    passwordMismatch: "पासवर्ड मेल नहीं खाता",
    signupSuccess: "पंजीकरण सफल!"
  },
  my: {
    welcome: "Vendora မှ ကြိုဆိုပါတယ်!",
    subtitle: "သင့်အသေးစားစီးပွားရေးကို လွယ်ကူစွာ စီမံခန့်ခွဲပါ။",
    signup: "စာရင်းသွင်းရန်",
    username: "အသုံးပြုသူအမည်",
    email: "အီးမေးလ်",
    password: "စကားဝှက်",
    confirm: "စကားဝှက်အတည်ပြုပါ",
    next: "နောက်တစ်ခု",
    securityTitle: "လုံခြုံရေး",
    securityKey: "လုံခြုံရေးသော့",
    securityQuestion: "လုံခြုံရေးမေးခွန်း",
    answer: "အဖြေ",
    signupBtn: "စာရင်းသွင်းရန်",
    select: "မေးခွန်းရွေးပါ",
    alreadyHaveAccount: "အကောင့်ရှိပြီးသားလား?",
    login: "အကောင့်ဝင်ရန်",
    SecKey: "ထူးခြားသော လုံခြုံရေးသော့ တစ်ခု ထည့်ပါ",
    q1: "သင့်ရဲ့ ပထမဆုံး အိမ်မွေးတိရစ္ဆာန် အမည်က ဘာလဲ?",
    q2: "ကလေးဘဝမှာ သင့်ရဲ့ အကောင်းဆုံး သူငယ်ချင်း ဘယ်သူလဲ?",
    q3: "သင့်အကြိုက်ဆုံး အရောင်က ဘာလဲ?",
    q4: "သင့်အမေရဲ့ နာမည်က ဘာလဲ?",
    q5: "သင့်အဖေရဲ့ နာမည်က ဘာလဲ?",
    q6: "သင့်ရဲ့ အထက်တန်းကျောင်း အမည်က ဘာလဲ?",
    q7: "ကျောင်းမှာ သင့်အကြိုက်ဆုံး ဘာသာရပ်က ဘာလဲ?",
    q8: "သင့်ရဲ့ ပထမဆုံး ဖုန်း အမှတ်တံဆိပ်က ဘာလဲ?",
    q9: "သင် မွေးဖွားခဲ့တဲ့ မြို့နာမည်က ဘာလဲ?",
    q10: "သင့်အကြိုက်ဆုံး အားကစားက ဘာလဲ?",
    fillAll: "ကျေးဇူးပြုပြီး အားလုံးကွက်များဖြည့်ပါ",
    passwordMismatch: "စကားဝှက် မကိုက်ညီပါ",
    signupSuccess: "စာရင်းသွင်းခြင်း အောင်မြင်ပါသည်!"
  },
  ph: {
    welcome: "Maligayang pagdating sa Vendora!",
    subtitle: "Pamahalaan ang iyong maliit na negosyo nang madali.",
    signup: "Magrehistro",
    username: "Username",
    email: "Email",
    password: "Password",
    confirm: "Kumpirmahin ang password",
    next: "Susunod",
    securityTitle: "Seguridad",
    securityKey: "Security key",
    securityQuestion: "Tanong sa seguridad",
    answer: "Sagot",
    signupBtn: "Magrehistro",
    select: "Pumili ng tanong",
    alreadyHaveAccount: "May account na?",
    login: "Mag-login",
    SecKey: "Maglagay ng natatanging security key",
    q1: "Ano ang pangalan ng una mong alagang hayop?",
    q2: "Sino ang iyong matalik na kaibigan noong bata ka?",
    q3: "Ano ang paborito mong kulay?",
    q4: "Ano ang pangalan ng iyong ina?",
    q5: "Ano ang pangalan ng iyong ama?",
    q6: "Ano ang pangalan ng iyong secondary school?",
    q7: "Ano ang paborito mong asignatura sa paaralan?",
    q8: "Ano ang brand ng una mong cellphone?",
    q9: "Ano ang pangalan ng lungsod kung saan ka ipinanganak?",
    q10: "Ano ang paborito mong sport?",
    fillAll: "Pakiusap punan ang lahat ng mga field",
    passwordMismatch: "Hindi tumutugma ang password",
    signupSuccess: "Matagumpay ang pagrehistro!"
  },
  vi: {
    welcome: "Chào mừng đến Vendora!",
    subtitle: "Quản lý doanh nghiệp nhỏ của bạn dễ dàng.",
    signup: "Đăng ký",
    username: "Tên người dùng",
    email: "Email",
    password: "Mật khẩu",
    confirm: "Xác nhận mật khẩu",
    next: "Tiếp theo",
    securityTitle: "Thiết lập bảo mật",
    securityKey: "Khóa bảo mật",
    securityQuestion: "Câu hỏi bảo mật",
    answer: "Câu trả lời",
    signupBtn: "Đăng ký",
    select: "Chọn câu hỏi",
    alreadyHaveAccount: "Đã có tài khoản?",
    login: "Đăng nhập",
    SecKey: "Nhập khóa bảo mật duy nhất",
    q1: "Tên thú cưng đầu tiên của bạn là gì?",
    q2: "Bạn thân nhất của bạn khi còn nhỏ là ai?",
    q3: "Màu sắc yêu thích của bạn là gì?",
    q4: "Tên mẹ của bạn là gì?",
    q5: "Tên bố của bạn là gì?",
    q6: "Tên trường trung học của bạn là gì?",
    q7: "Môn học yêu thích của bạn ở trường là gì?",
    q8: "Thương hiệu điện thoại đầu tiên của bạn là gì?",
    q9: "Tên thành phố nơi bạn sinh ra là gì?",
    q10: "Môn thể thao yêu thích của bạn là gì?",
    fillAll: "Vui lòng điền tất cả các trường",
    passwordMismatch: "Mật khẩu không khớp",
    signupSuccess: "Đăng ký thành công!"
  }
};

function changeLanguage(lang) {
  currentLang = lang;

  // Update normal text
  document.querySelectorAll("[data-lang]").forEach(el => {
    el.textContent = translations[lang][el.dataset.lang];
  });

  // Update input placeholders
  document.querySelectorAll("[data-lang-placeholder]").forEach(el => {
    el.placeholder = translations[lang][el.dataset.langPlaceholder];
  });
}

// function togglePassword(inputId, toggleEl) {
//   const input = document.getElementById(inputId);
//   if (input.type === "password") {
//     input.type = "text";
//     toggleEl.textContent = "🙈";
//   } else {
//     input.type = "password";
//     toggleEl.textContent = "👁️";
//   }
// }

function goToSecurity() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!username || !email || !password || !confirmPassword) {
    alert(translations[currentLang].fillAll);
    return;
  }
  if (password !== confirmPassword) {
    alert(translations[currentLang].passwordMismatch);
    return;
  }

  localStorage.setItem("signupData", JSON.stringify({ username, email, password }));
  window.location.href = "/security";
}

function submitSignup() {
  const securityKey = document.getElementById("securityKey").value.trim();
  const securityQuestion = document.getElementById("securityQuestion").value;
  const securityAnswer = document.getElementById("securityAnswer").value.trim();
  const errorMsg = document.getElementById("securityErrorMsg");

  errorMsg.textContent = "";

  if (!securityKey || !securityQuestion || !securityAnswer) {
    errorMsg.textContent = translations[currentLang].fillAll;
    return;
  }

  const signupData = JSON.parse(localStorage.getItem("signupData"));

  fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: signupData.username,
      email: signupData.email,
      password: signupData.password,
      securityKey,
      securityQuestion,
      securityAnswer
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      alert(translations[currentLang].signupSuccess);
      localStorage.removeItem("signupData");
      window.location.href = "/login";
    } else {
      errorMsg.textContent = data.message || translations[currentLang].fillAll;
    }
  })
  .catch(err => {
    errorMsg.textContent = "Server error";
  });
}