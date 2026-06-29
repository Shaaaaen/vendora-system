
// ══════════════════════════════════════════════════════
// UI_STRINGS — shared translated strings for all JS files
// Covers: alerts, confirms, status chips, empty states,
//         chart axis labels, and dynamic injected text.
// Usage: window.UI_STRINGS[key][lang] or getLang(key)
// ══════════════════════════════════════════════════════
window.UI_STRINGS = {
  // ── Alerts / Confirms ─────────────────────────────
  fill_required:        { en:'Please fill in all required fields.', 'zh-CN':'请填写所有必填项。', ms:'Sila isi semua medan yang diperlukan.', id:'Harap isi semua kolom yang diperlukan.', bn:'অনুগ্রহ করে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন।', ne:'कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्।', hi:'कृपया सभी आवश्यक फ़ील्ड भरें।', my:'ကျေးဇူးပြု၍ လိုအပ်သောနေရာများကို ဖြည့်ပါ။', fil:'Mangyaring punan ang lahat ng kinakailangang field.', vi:'Vui lòng điền đầy đủ các trường bắt buộc.' },
  something_wrong:      { en:'Something went wrong.', 'zh-CN':'出现错误。', ms:'Sesuatu telah berlaku. Sila cuba lagi.', id:'Terjadi kesalahan.', bn:'কিছু ভুল হয়েছে।', ne:'केही गलत भयो।', hi:'कुछ गलत हो गया।', my:'တစ်ခုခုမှားယွင်းနေသည်။', fil:'May nangyaring mali.', vi:'Đã có lỗi xảy ra.' },
  ingredient_added:     { en:'Ingredient added!', 'zh-CN':'食材已添加！', ms:'Bahan berjaya ditambah!', id:'Bahan berhasil ditambahkan!', bn:'উপাদান যোগ করা হয়েছে!', ne:'सामग्री थपियो!', hi:'सामग्री जोड़ी गई!', my:'ပါဝင်ပစ္စည်းကို ထည့်သွင်းပြီးပါပြီ!', fil:'Naidagdag na ang sangkap!', vi:'Đã thêm nguyên liệu!' },
  ingredient_updated:   { en:'Ingredient updated!', 'zh-CN':'食材已更新！', ms:'Bahan berjaya dikemas kini!', id:'Bahan berhasil diperbarui!', bn:'উপাদান আপডেট হয়েছে!', ne:'सामग्री अपडेट भयो!', hi:'सामग्री अपडेट की गई!', my:'ပါဝင်ပစ္စည်းကို မွမ်းမံပြီးပါပြီ!', fil:'Na-update na ang sangkap!', vi:'Đã cập nhật nguyên liệu!' },
  fail_save_ingredient: { en:'Failed to save ingredient.', 'zh-CN':'保存食材失败。', ms:'Gagal menyimpan bahan.', id:'Gagal menyimpan bahan.', bn:'উপাদান সংরক্ষণ ব্যর্থ হয়েছে।', ne:'सामग्री बचत गर्न असफल।', hi:'सामग्री सहेजने में विफल।', my:'ပါဝင်ပစ္စည်းသိမ်းမရပါ။', fil:'Hindi ma-save ang sangkap.', vi:'Không thể lưu nguyên liệu.' },
  error_save_ingredient:{ en:'Error saving ingredient.', 'zh-CN':'保存食材时出错。', ms:'Ralat semasa menyimpan bahan.', id:'Kesalahan saat menyimpan bahan.', bn:'উপাদান সংরক্ষণে ত্রুটি।', ne:'सामग्री बचत गर्दा त्रुटि।', hi:'सामग्री सहेजते समय त्रुटि।', my:'ပါဝင်ပစ္စည်းသိမ်းရာတွင် အမှားဖြစ်သည်။', fil:'Error sa pag-save ng sangkap.', vi:'Lỗi khi lưu nguyên liệu.' },
  ingredient_id_not_found:{ en:'Ingredient ID not found!', 'zh-CN':'找不到食材 ID！', ms:'ID bahan tidak dijumpai!', id:'ID bahan tidak ditemukan!', bn:'উপাদান আইডি পাওয়া যায়নি!', ne:'सामग्री आईडी फेला परेन!', hi:'सामग्री आईडी नहीं मिली!', my:'ပါဝင်ပစ္စည်း ID မတွေ့ပါ!', fil:'Hindi nahanap ang ingredient ID!', vi:'Không tìm thấy ID nguyên liệu!' },
  confirm_delete_ingredient:{ en:'Are you sure you want to delete this ingredient?', 'zh-CN':'您确定要删除此食材吗？', ms:'Adakah anda pasti mahu memadam bahan ini?', id:'Apakah Anda yakin ingin menghapus bahan ini?', bn:'আপনি কি এই উপাদানটি মুছে ফেলতে চান?', ne:'के तपाईं यो सामग्री मेटाउन चाहनुहुन्छ?', hi:'क्या आप इस सामग्री को हटाना चाहते हैं?', my:'ဤပါဝင်ပစ္စည်းကို ဖျက်မည်မှာ သေချာပါသလား?', fil:'Sigurado ka bang gusto mong burahin ang sangkap na ito?', vi:'Bạn có chắc muốn xóa nguyên liệu này không?' },
  fail_delete_ingredient:{ en:'Failed to delete ingredient.', 'zh-CN':'删除食材失败。', ms:'Gagal memadam bahan.', id:'Gagal menghapus bahan.', bn:'উপাদান মুছতে ব্যর্থ হয়েছে।', ne:'सामग्री मेटाउन असफल।', hi:'सामग्री हटाने में विफल।', my:'ပါဝင်ပစ္စည်းဖျက်မရပါ။', fil:'Hindi ma-delete ang sangkap.', vi:'Không thể xóa nguyên liệu.' },
  error_delete_ingredient:{ en:'Error deleting ingredient.', 'zh-CN':'删除食材时出错。', ms:'Ralat semasa memadam bahan.', id:'Kesalahan saat menghapus bahan.', bn:'উপাদান মুছতে ত্রুটি।', ne:'सामग्री मेटाउँदा त्रुटि।', hi:'सामग्री हटाते समय त्रुटि।', my:'ပါဝင်ပစ္စည်းဖျက်ရာတွင် အမှားဖြစ်သည်။', fil:'Error sa pag-delete ng sangkap.', vi:'Lỗi khi xóa nguyên liệu.' },
  confirm_delete_product:{ en:'Delete this product?', 'zh-CN':'删除此产品？', ms:'Padam produk ini?', id:'Hapus produk ini?', bn:'এই পণ্যটি মুছবেন?', ne:'यो उत्पाद मेटाउने?', hi:'इस उत्पाद को हटाएं?', my:'ဤထုတ်ကုန်ကို ဖျက်မည်လား?', fil:'Burahin ang produktong ito?', vi:'Xóa sản phẩm này?' },
  error_delete_product:  { en:'Error deleting product.', 'zh-CN':'删除产品时出错。', ms:'Ralat semasa memadam produk.', id:'Kesalahan saat menghapus produk.', bn:'পণ্য মুছতে ত্রুটি।', ne:'उत्पाद मेटाउँदा त्रुटि।', hi:'उत्पाद हटाते समय त्रुटि।', my:'ထုတ်ကုန်ဖျက်ရာတွင် အမှားဖြစ်သည်။', fil:'Error sa pag-delete ng produkto.', vi:'Lỗi khi xóa sản phẩm.' },
  valid_quantity:        { en:'Please enter a valid quantity.', 'zh-CN':'请输入有效数量。', ms:'Sila masukkan kuantiti yang sah.', id:'Harap masukkan jumlah yang valid.', bn:'একটি বৈধ পরিমাণ লিখুন।', ne:'मान्य मात्रा प्रविष्ट गर्नुहोस्।', hi:'कृपया मान्य मात्रा दर्ज करें।', my:'မှန်ကန်သောပမာဏ ထည့်သွင်းပါ။', fil:'Mangyaring maglagay ng tamang dami.', vi:'Vui lòng nhập số lượng hợp lệ.' },
  select_product:        { en:'Please select a product.', 'zh-CN':'请选择一个产品。', ms:'Sila pilih produk.', id:'Harap pilih produk.', bn:'একটি পণ্য নির্বাচন করুন।', ne:'एउटा उत्पाद छान्नुहोस्।', hi:'कृपया एक उत्पाद चुनें।', my:'ထုတ်ကုန်တစ်ခုကို ရွေးချယ်ပါ။', fil:'Mangyaring pumili ng produkto.', vi:'Vui lòng chọn sản phẩm.' },
  error_recording_sale:  { en:'Error recording sale.', 'zh-CN':'记录销售时出错。', ms:'Ralat semasa merekod jualan.', id:'Kesalahan saat merekam penjualan.', bn:'বিক্রয় রেকর্ডে ত্রুটি।', ne:'बिक्री रेकर्ड गर्दा त्रुटि।', hi:'बिक्री रिकॉर्ड करते समय त्रुटि।', my:'အရောင်းမှတ်တမ်းတင်ရာတွင် အမှားဖြစ်သည်။', fil:'Error sa pag-record ng benta.', vi:'Lỗi khi ghi nhận bán hàng.' },
  select_date:           { en:'Please select a date first.', 'zh-CN':'请先选择日期。', ms:'Sila pilih tarikh dahulu.', id:'Harap pilih tanggal terlebih dahulu.', bn:'প্রথমে একটি তারিখ নির্বাচন করুন।', ne:'पहिले मिति छान्नुहोस्।', hi:'पहले एक तारीख चुनें।', my:'ရက်စွဲကို ဦးစွာရွေးချယ်ပါ။', fil:'Mangyaring pumili muna ng petsa.', vi:'Vui lòng chọn ngày trước.' },
  valid_profit:          { en:'Please enter a valid total profit.', 'zh-CN':'请输入有效的总利润。', ms:'Sila masukkan jumlah keuntungan yang sah.', id:'Harap masukkan total keuntungan yang valid.', bn:'একটি বৈধ মোট মুনাফা লিখুন।', ne:'मान्य कुल नाफा प्रविष्ट गर्नुहोस्।', hi:'कृपया मान्य कुल लाभ दर्ज करें।', my:'မှန်ကန်သောစုစုပေါင်းအမြတ် ထည့်သွင်းပါ။', fil:'Mangyaring maglagay ng tamang kabuuang kita.', vi:'Vui lòng nhập tổng lợi nhuận hợp lệ.' },
  no_valid_data:         { en:'No valid data to submit.', 'zh-CN':'没有有效数据可提交。', ms:'Tiada data yang sah untuk dihantar.', id:'Tidak ada data valid untuk dikirim.', bn:'জমা দেওয়ার মতো কোনো বৈধ ডেটা নেই।', ne:'पेश गर्न मान्य डेटा छैन।', hi:'सबमिट करने के लिए कोई मान्य डेटा नहीं है।', my:'တင်သွင်းရန် မှန်ကန်သောဒေတာမရှိပါ။', fil:'Walang valid na data na isusumite.', vi:'Không có dữ liệu hợp lệ để gửi.' },
  valid_amount:          { en:'Please enter a valid amount.', 'zh-CN':'请输入有效金额。', ms:'Sila masukkan jumlah yang sah.', id:'Harap masukkan jumlah yang valid.', bn:'একটি বৈধ পরিমাণ লিখুন।', ne:'मान्य रकम प्रविष्ट गर्नुहोस्।', hi:'कृपया एक मान्य राशि दर्ज करें।', my:'မှန်ကန်သောပမာဏ ထည့်သွင်းပါ။', fil:'Mangyaring maglagay ng tamang halaga.', vi:'Vui lòng nhập số tiền hợp lệ.' },
  fail_save_expense:     { en:'Failed to save expense.', 'zh-CN':'保存费用失败。', ms:'Gagal menyimpan perbelanjaan.', id:'Gagal menyimpan pengeluaran.', bn:'ব্যয় সংরক্ষণ ব্যর্থ হয়েছে।', ne:'खर्च बचत गर्न असफल।', hi:'व्यय सहेजने में विफल।', my:'စရိတ်သိမ်းမရပါ။', fil:'Hindi ma-save ang gastos.', vi:'Không thể lưu chi phí.' },
  select_csv:            { en:'Please select a CSV file first.', 'zh-CN':'请先选择一个 CSV 文件。', ms:'Sila pilih fail CSV dahulu.', id:'Harap pilih file CSV terlebih dahulu.', bn:'প্রথমে একটি CSV ফাইল নির্বাচন করুন।', ne:'पहिले CSV फाइल छान्नुहोस्।', hi:'पहले एक CSV फ़ाइल चुनें।', my:'CSV ဖိုင်ကို ဦးစွာရွေးချယ်ပါ။', fil:'Mangyaring pumili muna ng CSV file.', vi:'Vui lòng chọn file CSV trước.' },
  // ── Status chips ──────────────────────────────────
  status_done:    { en:'✓ Done', 'zh-CN':'✓ 完成', ms:'✓ Selesai', id:'✓ Selesai', bn:'✓ সম্পন্ন', ne:'✓ सम्पन्न', hi:'✓ हो गया', my:'✓ ပြီးပါပြီ', fil:'✓ Tapos', vi:'✓ Xong' },
  status_pending: { en:'Pending', 'zh-CN':'待处理', ms:'Belum Selesai', id:'Tertunda', bn:'বাকি আছে', ne:'बाँकी', hi:'बाकी है', my:'မပြီးသေး', fil:'Nakabinbin', vi:'Chưa xong' },
  sales_updated:  { en:'Sales updated for today', 'zh-CN':'今日销售已更新', ms:'Jualan hari ini telah dikemas kini', id:'Penjualan hari ini telah diperbarui', bn:'আজকের বিক্রয় আপডেট হয়েছে', ne:'आजको बिक्री अपडेट भयो', hi:'आज की बिक्री अपडेट हो गई', my:'ယနေ့အရောင်းကို မွမ်းမံပြီးပါပြီ', fil:'Na-update na ang benta ngayon', vi:'Đã cập nhật doanh số hôm nay' },
  update_quantity:{ en:"Remember to update today's quantity", 'zh-CN':'请记得更新今日数量', ms:'Ingat untuk kemaskini kuantiti hari ini', id:'Ingat untuk memperbarui jumlah hari ini', bn:'আজকের পরিমাণ আপডেট করতে ভুলবেন না', ne:'आजको मात्रा अपडेट गर्न नबिर्सनुहोस्', hi:'आज की मात्रा अपडेट करना न भूलें', my:'ယနေ့ပမာဏကို မွမ်းမံရန် မမေ့ပါနှင့်', fil:'Huwag kalimutang i-update ang dami ngayon', vi:'Nhớ cập nhật số lượng hôm nay' },
  // ── Empty states ──────────────────────────────────
  no_products_yet:{ en:'No Products Yet', 'zh-CN':'暂无产品', ms:'Tiada Produk Lagi', id:'Belum Ada Produk', bn:'এখনো কোনো পণ্য নেই', ne:'अहिलेसम्म उत्पाद छैन', hi:'अभी तक कोई उत्पाद नहीं', my:'ထုတ်ကုန်မရှိသေးပါ', fil:'Wala Pang Produkto', vi:'Chưa Có Sản Phẩm' },
  add_products_first:{ en:'Add products first before recording sales.', 'zh-CN':'请先添加产品再记录销售。', ms:'Tambah produk dahulu sebelum merekod jualan.', id:'Tambahkan produk terlebih dahulu sebelum merekam penjualan.', bn:'বিক্রয় রেকর্ড করার আগে পণ্য যোগ করুন।', ne:'बिक्री रेकर्ड गर्नु अघि उत्पाद थप्नुहोस्।', hi:'बिक्री दर्ज करने से पहले उत्पाद जोड़ें।', my:'အရောင်းမှတ်တမ်းမတင်မီ ထုတ်ကုန်ထည့်ပါ။', fil:'Magdagdag muna ng produkto bago mag-record ng benta.', vi:'Hãy thêm sản phẩm trước khi ghi nhận bán hàng.' },
  fail_load_sales:{ en:'Failed to load sales data.', 'zh-CN':'加载销售数据失败。', ms:'Gagal memuatkan data jualan.', id:'Gagal memuat data penjualan.', bn:'বিক্রয় ডেটা লোড করতে ব্যর্থ।', ne:'बिक्री डेटा लोड गर्न असफल।', hi:'बिक्री डेटा लोड करने में विफल।', my:'အရောင်းဒေတာ တင်မရပါ။', fil:'Hindi ma-load ang sales data.', vi:'Không thể tải dữ liệu bán hàng.' },
  no_records_found:{ en:'No records found', 'zh-CN':'未找到记录', ms:'Tiada rekod ditemui', id:'Tidak ada catatan ditemukan', bn:'কোনো রেকর্ড পাওয়া যায়নি', ne:'कुनै रेकर्ड फेला परेन', hi:'कोई रिकॉर्ड नहीं मिला', my:'မှတ်တမ်းမတွေ့ပါ', fil:'Walang nakitang rekord', vi:'Không tìm thấy hồ sơ' },
  no_sales_this_date:{ en:'No sales recorded for this date', 'zh-CN':'该日期没有记录销售', ms:'Tiada jualan direkodkan untuk tarikh ini', id:'Tidak ada penjualan yang dicatat untuk tanggal ini', bn:'এই তারিখে কোনো বিক্রয় রেকর্ড নেই', ne:'यो मितिमा कुनै बिक्री रेकर्ड छैन', hi:'इस तारीख के लिए कोई बिक्री दर्ज नहीं है', my:'ဤရက်စွဲအတွက် မည်သည့်အရောင်းမှ မှတ်တမ်းမတင်ရသေး', fil:'Walang naitalang benta para sa petsang ito', vi:'Không có doanh số được ghi nhận cho ngày này' },
  select_date_view:{ en:'Please select a date', 'zh-CN':'请选择日期', ms:'Sila pilih tarikh', id:'Harap pilih tanggal', bn:'একটি তারিখ নির্বাচন করুন', ne:'मिति छान्नुहोस्', hi:'कृपया एक तारीख चुनें', my:'ရက်စွဲတစ်ခုကို ရွေးချယ်ပါ', fil:'Mangyaring pumili ng petsa', vi:'Vui lòng chọn ngày' },
  choose_date_view:{ en:'Choose a date to view sales records', 'zh-CN':'选择日期以查看销售记录', ms:'Pilih tarikh untuk melihat rekod jualan', id:'Pilih tanggal untuk melihat catatan penjualan', bn:'বিক্রয় রেকর্ড দেখতে একটি তারিখ বেছে নিন', ne:'बिक्री रेकर्ड हेर्न मिति छान्नुहोस्', hi:'बिक्री रिकॉर्ड देखने के लिए एक तारीख चुनें', my:'အရောင်းမှတ်တမ်းများကြည့်ရန် ရက်စွဲရွေးချယ်ပါ', fil:'Pumili ng petsa para makita ang mga sales record', vi:'Chọn ngày để xem hồ sơ bán hàng' },
  no_sales_month: { en:'No sales this month', 'zh-CN':'本月无销售', ms:'Tiada jualan bulan ini', id:'Tidak ada penjualan bulan ini', bn:'এই মাসে কোনো বিক্রয় নেই', ne:'यो महिना कुनै बिक्री छैन', hi:'इस महीने कोई बिक्री नहीं', my:'ဤလတွင် အရောင်းမရှိပါ', fil:'Walang benta ngayong buwan', vi:'Không có doanh số tháng này' },
  no_expenses:    { en:'No expenses saved yet', 'zh-CN':'尚未保存费用', ms:'Belum ada perbelanjaan disimpan', id:'Belum ada pengeluaran tersimpan', bn:'এখনো কোনো ব্যয় সংরক্ষিত নেই', ne:'अहिलेसम्म कुनै खर्च बचत भएको छैन', hi:'अभी तक कोई व्यय सहेजा नहीं गया', my:'ယခုအထိ စရိတ်မသိမ်းဆည်းရသေး', fil:'Wala pang na-save na gastos', vi:'Chưa có chi phí nào được lưu' },
  // ── Dashboard dynamic text ─────────────────────────
  items_restock:  { en:'items need to restock soon', 'zh-CN':'项商品需要尽快补货', ms:'item perlu diisi semula segera', id:'item perlu segera diisi ulang', bn:'টি আইটেম শীঘ্রই পুনরায় স্টক করতে হবে', ne:'वस्तुहरू चाँडै पुनःभण्डार गर्न आवश्यक', hi:'आइटम जल्द ही पुनः स्टॉक की जरूरत है', my:'ပစ္စည်းများကို မကြာမီ ပြန်ဖြည့်ရန်လိုသည်', fil:'mga item na kailangang mag-restock', vi:'mặt hàng cần nhập hàng sớm' },
  orders_label:   { en:'Orders', 'zh-CN':'订单', ms:'Pesanan', id:'Pesanan', bn:'অর্ডার', ne:'अर्डर', hi:'ऑर्डर', my:'အမှာစာ', fil:'Mga Order', vi:'Đơn hàng' },
  click_select_month: { en:'Click to Select Month', 'zh-CN':'点击选择月份', ms:'Klik untuk Pilih Bulan', id:'Klik untuk Pilih Bulan', bn:'মাস নির্বাচন করতে ক্লিক করুন', ne:'महिना छान्न क्लिक गर्नुहोस्', hi:'महीना चुनने के लिए क्लिक करें', my:'လကိုရွေးရန် နှိပ်ပါ', fil:'I-click para Pumili ng Buwan', vi:'Nhấn để chọn tháng' },
  revenue_label:  { en:'Revenue', 'zh-CN':'收入', ms:'Pendapatan', id:'Pendapatan', bn:'রাজস্ব', ne:'राजस्व', hi:'राजस्व', my:'ဝင်ငွေ', fil:'Kita', vi:'Doanh thu' },
  // ── Chart axis labels ──────────────────────────────
  months: {
    en:    ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    'zh-CN':['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    ms:    ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogo','Sep','Okt','Nov','Dis'],
    id:    ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
    bn:    ['জান','ফেব','মার','এপ্র','মে','জুন','জুল','আগ','সেপ','অক্ট','নভ','ডিস'],
    ne:    ['जन','फेब','मार','अप्र','मे','जुन','जुल','अग','सेप','अक्ट','नोभ','डिस'],
    hi:    ['जन','फर','मार','अप्र','मई','जून','जुल','अग','सित','अक्ट','नव','दिस'],
    my:    ['ဇန်','ဖေ','မတ်','ဧ','မေ','ဇွန်','ဇူ','ဩ','စက်','အောက်','နို','ဒီ'],
    fil:   ['Ene','Peb','Mar','Abr','Mayo','Hun','Hul','Ago','Set','Okt','Nob','Dis'],
    vi:    ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12']
  },
  days: {
    en:    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    'zh-CN':['周日','周一','周二','周三','周四','周五','周六'],
    ms:    ['Ahd','Isn','Sel','Rab','Kha','Jum','Sab'],
    id:    ['Min','Sen','Sel','Rab','Kam','Jum','Sab'],
    bn:    ['রবি','সোম','মঙ্গল','বুধ','বৃহ','শুক্র','শনি'],
    ne:    ['आइत','सोम','मंगल','बुध','बिहि','शुक्र','शनि'],
    hi:    ['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'],
    my:    ['တနင်္ဂ','တနင်္လာ','အင်္ဂါ','ဗုဒ္ဓ','ကြာသပ','သောကြာ','စနေ'],
    fil:   ['Lin','Lun','Mar','Miy','Huw','Biy','Sab'],
    vi:    ['CN','T2','T3','T4','T5','T6','T7']
  },
  // ── Forecast page dynamic text ─────────────────────
  forecast_loading:   { en:'Loading forecast…', 'zh-CN':'正在加载预测…', ms:'Memuatkan ramalan…', id:'Memuat prakiraan…', bn:'পূর্বাভাস লোড হচ্ছে…', ne:'पूर्वानुमान लोड हुँदैछ…', hi:'पूर्वानुमान लोड हो रहा है…', my:'ခန့်မှန်းချက် တင်နေသည်…', fil:'Nino-load ang forecast…', vi:'Đang tải dự báo…' },
  forecast_computing: { en:'⏳ AI models are running in the background… page stays usable!', 'zh-CN':'⏳ AI 模型正在后台运行，页面仍可使用！', ms:'⏳ Model AI sedang berjalan di latar belakang… halaman masih boleh digunakan!', id:'⏳ Model AI sedang berjalan di latar belakang… halaman tetap bisa digunakan!', bn:'⏳ AI মডেল ব্যাকগ্রাউন্ডে চলছে… পেজ ব্যবহারযোগ্য আছে!', ne:'⏳ AI मोडेलहरू पृष्ठभूमिमा चलिरहेका छन्…', hi:'⏳ AI मॉडल पृष्ठभूमि में चल रहे हैं… पेज उपयोग योग्य है!', my:'⏳ AI မော်ဒယ်များ နောက်ခံတွင် လုပ်နေသည်… စာမျက်နှာ သုံးနိုင်ပါသည်!', fil:'⏳ Tumatakbo ang AI models sa background… magagamit pa rin ang page!', vi:'⏳ Mô hình AI đang chạy nền… trang vẫn có thể sử dụng!' },
  not_enough_data:    { en:'Not Enough Data', 'zh-CN':'数据不足', ms:'Data Tidak Mencukupi', id:'Data Tidak Cukup', bn:'পর্যাপ্ত ডেটা নেই', ne:'पर्याप्त डेटा छैन', hi:'पर्याप्त डेटा नहीं', my:'ဒေတာမလုံလောက်ပါ', fil:'Hindi Sapat ang Data', vi:'Không Đủ Dữ Liệu' },
  forecast_error:     { en:'Forecast Error', 'zh-CN':'预测错误', ms:'Ralat Ramalan', id:'Kesalahan Prakiraan', bn:'পূর্বাভাস ত্রুটি', ne:'पूर्वानुमान त्रुटि', hi:'पूर्वानुमान त्रुटि', my:'ခန့်မှန်းချက် အမှား', fil:'Error sa Forecast', vi:'Lỗi Dự Báo' },
  connection_error:   { en:'Connection Error', 'zh-CN':'连接错误', ms:'Ralat Sambungan', id:'Kesalahan Koneksi', bn:'সংযোগ ত্রুটি', ne:'जडान त्रुटि', hi:'कनेक्शन त्रुटि', my:'ချိတ်ဆက်မှု အမှား', fil:'Connection Error', vi:'Lỗi Kết Nối' },
  could_not_connect:  { en:'Could not connect to the forecast service.', 'zh-CN':'无法连接到预测服务。', ms:'Tidak dapat menyambung ke perkhidmatan ramalan.', id:'Tidak dapat terhubung ke layanan prakiraan.', bn:'পূর্বাভাস পরিষেবায় সংযোগ করা যায়নি।', ne:'पूर्वानुमान सेवामा जडान हुन सकेन।', hi:'पूर्वानुमान सेवा से कनेक्ट नहीं हो सका।', my:'ခန့်မှန်းချက်ဝန်ဆောင်မှုသို့ ချိတ်ဆက်မရပါ။', fil:'Hindi makakonekta sa forecast service.', vi:'Không thể kết nối đến dịch vụ dự báo.' },
  actual_sales:       { en:'Actual Sales', 'zh-CN':'实际销售', ms:'Jualan Sebenar', id:'Penjualan Aktual', bn:'প্রকৃত বিক্রয়', ne:'वास्तविक बिक्री', hi:'वास्तविक बिक्री', my:'တကယ့်အရောင်း', fil:'Aktwal na Benta', vi:'Doanh số Thực tế' },
  ai_forecast:        { en:'AI Forecast', 'zh-CN':'AI 预测', ms:'Ramalan AI', id:'Prakiraan AI', bn:'AI পূর্বাভাস', ne:'AI पूर्वानुमान', hi:'AI पूर्वानुमान', my:'AI ခန့်မှန်းချက်', fil:'AI Forecast', vi:'Dự báo AI' },
  no_recipe_warning:  { en:'⚠️ No recipe added — cost and profit will show as {sym} 0.00. Add ingredients to get accurate calculations.', 'zh-CN':'⚠️ 未添加食谱 — 成本和利润将显示为 {sym} 0.00。请添加食材以获得准确的计算结果。', ms:'⚠️ Tiada resipi ditambah — kos dan keuntungan akan ditunjukkan sebagai {sym} 0.00. Tambah bahan untuk pengiraan yang tepat.', id:'⚠️ Belum ada resep — biaya dan keuntungan akan tampil sebagai {sym} 0.00. Tambahkan bahan untuk perhitungan yang akurat.', bn:'⚠️ কোনো রেসিপি যোগ করা হয়নি — খরচ এবং মুনাফা {sym} 0.00 দেখাবে। সঠিক হিসাবের জন্য উপাদান যোগ করুন।', ne:'⚠️ कुनै रेसिपी थपिएको छैन — लागत र नाफा {sym} 0.00 देखाउनेछ। सही गणनाको लागि सामग्री थप्नुहोस्।', hi:'⚠️ कोई रेसिपी नहीं जोड़ी गई — लागत और लाभ {sym} 0.00 दिखाएगा। सटीक गणना के लिए सामग्री जोड़ें।', my:'⚠️ နုစ်ပွဲနည်းဥပဒေမထည့်ရသေး — ကုန်ကျစရိတ်နှင့်အမြတ် {sym} 0.00 ပြနေမည်။ မှန်ကန်သောတွက်ချက်မှုအတွက် ပါဝင်ပစ္စည်းထည့်ပါ။', fil:'⚠️ Walang recipe na naidagdag — ang gastos at kita ay magpapakita ng {sym} 0.00. Magdagdag ng sangkap para sa tamang kalkulasyon.', vi:'⚠️ Chưa thêm công thức — chi phí và lợi nhuận sẽ hiển thị là {sym} 0.00. Thêm nguyên liệu để có kết quả tính toán chính xác.' },
  no_recipe_dashboard:{ en:'⚠️ <strong>Cost shows {sym} 0.00</strong> — one or more products sold today may not have a recipe linked. Profit figures may be inaccurate. Go to <a href="/products" style="color:#856404;font-weight:700;">Products</a> to add ingredients.', 'zh-CN':'⚠️ <strong>成本显示 {sym} 0.00</strong> — 今天售出的一种或多种产品可能没有关联食谱。利润数据可能不准确。前往<a href="/products" style="color:#856404;font-weight:700;">产品页面</a>添加食材。', ms:'⚠️ <strong>Kos menunjukkan {sym} 0.00</strong> — satu atau lebih produk yang dijual hari ini mungkin tiada resipi. Angka keuntungan mungkin tidak tepat. Pergi ke <a href="/products" style="color:#856404;font-weight:700;">Produk</a> untuk tambah bahan.', id:'⚠️ <strong>Biaya menunjukkan {sym} 0.00</strong> — satu atau lebih produk yang terjual hari ini mungkin tidak memiliki resep. Angka keuntungan mungkin tidak akurat. Buka <a href="/products" style="color:#856404;font-weight:700;">Produk</a> untuk menambahkan bahan.', bn:'⚠️ <strong>খরচ {sym} 0.00 দেখাচ্ছে</strong> — আজ বিক্রিত এক বা একাধিক পণ্যে রেসিপি নাও থাকতে পারে। মুনাফার তথ্য নির্ভুল নাও হতে পারে। উপাদান যোগ করতে <a href="/products" style="color:#856404;font-weight:700;">পণ্য</a> পাতায় যান।', ne:'⚠️ <strong>लागत {sym} 0.00 देखाउँदैछ</strong> — आज बेचिएका एक वा बढी उत्पादनमा रेसिपी नहुन सक्छ। नाफाको तथ्याङ्क सही नहुन सक्छ। बाँधिएको सामग्री थप्न <a href="/products" style="color:#856404;font-weight:700;">उत्पाद</a> मा जानुहोस्।', hi:'⚠️ <strong>लागत {sym} 0.00 दिखा रही है</strong> — आज बेचे गए एक या अधिक उत्पादों में रेसिपी नहीं जुड़ी हो सकती है। लाभ के आंकड़े गलत हो सकते हैं। सामग्री जोड़ने के लिए <a href="/products" style="color:#856404;font-weight:700;">उत्पाद</a> पर जाएं।', my:'⚠️ <strong>ကုန်ကျစရိတ် {sym} 0.00 ပြနေသည်</strong> — ယနေ့ရောင်းသောထုတ်ကုန်တစ်ခု သို့မဟုတ် တစ်ခုထက်ပို၍ နုစ်ပွဲနည်းမချိတ်ဆက်ရသေး။ အမြတ်ဂဏန်းများ မမှန်နိုင်ပါ။ ပါဝင်ပစ္စည်းထည့်ရန် <a href="/products" style="color:#856404;font-weight:700;">ထုတ်ကုန်</a> သို့သွားပါ။', fil:'⚠️ <strong>Nagpapakita ng {sym} 0.00 ang gastos</strong> — maaaring walang recipe ang isa o higit pang produktong nabenta ngayon. Maaaring hindi tumpak ang kita. Pumunta sa <a href="/products" style="color:#856404;font-weight:700;">Mga Produkto</a> para magdagdag ng sangkap.', vi:'⚠️ <strong>Chi phí hiển thị {sym} 0.00</strong> — một hoặc nhiều sản phẩm bán hôm nay có thể chưa có công thức. Số liệu lợi nhuận có thể không chính xác. Vào <a href="/products" style="color:#856404;font-weight:700;">Sản phẩm</a> để thêm nguyên liệu.' },
};

// Helper: get translated string by key, falls back to English
window.t = function(key, vars) {
  const lang = localStorage.getItem("selectedLang") || "en";
  const group = window.UI_STRINGS[key];
  if (!group) return key;
  let str = group[lang] || group["en"] || key;
  if (vars) Object.keys(vars).forEach(k => { str = str.replace(new RegExp('{' + k + '}', 'g'), vars[k]); });
  return str;
};

// Helper: get month labels array for current language
window.getMonthLabels = function() {
  const lang = localStorage.getItem("selectedLang") || "en";
  return window.UI_STRINGS.months[lang] || window.UI_STRINGS.months["en"];
};

// Helper: get day labels array for current language
window.getDayLabels = function() {
  const lang = localStorage.getItem("selectedLang") || "en";
  return window.UI_STRINGS.days[lang] || window.UI_STRINGS.days["en"];
};

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
    // On mobile: start collapsed (hidden off-screen)
    if (window.innerWidth <= 768) {
      sidebar.classList.add('collapsed');
    }
    // Sync body class with current sidebar state on page load
    document.body.classList.toggle('sidebar-collapsed', sidebar.classList.contains('collapsed'));
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-collapsed', sidebar.classList.contains('collapsed'));
    });
    // Tap outside sidebar closes it on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
        const sidebarRect = sidebar.getBoundingClientRect();
        if (e.clientX > sidebarRect.right) {
          sidebar.classList.add('collapsed');
        }
      }
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
