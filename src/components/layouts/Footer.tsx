export const Footer: React.FC = () => (
  <footer className="bg-slate-900 text-slate-400 py-12">
    <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">D</span>
          </div>
          <span className="text-white font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>DivEnha</span>
        </div>
        <p className="text-sm leading-relaxed">Nền tảng đặt vé xe khách uy tín, tiện lợi, tiết kiệm thời gian.</p>
      </div>
      {[
        { title: 'Dịch vụ', items: ['Tìm chuyến', 'Đặt vé', 'Theo dõi vé', 'Hoàn/Đổi vé'] },
        { title: 'Hỗ trợ', items: ['Hướng dẫn', 'Câu hỏi thường gặp', 'Liên hệ', 'Phản hồi'] },
        { title: 'Công ty', items: ['Giới thiệu', 'Tuyển dụng', 'Chính sách', 'Điều khoản'] },
      ].map(({ title, items }) => (
        <div key={title}>
          <h4 className="text-white text-sm font-semibold mb-3">{title}</h4>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item}><a href="#" className="text-sm hover:text-amber-400 transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t border-slate-800 text-center text-xs">
      © 2025 DivEnha. All rights reserved.
    </div>
  </footer>
);