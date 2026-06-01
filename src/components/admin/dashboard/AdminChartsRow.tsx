import React from 'react';
import type { DailyRevenue, VehicleShare } from '../../../hooks/pages/admin/useAdminDashboardPage';

interface AdminChartsRowProps {
    dailyRevenues: DailyRevenue[];
    vehicleDistribution: VehicleShare[];
    loading?: boolean;
}

export const AdminChartsRow: React.FC<AdminChartsRowProps> = ({ 
    dailyRevenues = [], 
    vehicleDistribution = [], 
    loading = false 
}) => {
    // Determine maximum revenue to scale the graph Y coordinates
    const revenues = dailyRevenues.map(d => d.revenue);
    const maxRevenue = Math.max(...revenues, 1); // fallback to 1 to prevent division by zero

    // Grid scaling dimensions
    const width = 800;
    const height = 180;
    const paddingBottom = 20;
    const totalPoints = dailyRevenues.length || 30;

    // Generate coordinates: X from 0 to 800, Y scaled based on maxRevenue
    const points = dailyRevenues.map((item, idx) => {
        const x = (idx * width) / (totalPoints - 1 || 1);
        // Map Y from height-paddingBottom (0 revenue) to 10 (max revenue)
        const y = height - paddingBottom - (item.revenue / maxRevenue) * (height - 30);
        return { x, y };
    });

    // Build the SVG path strings
    const pathLine = points.length > 0 
        ? `M ${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
        : '';
        
    const pathArea = points.length > 0 
        ? `${pathLine} L ${width},${height} L 0,${height} Z`
        : '';

    // Mock last year comparison data
    const lastYearPoints = points.map(p => ({
        x: p.x,
        y: Math.min(height - paddingBottom, p.y + (Math.sin(p.x / 40) * 15) + 10)
    }));
    
    const lastYearLine = lastYearPoints.length > 0
        ? `M ${lastYearPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
        : '';

    // Render chart UI

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
                            className="text-xl font-bold text-slate-800"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Biểu đồ doanh thu doanh nghiệp
                        </h4>
                        <p className="text-stone-400 text-xs mt-1">30 ngày gần nhất (Đơn vị: Triệu VND)</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#F4600C' }} />
                            <span className="text-stone-600">Tháng này</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full inline-block bg-stone-200" />
                            <span className="text-stone-400">Tháng trước</span>
                        </div>
                    </div>
                </div>

                {/* SVG Chart */}
                {loading ? (
                    <div className="h-[200px] flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="relative h-[200px] w-full">
                        <svg className="w-full h-full" viewBox={`0 0 ${width} 200`} preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#F4600C" stopOpacity="0.22" />
                                    <stop offset="100%" stopColor="#F4600C" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Grid lines */}
                            <line x1="0" x2={width} y1="30" y2="30" stroke="#FDFBF9" strokeWidth="1" />
                            <line x1="0" x2={width} y1="80" y2="80" stroke="#FDFBF9" strokeWidth="1" />
                            <line x1="0" x2={width} y1="130" y2="130" stroke="#FDFBF9" strokeWidth="1" />
                            <line x1="0" x2={width} y1="160" y2="160" stroke="#F9F2EC" strokeWidth="1" />
                            
                            {/* Area fill */}
                            {pathArea && (
                                <path
                                    d={pathArea}
                                    fill="url(#chartGradient)"
                                />
                            )}
                            
                            {/* Current year line */}
                            {pathLine && (
                                <path
                                    d={pathLine}
                                    fill="none"
                                    stroke="#F4600C"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            )}
                            
                            {/* Last year dashed */}
                            {lastYearLine && (
                                <path
                                    d={lastYearLine}
                                    fill="none"
                                    stroke="#E8D5C4"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 3"
                                    opacity="0.7"
                                />
                            )}
                        </svg>
                        
                        {/* Dates Labels */}
                        <div className="flex justify-between mt-3 text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
                            <span>{dailyRevenues[0]?.dayLabel || 'Đầu tháng'}</span>
                            <span>{dailyRevenues[Math.floor(totalPoints / 3)]?.dayLabel || '10 ngày'}</span>
                            <span>{dailyRevenues[Math.floor(2 * totalPoints / 3)]?.dayLabel || '20 ngày'}</span>
                            <span>{dailyRevenues[totalPoints - 1]?.dayLabel || 'Cuối tháng'}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Vehicle distribution donut */}
            <div
                className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-sm flex flex-col"
                style={{ border: '1px solid #E8D5C4' }}
            >
                <h4
                    className="text-xl font-bold text-slate-800"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    Phân bổ loại xe
                </h4>
                <p className="text-stone-400 text-xs mt-1 mb-6">Thị phần đội xe vận hành</p>

                <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Donut ring */}
                    <div className="relative w-36 h-36">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                            <circle cx="60" cy="60" r="48" fill="none" stroke="#f5f5f4" strokeWidth="16" />
                            
                            {/* Dynamically stack the segments */}
                            {(() => {
                                const dashArray = 301.6;
                                let currentOffset = 0;
                                return vehicleDistribution.map((item) => {
                                    const pctVal = parseFloat(item.pct) || 0;
                                    const length = (pctVal / 100) * dashArray;
                                    const strokeOffset = currentOffset;
                                    currentOffset -= length; // subtract to stack counterclockwise
                                    
                                    return (
                                        <circle
                                            key={item.label}
                                            cx="60"
                                            cy="60"
                                            r="48"
                                            fill="none"
                                            stroke={item.color}
                                            strokeWidth="16"
                                            strokeDasharray={`${length.toFixed(1)} ${dashArray}`}
                                            strokeDashoffset={strokeOffset.toFixed(1)}
                                            className="transition-all duration-500 ease-out"
                                        />
                                    );
                                });
                            })()}
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {vehicleDistribution.length || 0}
                            </span>
                            <span className="text-[9px] font-bold text-stone-400 tracking-wider uppercase">Loại xe</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 w-full space-y-2.5">
                        {vehicleDistribution.map(({ label, pct, color }) => (
                            <div key={label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="text-xs font-semibold text-slate-700">{label}</span>
                                </div>
                                <span className="text-xs font-extrabold text-[#F4600C]">{pct}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
