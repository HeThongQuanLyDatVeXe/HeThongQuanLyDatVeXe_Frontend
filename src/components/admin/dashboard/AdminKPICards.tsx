import React from 'react';

interface KPICard {
    label: string;
    value: string;
    icon: string;
    trend: string;
    trendUp: boolean | null; // null = stable
}

interface AdminKPICardsProps {
    kpiCards: KPICard[];
}

export const AdminKPICards: React.FC<AdminKPICardsProps> = ({ kpiCards }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiCards.map(({ label, value, icon, trend, trendUp }) => (
                <div
                    key={label}
                    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                    style={{ border: '1px solid #E8D5C4' }}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: '#FFF4ED', color: '#F4600C' }}
                        >
                            <span className="material-symbols-outlined text-2xl">{icon}</span>
                        </div>
                        <div
                            className="flex items-center text-xs font-bold px-2 py-1 rounded"
                            style={
                                trendUp === true
                                    ? { backgroundColor: '#f0fdf4', color: '#15803d' }
                                    : trendUp === false
                                        ? { backgroundColor: '#fef2f2', color: '#b91c1c' }
                                        : { backgroundColor: '#f5f5f4', color: '#57534e' }
                            }
                        >
                            <span className="material-symbols-outlined text-xs mr-1">
                                {trendUp === true ? 'trending_up' : trendUp === false ? 'trending_down' : 'horizontal_rule'}
                            </span>
                            {trend}
                        </div>
                    </div>
                    <p className="text-stone-500 text-sm font-medium mb-1">{label}</p>
                    <h3
                        className="text-2xl font-semibold"
                        style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
                    >
                        {value}
                    </h3>
                </div>
            ))}
        </div>
    );
};
