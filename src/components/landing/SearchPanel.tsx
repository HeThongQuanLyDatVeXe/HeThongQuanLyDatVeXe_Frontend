import React from 'react';
import { 
    MapPin, 
    ArrowsLeftRight, 
    CalendarBlank, 
    User, 
    MagnifyingGlass, 
    CaretDown 
} from '@phosphor-icons/react';

interface SearchPanelProps {
    tripType: string;
    setTripType: (type: any) => void;
    fromCityId: string;
    setFromCityId: (id: string) => void;
    toCityId: string;
    setToCityId: (id: string) => void;
    date: string;
    setDate: (date: string) => void;
    passengers: number;
    setPassengers: (val: number) => void;
    showPassengerMenu: boolean;
    setShowPassengerMenu: (show: boolean) => void;
    passengerMenuRef: React.RefObject<HTMLDivElement | null>;
    handleSwapCities: () => void;
    handleSearch: (e: React.FormEvent) => void;
    cities: any[];
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
    tripType,
    setTripType,
    fromCityId,
    setFromCityId,
    toCityId,
    setToCityId,
    date,
    setDate,
    passengers,
    setPassengers,
    showPassengerMenu,
    setShowPassengerMenu,
    passengerMenuRef,
    handleSwapCities,
    handleSearch,
    cities
}) => {
    return (
        <div 
            id="search-panel" 
            className="absolute bottom-[-130px] md:bottom-[-90px] left-1/2 transform -translate-x-1/2 w-full max-w-[1200px] px-6 z-30"
        >
            <form 
                onSubmit={handleSearch} 
                className="glass-effect rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 flex flex-col gap-6"
            >
                {/* Trip Type Tabs */}
                <div className="flex items-center gap-6 border-b border-white/10 pb-4">
                    <button
                        type="button"
                        onClick={() => setTripType('one-way')}
                        className={`font-semibold text-xs uppercase tracking-wider pb-1 transition-all duration-300 border-b-2 cursor-pointer ${
                            tripType === 'one-way' 
                                ? 'text-white border-primary scale-105 font-bold' 
                                : 'text-white/60 hover:text-white border-transparent'
                        }`}
                    >
                        Một chiều
                    </button>
                    <button
                        type="button"
                        onClick={() => setTripType('round-trip')}
                        className={`font-semibold text-xs uppercase tracking-wider pb-1 transition-all duration-300 border-b-2 cursor-pointer ${
                            tripType === 'round-trip' 
                                ? 'text-white border-primary scale-105 font-bold' 
                                : 'text-white/60 hover:text-white border-transparent'
                        }`}
                    >
                        Khứ hồi
                    </button>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    {/* Điểm đi */}
                    <div className="lg:col-span-4 flex flex-col gap-2">
                        <label className="font-semibold text-xs text-white/70 uppercase tracking-wider">Điểm đi</label>
                        <div className="relative">
                            <MapPin size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10" />
                            <select
                                required
                                value={fromCityId}
                                onChange={(e) => setFromCityId(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/10 rounded-2xl border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-md transition-all duration-300 appearance-none cursor-pointer [&>option]:text-on-background [&>option]:bg-surface"
                            >
                                <option value="">Chọn điểm đi</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="lg:col-span-1 flex justify-center pb-2 lg:pb-3">
                        <button
                            type="button"
                            onClick={handleSwapCities}
                            className="h-11 w-11 rounded-full bg-primary hover:bg-primary-hover text-on-primary flex items-center justify-center hover:rotate-180 transition-all duration-500 shadow-lg cursor-pointer"
                            title="Đổi chiều"
                        >
                            <ArrowsLeftRight size={20} weight="bold" />
                        </button>
                    </div>

                    {/* Điểm đến */}
                    <div className="lg:col-span-4 flex flex-col gap-2">
                        <label className="font-semibold text-xs text-white/70 uppercase tracking-wider">Điểm đến</label>
                        <div className="relative">
                            <MapPin size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10" />
                            <select
                                required
                                value={toCityId}
                                onChange={(e) => setToCityId(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/10 rounded-2xl border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-md transition-all duration-300 appearance-none cursor-pointer [&>option]:text-on-background [&>option]:bg-surface"
                            >
                                <option value="">Chọn điểm đến</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Ngày đi */}
                    <div className="lg:col-span-3 flex flex-col gap-2">
                        <label className="font-semibold text-xs text-white/70 uppercase tracking-wider">Ngày đi</label>
                        <div className="relative">
                            <CalendarBlank size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/10 rounded-2xl border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-white/30 backdrop-blur-md transition-all duration-300 [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Form Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                    {/* Passenger Selector */}
                    <div className="relative w-full md:w-auto" ref={passengerMenuRef}>
                        <button
                            type="button"
                            onClick={() => setShowPassengerMenu(!showPassengerMenu)}
                            className="flex items-center gap-4 text-white bg-white/5 hover:bg-white/10 px-6 py-3.5 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 w-full md:w-auto justify-between cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <User size={20} className="text-primary" />
                                <span className="font-medium text-sm">{passengers} Hành khách</span>
                            </div>
                            <CaretDown size={16} className={`text-white/60 transition-transform duration-300 ${showPassengerMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showPassengerMenu && (
                            <div className="absolute top-[110%] left-0 w-48 bg-white text-on-background rounded-2xl shadow-xl p-4 border border-slate-100 flex flex-col gap-3 z-50">
                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Hành khách</span>
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        disabled={passengers <= 1}
                                        onClick={() => setPassengers(passengers - 1)}
                                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer text-sm font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold text-sm select-none">{passengers}</span>
                                    <button
                                        type="button"
                                        disabled={passengers >= 5}
                                        onClick={() => setPassengers(passengers + 1)}
                                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer text-sm font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="shimmer-btn w-full md:w-auto px-10 py-4 bg-primary text-on-primary font-bold text-sm tracking-widest rounded-full uppercase hover:bg-primary-hover transition-all duration-300 shadow-[0_8px_25px_rgba(161,59,0,0.3)] flex items-center justify-center gap-3 cursor-pointer"
                    >
                        <span>Tìm chuyến xe</span>
                        <MagnifyingGlass size={18} weight="bold" />
                    </button>
                </div>
            </form>
        </div>
    );
};
