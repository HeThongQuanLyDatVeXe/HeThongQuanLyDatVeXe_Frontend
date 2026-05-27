import React from 'react';

export const AdminChartsRow: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Revenue Chart */}
            <div
                className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-sm relative overflow-hidden"
                style={{ border: '1px solid #E8D5C4' }}
            >
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h4
                            className="text-xl font-semibold"
                            style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
                        >
                            Biểu đồ Doanh thu
                        </h4>
                        <p className="text-stone-500 text-sm">30 ngày gần nhất (Triệu VND)</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#F4600C' }} />
                            <span className="text-stone-600">Năm nay</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full inline-block bg-stone-200" />
                            <span className="text-stone-600">Năm ngoái</span>
                        </div>
                    </div>
                </div>

                {/* SVG Chart */}
                <div className="relative h-[200px] w-full">
                    <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#F4600C" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#F4600C" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="0" x2="800" y1="50" y2="50" stroke="#F9F2EC" strokeWidth="1" />
                        <line x1="0" x2="800" y1="100" y2="100" stroke="#F9F2EC" strokeWidth="1" />
                        <line x1="0" x2="800" y1="150" y2="150" stroke="#F9F2EC" strokeWidth="1" />
                        {/* Area fill */}
                        <path
                            d="M0,160 Q100,140 200,165 T400,120 T600,150 T800,100 L800,200 L0,200 Z"
                            fill="url(#chartGradient)"
                        />
                        {/* Current year line */}
                        <path
                            d="M0,160 Q100,140 200,165 T400,120 T600,150 T800,100"
                            fill="none"
                            stroke="#F4600C"
                            strokeWidth="2.5"
                        />
                        {/* Last year dashed */}
                        <path
                            d="M0,175 Q100,165 200,185 T400,155 T600,170 T800,145"
                            fill="none"
                            stroke="#E8D5C4"
                            strokeWidth="2"
                            strokeDasharray="5 4"
                        />
                    </svg>
                    <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        <span>01 Tháng 10</span>
                        <span>10 Tháng 10</span>
                        <span>20 Tháng 10</span>
                        <span>30 Tháng 10</span>
                    </div>
                </div>
            </div>

            {/* Vehicle distribution donut */}
            <div
                className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-sm flex flex-col"
                style={{ border: '1px solid #E8D5C4' }}
            >
                <h4
                    className="text-xl font-semibold mb-1"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
                >
                    Phân bổ loại xe
                </h4>
                <p className="text-stone-500 text-sm mb-6">Thị phần theo phương tiện</p>

                <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Donut ring */}
                    <div className="relative w-36 h-36">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                            <circle cx="60" cy="60" r="48" fill="none" stroke="#f5f5f4" strokeWidth="16" />
                            <circle
                                cx="60" cy="60" r="48" fill="none" stroke="#F4600C" strokeWidth="16"
                                strokeDasharray={`${0.58 * 301.6} ${301.6}`}
                            />
                            <circle
                                cx="60" cy="60" r="48" fill="none" stroke="#FFB347" strokeWidth="16"
                                strokeDasharray={`${0.32 * 301.6} ${301.6}`}
                                strokeDashoffset={`-${0.58 * 301.6}`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>42</span>
                            <span className="text-[9px] uppercase font-bold text-stone-400">Xe chạy</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 w-full space-y-2.5">
                        {[
                            { label: 'Giường nằm', pct: '58%', color: '#F4600C' },
                            { label: 'Limousine', pct: '32%', color: '#FFB347' },
                            { label: 'Ghế ngồi', pct: '10%', color: '#e7e5e4' },
                        ].map(({ label, pct, color }) => (
                            <div key={label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="text-sm font-medium">{label}</span>
                                </div>
                                <span className="text-sm font-bold">{pct}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
