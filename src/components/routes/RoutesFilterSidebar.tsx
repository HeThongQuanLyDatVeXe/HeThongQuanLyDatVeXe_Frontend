import React from 'react';

interface RoutesFilterSidebarProps {
    keyword: string;
    setKeyword: (val: string) => void;
    originCityId: string;
    setOriginCityId: (val: string) => void;
    destCityId: string;
    setDestCityId: (val: string) => void;
    cities: any[];
}

export const RoutesFilterSidebar: React.FC<RoutesFilterSidebarProps> = ({
    keyword, setKeyword, originCityId, setOriginCityId, destCityId, setDestCityId, cities
}) => {
    return (
        <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-5">
                <h3 className="typo-headline-md text-on-surface">Bộ lọc</h3>

                <div>
                    <span className="typo-label-caps mb-2 block text-outline">Tìm kiếm</span>
                    <input 
                        value={keyword} 
                        onChange={e => setKeyword(e.target.value)} 
                        placeholder="Tên tuyến, thành phố..."
                        className="w-full rounded-xl border border-outline/20 p-2.5 bg-surface-container-lowest focus:ring-primary focus:border-primary typo-body-md text-on-surface" 
                    />
                </div>

                <div>
                    <span className="typo-label-caps mb-2 block text-outline">Điểm khởi hành</span>
                    <select 
                        value={originCityId} 
                        onChange={e => setOriginCityId(e.target.value)}
                        className="w-full rounded-xl border border-outline/20 p-2.5 bg-surface-container-lowest focus:ring-primary focus:border-primary typo-body-md text-on-surface"
                    >
                        <option value="">Tất cả</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <span className="typo-label-caps mb-2 block text-outline">Điểm đến</span>
                    <select 
                        value={destCityId} 
                        onChange={e => setDestCityId(e.target.value)}
                        className="w-full rounded-xl border border-outline/20 p-2.5 bg-surface-container-lowest focus:ring-primary focus:border-primary typo-body-md text-on-surface"
                    >
                        <option value="">Tất cả</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {(originCityId || destCityId || keyword) && (
                    <button 
                        onClick={() => { setOriginCityId(''); setDestCityId(''); setKeyword(''); }}
                        className="w-full px-4 py-2 border border-outline/20 text-primary rounded-xl typo-label-caps hover:bg-primary hover:text-on-primary transition-all cursor-pointer text-center"
                    >
                        Xóa bộ lọc
                    </button>
                )}
            </div>
        </aside>
    );
};
