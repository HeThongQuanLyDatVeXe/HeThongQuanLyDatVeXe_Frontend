import React from 'react';

interface RouteTripsFilterProps {
    dateFilter: string;
    setDateFilter: (val: string) => void;
    availableDates: string[];
    sortBy: string;
    setSortBy: (val: string) => void;
    timeFilter: string;
    setTimeFilter: (val: string) => void;
    vehicleTypes: string[];
    vehicleTypeFilter: string;
    setVehicleTypeFilter: (val: string) => void;
    onlyAvailable: boolean;
    setOnlyAvailable: (val: boolean) => void;
}

export const RouteTripsFilter: React.FC<RouteTripsFilterProps> = ({
    dateFilter, setDateFilter, availableDates, sortBy, setSortBy, timeFilter, setTimeFilter,
    vehicleTypes, vehicleTypeFilter, setVehicleTypeFilter, onlyAvailable, setOnlyAvailable
}) => {
    return (
        <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-5">
                <h3 className="typo-headline-md text-on-surface">Lọc chuyến xe</h3>

                <div>
                    <span className="typo-label-caps mb-2 block text-outline">Ngày đi</span>
                    <select 
                        value={dateFilter} 
                        onChange={e => setDateFilter(e.target.value)}
                        className="w-full rounded-xl border border-outline/20 p-2.5 bg-surface-container-lowest typo-body-md text-on-surface"
                    >
                        <option value="">Tất cả ngày</option>
                        {availableDates.map(d => (
                            <option key={d} value={d}>
                                {new Date(d + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <span className="typo-label-caps mb-2 block text-outline">Sắp xếp</span>
                    <select 
                        value={sortBy} 
                        onChange={e => setSortBy(e.target.value)}
                        className="w-full rounded-xl border border-outline/20 p-2.5 bg-surface-container-lowest typo-body-md text-on-surface"
                    >
                        <option value="departure">Giờ đi sớm nhất</option>
                        <option value="price">Giá thấp nhất</option>
                        <option value="seats">Còn nhiều ghế nhất</option>
                    </select>
                </div>

                <div>
                    <span className="typo-label-caps mb-2 block text-outline">Giờ khởi hành</span>
                    <div className="flex flex-col gap-2">
                        {[
                            {k:'morning',l:'Sáng',d:'00:00–12:00'},
                            {k:'afternoon',l:'Chiều',d:'12:00–18:00'},
                            {k:'evening',l:'Tối',d:'18:00–24:00'}
                        ].map(t => (
                            <label key={t.k} className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="time" 
                                    checked={timeFilter===t.k} 
                                    onChange={() => setTimeFilter(t.k)} 
                                    onClick={() => { if (timeFilter===t.k) setTimeFilter(''); }}
                                    className="w-4 h-4 accent-primary cursor-pointer" 
                                />
                                <span className="typo-body-md group-hover:text-primary transition-colors">
                                    {t.l} <span className="text-outline-variant typo-label-sm">({t.d})</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {vehicleTypes.length > 0 && (
                    <div>
                        <span className="typo-label-caps mb-2 block text-outline">Loại xe</span>
                        <div className="flex flex-col gap-2">
                            {vehicleTypes.map(vt => (
                                <label key={vt} className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="radio" 
                                        name="vtype" 
                                        checked={vehicleTypeFilter===vt} 
                                        onChange={() => setVehicleTypeFilter(vt)} 
                                        onClick={() => { if (vehicleTypeFilter===vt) setVehicleTypeFilter(''); }}
                                        className="w-4 h-4 accent-primary cursor-pointer" 
                                    />
                                    <span className="typo-body-md group-hover:text-primary transition-colors">{vt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer group pt-2">
                    <input 
                        type="checkbox" 
                        checked={onlyAvailable} 
                        onChange={e => setOnlyAvailable(e.target.checked)}
                        className="w-4 h-4 accent-primary cursor-pointer rounded" 
                    />
                    <span className="typo-body-md font-semibold group-hover:text-primary transition-colors">Chỉ chuyến còn ghế</span>
                </label>
            </div>
        </aside>
    );
};
