import React from 'react';

export const NewsletterSignup: React.FC = () => {
    return (
        <section className="py-24 bg-[#1A1410] relative select-none">
            <div className="max-w-[900px] mx-auto px-6 md:px-8 text-center newsletter-glow bg-white/5 border border-white/10 rounded-[3rem] py-16 backdrop-blur-md">
                <h2 className="font-headline-md text-white text-3xl md:text-4xl font-bold mb-4">
                    Đừng bỏ lỡ ưu đãi nào
                </h2>
                <p className="text-white/60 mb-10 max-w-lg mx-auto text-sm leading-relaxed">
                    Đăng ký nhận bản tin để cập nhật những chuyến xe sớm nhất và các mã giảm giá bí mật chỉ dành riêng cho bạn.
                </p>
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        alert('Đăng ký nhận bản tin thành công!');
                        (e.target as HTMLFormElement).reset();
                    }}
                    className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto"
                >
                    <input
                        type="email"
                        required
                        placeholder="Địa chỉ email của bạn..."
                        className="flex-1 px-8 py-4 bg-white/5 border border-white/10 focus:border-primary rounded-full text-white focus:outline-none placeholder:text-white/30 text-sm transition-all duration-300"
                    />
                    <button
                        type="submit"
                        className="shimmer-btn px-10 py-4 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 whitespace-nowrap cursor-pointer shadow-md"
                    >
                        Đăng ký ngay
                    </button>
                </form>
                <p className="text-white/20 text-[10px] uppercase tracking-wider mt-6 font-semibold">
                    Chúng tôi cam kết bảo mật thông tin và không spam.
                </p>
            </div>
        </section>
    );
};
