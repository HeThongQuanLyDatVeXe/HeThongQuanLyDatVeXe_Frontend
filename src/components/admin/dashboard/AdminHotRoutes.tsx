import React from 'react';

interface HotRoute {
    rank: number;
    name: string;
    tripsPerWeek: number;
    fillRate: number;
}

interface AdminHotRoutesProps {
    routes: HotRoute[];
}

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
    const styles: Record<number, { bg: string; color: string }> = {
        1: { bg: '#1A1410', color: '#ffffff' },
        2: { bg: '#e7e5e4', color: '#1A1410' },
        3: { bg: '#f5f5f4', color: '#1A1410' },
    };
    const { bg, color } = styles[rank] ?? { bg: '#e7e5e4', color: '#1A1410' };
    return (
        <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
            style={{ backgroundColor: bg, color, fontFamily: 'Playfair Display, serif' }}
        >
            {rank}
        </div>
    );
};

export const AdminHotRoutes: React.FC<AdminHotRoutesProps> = ({ routes }) => {
    return (
        <div
            className="lg:col-span-4 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col"
            style={{ border: '1px solid #E8D5C4' }}
        >
            <div className="p-6" style={{ borderBottom: '1px solid #F9F2EC' }}>
                <h4
                    className="text-xl font-semibold"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#1A1410' }}
                >
                    Tuyến hot nhất
                </h4>
            </div>
            <div className="p-6 space-y-5">
                {routes.map((route) => (
                    <div key={route.rank} className="flex items-center gap-4">
                        <RankBadge rank={route.rank} />
                        <div className="flex-1">
                            <p className="text-sm font-bold">{route.name}</p>
                            <p className="text-xs text-stone-500">{route.tripsPerWeek} chuyến/tuần</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold" style={{ color: '#F4600C' }}>{route.fillRate}%</p>
                            <p className="text-[10px] text-stone-400 font-bold uppercase">Lấp đầy</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
