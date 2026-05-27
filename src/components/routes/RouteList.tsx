import React from 'react';
import { RouteCard } from './RouteCard';

interface RouteListProps {
    loading: boolean;
    filtered: any[];
    stopPointsMap: Record<number, any[]>;
    navigate: (url: string) => void;
}

export const RouteList: React.FC<RouteListProps> = ({ loading, filtered, stopPointsMap, navigate }) => {
    return (
        <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-md">
                <p className="typo-body-md text-on-surface-variant italic">
                    {loading ? 'Đang tải...' : <>{filtered.length} tuyến đường</>}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[32px]">route</span>
                    </div>
                    <h4 className="typo-headline-md text-primary">Không tìm thấy tuyến đường</h4>
                    <p className="typo-body-md text-on-surface-variant">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {filtered.map(route => (
                        <RouteCard
                            key={route.id}
                            route={route}
                            stopPoints={stopPointsMap[route.id] || []}
                            onClick={() => navigate(`/tuyen-duong/${route.id}/chuyen-xe`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
