import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/new_logo.png';
import { FacebookLogo, ShareNetwork, Envelope } from '@phosphor-icons/react';
import { ROUTES } from '../../constants/routes';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A1410] text-white/60 w-full pt-20 pb-10 border-t-4 border-primary">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16 md:mb-20">
          {/* Column 1: Brand Logo & Socials */}
          <div className="flex flex-col gap-6">
            <Link to={ROUTES.HOME} className="text-3xl font-serif font-black text-white flex items-center gap-3">
              <img 
                src={logo} 
                alt="Đi Về Nhà Logo" 
                className="h-9 w-auto grayscale brightness-200"
              />
              <span className="text-white font-bold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Đi Về Nhà
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/50">
              Mang yêu thương về với gia đình qua từng chuyến xe chất lượng cao và dịch vụ tận tâm nhất Việt Nam.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-primary transition-all duration-300"
                aria-label="Facebook"
              >
                <FacebookLogo size={20} weight="fill" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-primary transition-all duration-300"
                aria-label="Share"
              >
                <ShareNetwork size={20} />
              </a>
              <a 
                href="mailto:support@divenha.vn" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-primary transition-all duration-300"
                aria-label="Email"
              >
                <Envelope size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Discover Links */}
          <div className="flex flex-col gap-6">
            <h4 className="font-semibold text-xs tracking-wider uppercase text-primary font-body" style={{ letterSpacing: '0.1em' }}>
              Khám Phá
            </h4>
            <ul className="flex flex-col gap-4 text-sm text-white/50">
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Tin tức &amp; Sự kiện</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Hệ thống trạm dừng</a></li>
            </ul>
          </div>

          {/* Column 3: Support Links */}
          <div className="flex flex-col gap-6">
            <h4 className="font-semibold text-xs tracking-wider uppercase text-primary font-body" style={{ letterSpacing: '0.1em' }}>
              Hỗ Trợ
            </h4>
            <ul className="flex flex-col gap-4 text-sm text-white/50">
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Quy định hành lý</a></li>
            </ul>
          </div>

          {/* Column 4: App Download Links */}
          <div className="flex flex-col gap-6">
            <h4 className="font-semibold text-xs tracking-wider uppercase text-primary font-body" style={{ letterSpacing: '0.1em' }}>
              Tải Ứng Dụng
            </h4>
            <div className="flex flex-col gap-4">
              <a 
                href="#" 
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 w-fit md:w-full max-w-[200px]"
              >
                <img 
                  alt="App Store" 
                  className="h-5 w-auto" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuChN01hvqLLySeHQfgtOOP1op5FI_1hjRLrgITlDi-yaNNIN6gEBFGonLgYF19sRF5bxHrfAYino2tgtVPnJcf5uUz2IKAE8H_axe-XpjwGn2UjsfKbl-14dAIwEitWySlNugbaqEgXHY8gVr_3GLK9N--sF0XESGqlEYEs5ttuIjmyNXNi_qs_rRjCAwu006wMR6gYyiWsz9vfzlBofqoMV0xJ_cnPmUfQjznk0NkmTJIeQ_ZbOt4kiq8Vrhif--b9s6wvvtEuP9M"
                />
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 w-fit md:w-full max-w-[200px]"
              >
                <img 
                  alt="Google Play" 
                  className="h-5 w-auto" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbEs0_yVO8EseDuX_fRIMR6_UUx9JnkEslpNsAkxF74Ky0xtkX1BtKSTyGD7sNxfhGWYPyijs_eGCVng6wopuJfiEEpGrp5o-x3t8yz9FlzFh-zBc-u3wy5UJ0wMG-0IgcnvgrsUh4r2oo3kZlZ7ZguQ6htFjc4ja11GQL-uVqYn17ZYX2xvqlvyeUx7AxBBjl4F2gBNDIk3VtbDIqW0yzYGGRhi10pkU0J2zoqPq1FM51fN6xtj6C_IgObQKIkxSJlHcO0QBBkLY"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-xs text-white/40">
          <p>© 2026 Đi Về Nhà. All rights reserved. Công ty TNHH Vận Tải &amp; Dịch Vụ Đi Về Nhà.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Chính sách</a>
            <a href="#" className="hover:text-white transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};