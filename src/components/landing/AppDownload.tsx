import React from 'react';

export const AppDownload: React.FC = () => {
    return (
        <section className="py-24 bg-gradient-to-br from-surface-container-high to-surface-container-lowest overflow-hidden">
            <div className="max-w-[1200px] mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
                {/* Copy Column */}
                <div className="flex flex-col gap-6 md:gap-8 order-2 lg:order-1 text-left">
                    <h2 className="font-headline-md text-4xl md:text-5xl leading-tight font-bold">
                        Mang cả hành trình <br />
                        <span className="text-primary italic">trong túi áo của bạn</span>
                    </h2>
                    <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
                        Tải ngay ứng dụng Đi Về Nhà để nhận thông báo hành trình thời gian thực, tích điểm đổi quà và hưởng ưu đãi độc quyền hàng tuần.
                    </p>
                    <div className="flex flex-wrap gap-4 select-none">
                        <a 
                            href="#" 
                            onClick={(e) => e.preventDefault()}
                            className="flex items-center gap-3 bg-on-background hover:bg-black text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300 shadow-md"
                        >
                            <img 
                                alt="App Store" 
                                className="h-6 w-auto" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJBK_c19NiQ1wJWLMBsGnZkaVm8I9bNScrRP2-uxfmDlX1BzunARSNggHfHg129l7QTNqCcerESc-gtSHrAMWf6R641JjZtKrxav6OzgiHWoe6I-Jnkd_F0zP37dwbiLDImN2krsJ-_qasleJABbY0wHhlm-K18bo9gI3Whi0HpMSlD2Pi9LijPMzMvtAQPSiITTIS8SvIV7xfm9Se4POF-_45i73-MWDho2sg2xxBl396gPWTt2z-bnn1oR_V7O4fF7Oc1DIHaZE"
                            />
                        </a>
                        <a 
                            href="#" 
                            onClick={(e) => e.preventDefault()}
                            className="flex items-center gap-3 bg-on-background hover:bg-black text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300 shadow-md"
                        >
                            <img 
                                alt="Google Play" 
                                className="h-6 w-auto" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB0dgsHawF062I8Ig_Jimit8E3htCDlyad5DLi9A9ggKfN-HC447lvVVp57ZkXwnNMSvNEVpAIJJOvdKp3mcYwGOcZX8SPO7rdhTaLvdsagd65gPvvPNra58w9VVm7SXe9CAptz6m26X7KhP0QGBGHAYggENPB5mL6XDnZ_uyruLeK-6NqIQJGTmudEsUNZmydyebKJUrd8vdHrMdw8A_-k6EAvyD1uRiwWKbgso-O--WVtYWufGFcfcnlmu0ljdPPKy7WfQB-LHU"
                            />
                        </a>
                    </div>
                    {/* Profiles stack */}
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex -space-x-3 select-none">
                            <img alt="User avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2Q7cW-WysQlaOA_eyYOJpod869r-qKILsQeBidB1Nrzs16cHW7PiGWkYn96gBUvk97mxo3nKU3yeAwB4UP7AOuA5wtxnTgBctxMu4-qOs3gGXN2Vh1Zhpe9xHcu0VDYxPqZFH1AqJXSwK8AzmgHUmjJgi-ASkiR5zcGoj-jS-M6u5OD-ssSULentFfNTBqvBB8owoha0Akoa6jWSoMALSvzXjDE0gzDNuYF8i8QSGgsbjkuQxZp81m80Qfuhqx39NINQ9tsUrpzg" />
                            <img alt="User avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMtNzWQBIuzZHUUKlliQXszthF1jZsAu_iDCzxYnw8zolYQWW8WVWs7NOmehjzyGaj5dy_G756slaRoV013NEHjMGjT0sFxUc5Oo44Agla7FMnlCP66NV3EiPi6ha8JS2ajc48X2rnGX1ILt8Rbif_-2rQeHVJEqsjqdsWj9xZqYax35doIcHpZRTSydSvlF5yex5Omw3_7_7ssHxf4BrAcasX6F6VE1EywUQJqTvo_y_0CO4cb1Ocy9g4-2oEDzJspImgMprarmQ" />
                            <img alt="User avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_FrWEekITSVSBaguKmGKdob76ZX2YTcWxSx8qQ3TOfUjy0MvyIQ1suBirJH99aMJSNUi6hUWwdmOKJmmtU3T6i55Cxrl108ErVZNbUZXUPZfhovTB-yEhvrPiHGuAYxmxoZBpsmhRKrZr5rPI8qmnx2cUY5Nruq-h7KN7oQVon5yuYVD0eimS7L1yJEO61mTS2HJ_MxWa2cp6WKZXWELXuqBli4jdOq_aqCczUNmV57VENgplXhuTKtaPxE0kXsOvXf41cJT0ZK0" />
                        </div>
                        <p className="text-sm text-on-surface-variant font-bold">Hơn 50,000+ người đã tải xuống</p>
                    </div>
                </div>

                {/* Smartphone Mockup */}
                <div className="relative order-1 lg:order-2 flex justify-center">
                    <div className="w-72 h-[580px] bg-on-background rounded-[3rem] border-[8px] border-on-surface-variant shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-on-background rounded-b-2xl z-20" />
                        <img 
                            alt="App Screenshot" 
                            className="w-full h-full object-cover select-none pointer-events-none" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7DEGQ7m8X8faMrCOLkBJZEPLlVkposJjQufDnC7HdwCPH7YT7e28ggMR0osX-lFmTS68ddPXPcEiBsaAF-jqhxPg6Zg6nup40EvAWvtHcgfQuKU9Tr-pahWB1VM_m31MAOHjPV3OeUV_VNLezvmfv7-qc-bnAikRnRh8JojaZqS8pDRPgUlTqMCIv9pqEJtFmVtRTg8xeiIGWB1Fjfcv3mk4TFkSTlgiSKPrgDHOtx5BsSRnYCzaCXrk5SOsT06BR9zTkMLtgJOg" 
                        />
                    </div>
                    {/* Glow Ambient behind phone */}
                    <div className="absolute -z-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                </div>
            </div>
        </section>
    );
};
