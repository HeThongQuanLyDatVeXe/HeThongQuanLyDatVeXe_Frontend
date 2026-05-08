import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="flex flex-col w-full font-body-md mt-auto">
      {/* Layer 1: Newsletter Banner */}
      <div className="bg-[#24180F] py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 max-w-lg">
            <h2 className="font-headline-md italic text-white mb-2 text-[26px]">
              Nhận ưu đãi độc quyền mỗi tuần
            </h2>
            <p className="text-[14px] text-[#A89080]">
              Đăng ký để nhận mã giảm giá, thông báo tuyến mới và ưu đãi thành viên.
            </p>
          </div>
          <div className="flex-1 w-full max-w-md">
            <form className="flex w-full items-stretch rounded-xl overflow-hidden border border-[#A89080]/30 focus-within:border-[#F4600C] transition-colors duration-300">
              <input
                className="bg-transparent border-none text-white placeholder:text-[#A89080] font-body-md px-4 py-3 flex-1 focus:ring-0 focus:outline-none"
                placeholder="Email của bạn"
                required
                type="email"
              />
              <button
                className="bg-[#F4600C] text-white font-body-md font-semibold px-6 py-3 hover:bg-[#c94c00] transition-colors duration-300"
                type="submit"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Layer 2: Main Footer Content */}
      <div className="bg-[#1A1410] py-20 px-6 text-[#F9F2EC]/80 border-b border-[#24180F]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-20 lg:gap-6">
          {/* Column 1: Brand */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 text-[#F4600C]">
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
              <span className="font-display-hero italic text-[28px] leading-none">Đi Về Nhà</span>
            </Link>
            <p className="text-[14px] leading-relaxed">
              Hành trình về nhà — nhanh chóng, an toàn, đáng tin.
            </p>
            <div className="flex gap-3 mt-1">
              {/* social icons from HTML */}
              <a href="#" className="w-10 h-10 rounded-full bg-[#24180F] flex items-center justify-center hover:bg-[#F4600C] hover:text-white transition-all duration-300">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#24180F] flex items-center justify-center hover:bg-[#F4600C] hover:text-white transition-all duration-300">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#24180F] flex items-center justify-center hover:bg-[#F4600C] hover:text-white transition-all duration-300">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>
              </a>
            </div>
          </div>
          
          {/* Column 2 */}
          <div className="flex flex-col gap-3">
            <h3 className="font-headline-md text-[18px] text-white mb-1">Tuyến phổ biến</h3>
            <ul className="flex flex-col gap-1 text-[14px]">
              <li><Link to="/search" className="hover:text-[#F4600C] transition-colors duration-200">Hà Nội → TP.HCM</Link></li>
              <li><Link to="/search" className="hover:text-[#F4600C] transition-colors duration-200">Hà Nội → Sapa</Link></li>
              <li><Link to="/search" className="hover:text-[#F4600C] transition-colors duration-200">TP.HCM → Đà Lạt</Link></li>
              <li><Link to="/search" className="hover:text-[#F4600C] transition-colors duration-200">TP.HCM → Nha Trang</Link></li>
              <li><Link to="/search" className="hover:text-[#F4600C] transition-colors duration-200">Đà Nẵng → Hội An</Link></li>
              <li><Link to="/search" className="hover:text-[#F4600C] transition-colors duration-200">Hải Phòng → Hạ Long</Link></li>
              <li><Link to="/search" className="hover:text-[#F4600C] transition-colors duration-200">Cần Thơ → TP.HCM</Link></li>
            </ul>
            <Link to="/search" className="text-[#FFB347] hover:text-[#F4600C] text-[14px] mt-1 flex items-center gap-1 transition-colors duration-200">
              Xem tất cả tuyến <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          
          {/* Column 3 */}
          <div className="flex flex-col gap-3">
            <h3 className="font-headline-md text-[18px] text-white mb-1">Về chúng tôi</h3>
            <ul className="flex flex-col gap-1 text-[14px]">
              <li><Link to="/about" className="hover:text-[#F4600C] transition-colors duration-200">Về Đi Về Nhà</Link></li>
              <li><Link to="/about" className="hover:text-[#F4600C] transition-colors duration-200">Đội ngũ & Sứ mệnh</Link></li>
              <li><Link to="/careers" className="hover:text-[#F4600C] transition-colors duration-200">Tuyển dụng</Link></li>
              <li><Link to="/press" className="hover:text-[#F4600C] transition-colors duration-200">Báo chí</Link></li>
              <li><Link to="/partners" className="hover:text-[#F4600C] transition-colors duration-200">Đối tác vận tải</Link></li>
            </ul>
          </div>
          
          {/* Column 4 */}
          <div className="flex flex-col gap-3">
            <h3 className="font-headline-md text-[18px] text-white mb-1">Hỗ trợ</h3>
            <ul className="flex flex-col gap-1 text-[14px]">
              <li><Link to="/support" className="hover:text-[#F4600C] transition-colors duration-200">Trung tâm hỗ trợ</Link></li>
              <li><Link to="/refund" className="hover:text-[#F4600C] transition-colors duration-200">Chính sách hoàn vé</Link></li>
              <li><Link to="/guide" className="hover:text-[#F4600C] transition-colors duration-200">Hướng dẫn đặt vé</Link></li>
              <li><Link to="/faq" className="hover:text-[#F4600C] transition-colors duration-200">Câu hỏi thường gặp</Link></li>
              <li><Link to="/feedback" className="hover:text-[#F4600C] transition-colors duration-200">Góp ý & Khiếu nại</Link></li>
            </ul>
          </div>
          
          {/* Column 5 */}
          <div className="flex flex-col gap-3">
            <h3 className="font-headline-md text-[18px] text-white mb-1">Liên hệ</h3>
            <ul className="flex flex-col gap-3 text-[14px]">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#F4600C] text-[20px]">location_on</span>
                <span>Tầng 4, Tòa nhà Golden Hour, 123 Đường Sáng, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#F4600C] text-[20px]">call</span>
                <a className="hover:text-[#F4600C] transition-colors duration-200 font-semibold" href="tel:18006789">1800 6789</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#F4600C] text-[20px]">mail</span>
                <a className="hover:text-[#F4600C] transition-colors duration-200" href="mailto:support@divevnha.vn">support@divevnha.vn</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Layer 3: Bottom Bar */}
      <div className="bg-[#110D0A] py-6 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[12px] text-[#A89080]">
          <p>© 2026 Đi Về Nhà. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-white transition-colors duration-200">Điều khoản</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-white transition-colors duration-200">Bảo mật</Link>
            <span>·</span>
            <Link to="/cookies" className="hover:text-white transition-colors duration-200">Cookie</Link>
          </div>
          <p>Được xây dựng với <span className="text-[#F4600C]">🧡</span> tại Việt Nam</p>
        </div>
      </div>
    </footer>
  );
}
