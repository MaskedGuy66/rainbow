// constants/ChatData.ts (Phần bổ sung)

export const BOT_RESPONSES: Record<string, string> = {
    // Tài khoản & Bảo mật

    'password': 'To reset your password, go to the Login page and tap "Forgot Password". You will receive a reset email within minutes.',

    'mật khẩu': 'Để đặt lại mật khẩu, bạn vào trang Đăng nhập > chọn "Quên mật khẩu". Hệ thống sẽ gửi email hướng dẫn cho bạn.',

    'verify': 'To verify your email, go to Profile > Resend Verification. Check your inbox and spam folder.',

    'xác thực': 'Để xác thực email, bạn vào Cá nhân > Gửi lại mã xác nhận. Đừng quên kiểm tra cả hòm thư rác nhé!',



    // Ngân hàng & Giao dịch

    'bank': 'To connect your bank, tap the bank notification on the home screen or go to Profile > Bank Connection > Connect Bank.',

    'ngân hàng': 'Để liên kết ngân hàng, bạn vào mục Cá nhân > Liên kết ngân hàng. Hệ thống hỗ trợ hầu hết các ngân hàng tại VN.',

    'transaction': 'To add a transaction, tap the + button on the home screen. Fill in amount, category, type, and save.',

    'giao dịch': 'Để thêm giao dịch, hãy nhấn nút (+) ở màn hình chính. Bạn có thể chọn danh mục và đính kèm ảnh hóa đơn.',

    'delete': 'To delete a transaction, tap on it to open the edit screen, then tap the delete button at the bottom.',

    'xóa': 'Để xóa giao dịch, bạn nhấn vào giao dịch đó rồi chọn biểu tượng thùng rác ở góc dưới màn hình.',



    // Tính năng cộng đồng

    'friend': 'To add friends, open the menu > Ket Ban, then search by email and send a friend request.',

    'kết bạn': 'Để kết bạn, vào Menu > Kết bạn. Bạn có thể tìm kiếm theo địa chỉ email của bạn bè.',

    'group': 'To create a group fund, open the menu > Quy Chung, then fill in the fund name, target amount, and invite friends.',

    'quỹ chung': 'Quỹ chung giúp bạn quản lý chi tiêu nhóm. Vào Menu > Quỹ chung để tạo mới và mời thành viên tham gia.',



    // Heo đất & Tiết kiệm

    'heo': 'Heo Dat (Piggy Bank) lets you save toward goals. Open menu > Heo Dat to create savings goals and deposit money.',

    'tiết kiệm': 'Tính năng Heo Đất giúp bạn tích lũy cho mục tiêu cụ thể. Hãy vào Menu > Heo Đất để bắt đầu "nuôi" heo nhé!',



    // Tiện ích khác

    'export': 'To export transactions, open menu > Xuat Excel. A CSV file will be downloaded to your device.',

    'excel': 'Bạn có thể xuất báo cáo ra file Excel tại mục Menu > Xuất Excel để xem trên máy tính.',

    'sign out': 'To sign out, go to Profile and tap the Sign Out button.',

    'đăng xuất': 'Nút đăng xuất nằm ở cuối trang hồ sơ Cá nhân của bạn.',



    // Chào hỏi

    'hello': 'Hello! I am MoneyMeow Support Bot. How can I help you today?',

    'xin chào': 'Chào bạn! Mình là trợ lý ảo của MoneyMeow. Bạn cần mình hỗ trợ gì về ứng dụng không?',

    'hi': 'Hi there! I am MoneyMeow Support Bot. Ask about any feature or type "call" or "email" to contact staff.',


    // Lỗi & Sự cố (Troubleshooting)
    'error': 'If you encounter an error, please try restarting the app or clearing the cache. If it persists, send a screenshot to support@moneymeow.app.',
    'lỗi': 'Nếu gặp lỗi ứng dụng, bạn thử khởi động lại app hoặc kiểm tra kết nối mạng. Nếu vẫn không được, hãy chụp màn hình và gửi cho mình nhé!',
    'slow': 'The app might be slow due to a weak internet connection. Try switching to 4G or another Wi-Fi.',
    'chậm': 'Ứng dụng chạy chậm có thể do kết nối mạng không ổn định. Bạn thử chuyển sang WiFi khác hoặc 4G xem sao nhé.',
    'không thấy': 'Nếu không thấy giao dịch vừa thêm, hãy vuốt xuống ở màn hình chính để làm mới (Reload) dữ liệu.',

    // Bảo mật nâng cao
    'biometric': 'To enable FaceID/Fingerprint, go to Profile > Security > Enable Biometrics.',
    'vân tay': 'Bạn có thể bật đăng nhập bằng vân tay hoặc FaceID tại mục Cá nhân > Bảo mật > Xác thực sinh trắc học.',
    'faceid': 'MoneyMeow hỗ trợ FaceID để bảo mật ứng dụng. Kích hoạt trong phần Cài đặt > Bảo mật.',
    'privacy': 'Your data is encrypted and secure. We never share your financial information with third parties.',
    'bảo mật': 'MoneyMeow sử dụng mã hóa đầu cuối để bảo vệ dữ liệu của bạn. Bạn hoàn toàn có thể yên tâm về tính riêng tư.',

    // Phân tích & Báo cáo
    'report': 'Check your spending patterns in the "Statistics" tab. You can view by week, month, or category.',
    'báo cáo': 'Mục "Thống kê" sẽ giúp bạn xem biểu đồ chi tiêu theo tuần/tháng để biết mình đã tiêu gì nhiều nhất.',
    'chart': 'Our charts help you visualize income vs. expenses. Tap on each slice for details.',
    'biểu đồ': 'Bạn nhấn vào mục Thống kê để xem biểu đồ tròn và cột về tình hình tài chính của mình nhé.',

    // Hạn mức chi tiêu (Budgeting)
    'budget': 'To set a budget, go to the Budget tab > Create Budget. We will notify you when you reach 80% of your limit.',
    'hạn mức': 'Bạn vào mục "Ngân sách" để đặt giới hạn chi tiêu cho từng danh mục. App sẽ báo nếu bạn tiêu quá đà!',
    'cảnh báo': 'Hệ thống sẽ gửi thông báo khi bạn chi tiêu gần chạm mức giới hạn đã đặt trong tháng.',

    // Gói Premium / Nâng cấp
    'premium': 'MoneyMeow Premium offers unlimited group funds, ad-free experience, and advanced Excel exports.',
    'nâng cấp': 'Gói Premium giúp bạn tạo không giới hạn quỹ chung, không quảng cáo và có thêm nhiều biểu đồ chuyên sâu.',
    'free': 'The basic version of MoneyMeow is free forever with all essential tracking features.',
    'miễn phí': 'Các tính năng quản lý chi tiêu cơ bản của MoneyMeow luôn miễn phí để mọi người cùng sử dụng.',

    // Câu hỏi vui / Easter Egg
    'who': 'I am MoneyMeow, your smart financial assistant. My mission is to help you save more!',
    'là ai': 'Mình là mèo máy MoneyMeow, người bạn đồng hành giúp bạn quản lý túi tiền hiệu quả hơn mỗi ngày! 🐾',
    'mèo': 'Meow! Mình rất yêu những đồng tiền tiết kiệm của bạn. Hãy nuôi heo đều đặn nhé! 🐱',
};

// Cập nhật hàm logic để xử lý thông minh hơn (Regex hoặc Keyword matching tốt hơn)
export function getBotResponse(userMessage: string): string {
    const lower = userMessage.toLowerCase().trim();

    // 1. Ưu tiên xử lý Chào hỏi ngắn
    if (lower === 'hi' || lower === 'hello' || lower === 'alo') {
        return BOT_RESPONSES['hello'];
    }

    // 2. Tìm kiếm trong từ điển (Duyệt qua các key)
    for (const [key, response] of Object.entries(BOT_RESPONSES)) {
        if (lower.includes(key)) return response;
    }

    // 3. Xử lý thông tin liên hệ (Giữ nguyên logic cũ nhưng thêm từ khóa)
    if (/(call|phone|hotline|gọi|liên hệ|sđt)/.test(lower)) {
        return `Our support line is ready to help:\n📞 ${CONTACT_INFO.hotline}\n\nWork hours:\n${CONTACT_INFO.workTime}`;
    }

    if (/(email|mail|staff|nhân viên|hỗ trợ)/.test(lower)) {
        return `You can reach our team at:\n📧 ${CONTACT_INFO.email}\n\nWe typically respond within 24 hours.`;
    }

    // 4. Cảm ơn
    if (/(thank|cảm ơn|thanks|tks|cam on)/.test(lower)) {
        return 'You are welcome! Rất vui được hỗ trợ bạn. Chúc bạn một ngày chi tiêu hợp lý! ❤️';
    }

    // 5. Phản hồi mặc định (Cập nhật danh sách gợi ý phong phú hơn)
    return 'I don\'t quite understand. You can ask about: "bank", "password", "budget", "export excel" or "heo dat".\n\n(Bạn thử hỏi về: "liên kết ngân hàng", "đặt hạn mức", "xem báo cáo" hoặc "quỹ chung" nhé!)';
}
export const CONTACT_INFO = {

    hotline: '1900-6736',

    email: 'support@moneymeow.app',

    workTime: 'Mon-Fri: 8:00 - 20:00\nSat-Sun: 9:00 - 17:00'

};