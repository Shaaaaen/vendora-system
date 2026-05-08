const customTranslations = {
  save: {
    "en": "Save",
    "zh-CN": "保存",
    "ms": "Simpan",
    "id": "Simpan",
    "bn": "সংরক্ষণ",
    "ne": "सुरक्षित गर्नुहोस्",
    "hi": "सहेजें",
    "my": "သိမ်းဆည်းမည်",
    "fil": "I-save",
    "vi": "Lưu"
  },

  save_product: {
    "en": "Save Product",
    "zh-CN": "保存产品",
    "ms": "Simpan Produk",
    "id": "Simpan Produk",
    "bn": "পণ্য সংরক্ষণ",
    "ne": "उत्पादन सुरक्षित गर्नुहोस्",
    "hi": "उत्पाद सहेजें",
    "my": "ထုတ်ကုန်သိမ်းဆည်းမည်",
    "fil": "I-save ang Produkto",
    "vi": "Lưu sản phẩm"
  },

  save_changes: {
    "en": "Save Changes",
    "zh-CN": "保存更改",
    "ms": "Simpan Perubahan",
    "id": "Simpan Perubahan",
    "bn": "পরিবর্তন সংরক্ষণ",
    "ne": "परिवर्तन सुरक्षित गर्नुहोस्",
    "hi": "परिवर्तन सहेजें",
    "my": "ပြောင်းလဲမှုများကိုသိမ်းဆည်းမည်",
    "fil": "I-save ang mga pagbabago",
    "vi": "Lưu thay đổi"
  },

  record_sales: {
    "en": "Record Sales",
    "zh-CN": "销售记录",
    "ms": "Rekod Jualan",
    "id": "Catat Penjualan",
    "bn": "বিক্রয় রেকর্ড করুন",
    "ne": "बिक्री रेकर्ड गर्नुहोस्",
    "hi": "बिक्री दर्ज करें",
    "my": "ရောင်းအားမှတ်တမ်းတင်ပါ",
    "fil": "Itala ang Benta",
    "vi": "Ghi nhận doanh số"
  },

    save_sale: {
    "en": "Save Sale",
    "zh-CN": "保存销售",
    "ms": "Simpan Jualan",
    "id": "Simpan Penjualan",
    "bn": "বিক্রয় সংরক্ষণ",
    "ne": "बिक्री सुरक्षित गर्नुहोस्",
    "hi": "बिक्री सहेजें",
    "my": "ရောင်းအားသိမ်းဆည်းမည်",
    "fil": "I-save ang Benta",
    "vi": "Lưu bán hàng"
  }
};

function applyCustomWords(lang) {
  document.querySelectorAll("[data-key]").forEach(el => {
    const key = el.dataset.key;

    if (customTranslations[key] && customTranslations[key][lang]) {
      el.innerText = customTranslations[key][lang];
    }
  });
}

function goPage(page) {
  window.location.href = page;
}

// Profile click — navigate to settings page
function openProfile() {
  window.location.href = "/settings";
}

// Language switch
function changeLanguage(lang) {
  console.log("Language switched to", lang);
}

window.googleTranslateElementInit = function () {
  new google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: 'en,zh-CN,ms,id,bn,ne,hi,my,tl,vi',
      autoDisplay: false
    },
    'google_translate_element'
  );
};

(function loadGoogleTranslate() {
  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
})();

// ══════════════════════════════════════════════════════
// SIDEBAR: Fix single-click navigation
// The sidebar li wraps an <a> tag. By padding the <a>
// instead of the <li>, the entire row is the click target.
// This is already handled via CSS but also ensure no JS
// interference blocks navigation.
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggle
  const menuBtn = document.querySelector('.sidebar .menu-item');
  const sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // Ensure sidebar li clicks navigate immediately (single click)
  // Remove any event listeners that might delay navigation
  document.querySelectorAll('.sidebar ul li a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Let the default anchor behavior happen immediately
      // Don't call e.preventDefault() or e.stopPropagation()
    });
  });
});

// ══════════════════════════════════════════════════════
// CURRENCY: Global helper — convert base-MYR amount to
// user's selected currency using exchange_rate from DB.
// Usage: fmtCurrency(amount) → "USD 12.50"
// ══════════════════════════════════════════════════════
window.VENDORA_CURRENCY = {
  symbol: window.currencySymbol || 'RM',
  rate:   parseFloat(window.currencyRate  || '1') || 1
};

window.fmtCurrency = function(amountInMYR) {
  const c = window.VENDORA_CURRENCY;
  const converted = parseFloat(amountInMYR || 0) * c.rate;
  return c.symbol + ' ' + converted.toFixed(2);
};

window.convertCurrency = function(amountInMYR) {
  return parseFloat(amountInMYR || 0) * (window.VENDORA_CURRENCY.rate || 1);
};

function changeLanguage(lang) {
  localStorage.setItem("selectedLang", lang);
  const combo = document.querySelector(".goog-te-combo");

  if (!combo) {
    console.warn("Google Translate not ready yet");
    return;
  }

  combo.value = lang;
  combo.dispatchEvent(new Event("change"));

  updateSelectorUI(lang);
  applyCustomWords(lang);
}

function updateSelectorUI(lang) {
    const select = document.querySelector(".lang-switch select");
    if (!select) return;

    select.value = lang;
}

document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("selectedLang");

    if (!savedLang) return;

    const timer = setInterval(() => {
        const combo = document.querySelector(".goog-te-combo");
        const select = document.querySelector(".lang-switch select");

        if (combo) {
            combo.value = savedLang;
            combo.dispatchEvent(new Event("change"));
        }

        if (select) {
            select.value = savedLang;
        }

        if (combo && select) {
          applyCustomWords(savedLang);
          clearInterval(timer);
        }
    }, 300);
});

function cleanGoogleUI() {
  document.querySelectorAll("iframe").forEach((iframe) => {
    const src = iframe.src || "";

    if (
      src.includes("translate") ||
      iframe.className.includes("VIpgJd") ||
      iframe.id.includes("goog")
    ) {
      iframe.style.display = "none";
    }
  });
}

setInterval(cleanGoogleUI, 300);


// ═══════════════════════════════════════════════════════════════
// GLOBAL FORECAST NOTIFICATION POLLER
// Runs on every page — polls server every 10s.
// When forecast finishes (after new sale or midnight refresh),
// fires OS notification no matter which page user is on.
// ═══════════════════════════════════════════════════════════════
const _globalNotifStrings = {
    title: {
        'en':    '📈 Forecast Ready!',
        'zh-CN': '📈 预测图表已就绪！',
        'ms':    '📈 Graf Ramalan Sedia!',
        'id':    '📈 Grafik Prakiraan Siap!',
        'bn':    '📈 পূর্বাভাস গ্রাফ প্রস্তুত!',
        'ne':    '📈 पूर्वानुमान ग्राफ तयार!',
        'hi':    '📈 पूर्वानुमान ग्राफ तैयार!',
        'my':    '📈 ခန့်မှန်းချက်ဂရပ် အဆင်သင့်!',
        'fil':   '📈 Handa na ang Graph!',
        'vi':    '📈 Biểu đồ dự báo sẵn sàng!',
    },
    body: {
        'en':    'Your sales forecast chart is ready. Tap to view.',
        'zh-CN': '您的销售预测图表已准备好，点击查看。',
        'ms':    'Graf ramalan jualan anda sudah siap. Ketik untuk lihat.',
        'id':    'Grafik prakiraan penjualan siap. Ketuk untuk melihat.',
        'bn':    'আপনার বিক্রয় পূর্বাভাস চার্ট প্রস্তুত। দেখতে ক্লিক করুন।',
        'ne':    'तपाईंको बिक्री पूर्वानुमान ग्राफ तयार छ। हेर्न क्लिक गर्नुहोस्।',
        'hi':    'आपका बिक्री पूर्वानुमान ग्राफ तैयार है। देखने के लिए टैप करें।',
        'my':    'သင်၏ရောင်းအားဂရပ် အဆင်သင့်ဖြစ်ပါပြီ။ ကြည့်ရှုရန် နှိပ်ပါ။',
        'fil':   'Ang iyong forecast chart ay handa na. I-tap para tingnan.',
        'vi':    'Biểu đồ dự báo doanh số của bạn đã sẵn sàng. Nhấn để xem.',
    }
};

function _fireGlobalForecastNotif() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const lang  = localStorage.getItem('selectedLang') || 'en';
    const title = _globalNotifStrings.title[lang] || _globalNotifStrings.title['en'];
    const body  = _globalNotifStrings.body[lang]  || _globalNotifStrings.body['en'];
    const n = new Notification(title, {
        body: body,
        icon: '/static/assets/icons/logo.ico',
        tag:  'forecast-ready',
    });
    n.onclick = () => { window.location.href = '/forecast'; n.close(); };
}

async function _pollForecastStatus() {
    // Only poll if user is logged in (page has a sidebar = logged in)
    if (!document.querySelector('.sidebar, .nav-sidebar, [class*="sidebar"]')) return;
    try {
        const res  = await fetch('/api/forecast/status', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.notify) {
            _fireGlobalForecastNotif();
        }
    } catch (e) { /* silently ignore network errors */ }
}

// Request notification permission once on first page load (requires user interaction
// so we attach it to the first click anywhere on the page)
function _requestNotifOnFirstClick() {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    document.addEventListener('click', async function _oneTimeAsk() {
        document.removeEventListener('click', _oneTimeAsk);
        await Notification.requestPermission();
    }, { once: true });
}

// Start polling when page loads
document.addEventListener('DOMContentLoaded', () => {
    _requestNotifOnFirstClick();
    // Poll every 10 seconds
    setInterval(_pollForecastStatus, 10000);
});
