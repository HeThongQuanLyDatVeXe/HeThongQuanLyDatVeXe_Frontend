import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import type { TripStatus } from '../../types/trip-service/Trip';
import { ROUTES } from '../../constants/routes';
import { useAdminTripDetailPage, STATUS_MAP } from '../../hooks/pages/admin/useAdminTripDetailPage';

const getSeatTypeName = (type: string) => {
    if (!type) return '';
    const upper = type.toUpperCase();
    if (upper === 'VIP') return 'VIP';
    if (upper === 'NORMAL' || upper === 'REGULAR') return 'Thường';
    if (upper === 'BED') return 'Giường';
    if (upper === 'DOUBLE_BED') return 'G. Đôi';
    if (upper === 'LIMOUSINE') return 'Limo';
    return type;
};

export const AdminTripDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const {
        trip,
        activeTab,
        setActiveTab,
        crew,
        bookings,
        drivers,
        seatMap,
        loading,
        crewLoading,
        bookingsLoading,
        submitting,
        formErrors,
        newStatus,
        setNewStatus,
        isAssignModalOpen,
        setIsAssignModalOpen,
        assignRole,
        setAssignRole,
        selectedDriverId,
        setSelectedDriverId,
        setFormErrors,
        handleAssignCrew,
        handleCancelTrip,
        handleStatusChange
    } = useAdminTripDetailPage(id);

    if (loading && !trip) return (
        <AdminLayout>
            <div className="flex items-center justify-center h-full text-slate-500">
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span> Đang tải...
            </div>
        </AdminLayout>
    );

    if (!trip) return (
        <AdminLayout>
            <div className="flex items-center justify-center h-full text-slate-500">Không tìm thấy thông tin chuyến đi</div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="space-y-6 text-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={ROUTES.ADMIN_TRIPS} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Chi tiết chuyến: {trip.tripCode || trip.id.substring(0, 8) + '...'}</h1>
                    </div>
                    {trip.status !== 'CANCELLED' && trip.status !== 'COMPLETED' && (
                        <button onClick={handleCancelTrip} className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Hủy chuyến
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 overflow-x-auto gap-4">
                    <button onClick={() => setActiveTab('info')} className={`py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'info' ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Thông tin chung</button>
                    <button onClick={() => setActiveTab('seats')} className={`py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'seats' ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Sơ đồ ghế</button>
                    <button onClick={() => setActiveTab('crew')} className={`py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'crew' ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Tổ lái (Crew)</button>
                    <button onClick={() => setActiveTab('bookings')} className={`py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'bookings' ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Danh sách đặt vé</button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div><p className="text-sm text-slate-500">Mã chuyến</p><p className="font-medium text-lg">{trip.tripCode || 'N/A'}</p></div>
                                <div>
                                    <p className="text-sm text-slate-500">Trạng thái</p>
                                    <p className="font-medium mt-1">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${(STATUS_MAP[trip.status] || STATUS_MAP.SCHEDULED).color}`}>
                                            {(STATUS_MAP[trip.status] || STATUS_MAP.SCHEDULED).label}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Tuyến đường</p>
                                    <p className="font-medium">{trip.route ? `${trip.route.name} (${trip.route.originCityName} → ${trip.route.destinationCityName})` : trip.routeId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Phương tiện</p>
                                    <p className="font-medium">{trip.vehicle ? `${trip.vehicle.licensePlate} — ${trip.vehicle.brand} ${trip.vehicle.model}` : trip.vehicleId}</p>
                                </div>
                                <div><p className="text-sm text-slate-500">Khởi hành dự kiến</p><p className="font-medium">{new Date(trip.departureDatetime).toLocaleString('vi-VN')}</p></div>
                                <div><p className="text-sm text-slate-500">Đến nơi dự kiến</p><p className="font-medium">{new Date(trip.arrivalDatetime).toLocaleString('vi-VN')}</p></div>
                                {trip.actualDepartureAt && <div><p className="text-sm text-slate-500">Khởi hành thực tế</p><p className="font-medium text-green-700">{new Date(trip.actualDepartureAt).toLocaleString('vi-VN')}</p></div>}
                                {trip.actualArrivalAt && <div><p className="text-sm text-slate-500">Đến nơi thực tế</p><p className="font-medium text-green-700">{new Date(trip.actualArrivalAt).toLocaleString('vi-VN')}</p></div>}
                                <div><p className="text-sm text-slate-500">Ghế trống</p><p className="font-medium">{trip.availableSeats} / {trip.totalSeats}</p></div>
                                {trip.notes && <div className="col-span-2 md:col-span-3"><p className="text-sm text-slate-500">Ghi chú</p><p className="font-medium text-slate-700 bg-slate-50 p-3 rounded mt-1 border border-slate-200">{trip.notes}</p></div>}
                                {trip.cancellationReason && (
                                    <div className="col-span-2 md:col-span-3">
                                        <p className="text-sm text-slate-500">Lý do hủy</p>
                                        <p className="font-medium text-red-600 bg-red-50 p-3 rounded mt-1 border border-red-100">{trip.cancellationReason}</p>
                                    </div>
                                )}
                            </div>
                            {trip.status !== 'CANCELLED' && trip.status !== 'COMPLETED' && (
                                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Đổi trạng thái:</label>
                                    <select value={newStatus} onChange={e => setNewStatus(e.target.value as TripStatus)} className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm flex-1">
                                        <option value="">-- Chọn trạng thái --</option>
                                        {Object.entries(STATUS_MAP).filter(([k]) => k !== trip.status && k !== 'CANCELLED').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                    </select>
                                    <button onClick={handleStatusChange} disabled={!newStatus || submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors disabled:opacity-50 flex items-center gap-2 text-sm">
                                        {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        Cập nhật
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'seats' && (
                        <div>
                            {seatMap ? (
                                <div className="space-y-6">
                                    <div className="flex gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="text-center">
                                            <p className="text-sm text-slate-500">Tổng số ghế</p>
                                            <p className="text-2xl font-bold">{seatMap.totalSeats}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-slate-500">Trống</p>
                                            <p className="text-2xl font-bold text-green-600">{seatMap.availableSeats}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-slate-500">Đã đặt</p>
                                            <p className="text-2xl font-bold text-red-600">{seatMap.bookedSeats}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-slate-500">Đang giữ</p>
                                            <p className="text-2xl font-bold text-orange-500">{seatMap.heldSeats}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8 max-w-4xl">
                                        {/* Group by floor */}
                                        {[1, 2].map(floor => {
                                            const floorSeats = seatMap.seats.filter(s => s.floor === floor);
                                            if (floorSeats.length === 0) return null;
                                            return (
                                                <div key={floor} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                                    <h3 className="font-semibold text-center mb-6">Tầng {floor}</h3>
                                                    <div className="grid grid-cols-5 gap-3 max-w-[300px] mx-auto">
                                                        {floorSeats.sort((a,b) => a.rowNumber - b.rowNumber || a.columnNumber - b.columnNumber).map(seat => (
                                                            <div key={seat.seatNumber} title={`Ghế: ${seat.seatNumber} - Loại: ${getSeatTypeName(seat.seatType)}`} className={`h-12 flex flex-col items-center justify-center rounded-lg border-2 font-bold ${
                                                                seat.status === 'AVAILABLE' ? 'border-green-400 bg-green-50 text-green-700' :
                                                                seat.status === 'BOOKED' ? 'border-slate-300 bg-slate-300 text-slate-500' :
                                                                seat.status === 'BLOCKED' ? 'border-red-400 bg-red-50 text-red-700' :
                                                                'border-orange-400 bg-orange-50 text-orange-700'
                                                            }`} style={{ gridRow: seat.rowNumber, gridColumn: seat.columnNumber }}>
                                                                <span className="text-xs leading-none">{seat.seatNumber}</span>
                                                                <span className="text-[10px] mt-1 opacity-75 font-normal whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-1">
                                                                    {getSeatTypeName(seat.seatType)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-end">
                                        <Link to={`/admin/trips/${trip.id}/seat-overrides`} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">settings</span> Cấu hình ghi đè ghế
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center py-8 text-slate-500">Không có dữ liệu sơ đồ ghế hoặc chưa được tạo cho chuyến này.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'crew' && (
                        <div>
                            <div className="flex justify-end gap-3 mb-4">
                                <button onClick={() => { setAssignRole('DRIVER'); setSelectedDriverId(''); setFormErrors([]); setIsAssignModalOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                                    <span className="material-symbols-outlined text-sm">person_add</span>
                                    Gán Tài xế chính
                                </button>
                                <button onClick={() => { setAssignRole('ASSISTANT'); setSelectedDriverId(''); setFormErrors([]); setIsAssignModalOpen(true); }} className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center gap-2 hover:bg-teal-700 transition-colors">
                                    <span className="material-symbols-outlined text-sm">group_add</span>
                                    Gán Phụ xe
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="py-3 px-4 font-semibold">Tên nhân sự</th>
                                            <th className="py-3 px-4 font-semibold">SĐT</th>
                                            <th className="py-3 px-4 font-semibold">Vai trò</th>
                                            <th className="py-3 px-4 font-semibold">Thời gian gán</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {crewLoading ? <tr><td colSpan={4} className="py-8 text-center text-slate-500">Đang tải...</td></tr> : crew.length === 0 ? <tr><td colSpan={4} className="py-8 text-center text-slate-500">Chưa có nhân sự nào được gán cho chuyến này</td></tr> : crew.map(c => (
                                            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4 font-medium">{c.driverName || c.driverId}</td>
                                                <td className="py-3 px-4">{c.driverPhone || 'N/A'}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.role === 'DRIVER' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>{c.role === 'DRIVER' ? 'Tài xế' : c.role === 'ASSISTANT' ? 'Phụ xe' : c.role}</span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-slate-500">{new Date(c.assignedAt).toLocaleString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div>
                            {bookingsLoading ? <p className="text-center py-8 text-slate-500">Đang tải...</p> : bookings.length === 0 ? <p className="text-center py-8 text-slate-500">Chưa có lượt đặt vé nào cho chuyến này.</p> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="py-3 px-4 font-semibold">Mã đặt vé</th>
                                                <th className="py-3 px-4 font-semibold">Khách hàng</th>
                                                <th className="py-3 px-4 font-semibold">Ghế</th>
                                                <th className="py-3 px-4 font-semibold">Trạng thái</th>
                                                <th className="py-3 px-4 font-semibold">Tổng tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((b, i) => (
                                                <tr key={b.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="py-3 px-4 font-mono text-sm">{b.bookingCode || b.id?.substring(0, 8) || `#${i+1}`}</td>
                                                    <td className="py-3 px-4">{b.passengerName || b.customerName || b.userId?.substring(0, 8) || 'N/A'}</td>
                                                    <td className="py-3 px-4 text-sm">{Array.isArray(b.seats) ? b.seats.map((s: any) => s.seatNumberSnapshot).join(', ') : 'N/A'}</td>
                                                    <td className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        b.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                        b.bookingStatus === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                        b.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>{b.bookingStatus || 'N/A'}</span></td>
                                                    <td className="py-3 px-4 font-medium">{b.totalAmount ? Number(b.totalAmount).toLocaleString('vi-VN') + ' đ' : 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Assign Crew */}
                {isAssignModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-4">Gán {assignRole === 'DRIVER' ? 'Tài xế chính' : 'Phụ xe'}</h2>
                            {formErrors.length > 0 && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                                    {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                                </div>
                            )}
                            <form onSubmit={handleAssignCrew} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Chọn nhân sự</label>
                                    <select required value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="" disabled>-- Chọn nhân sự --</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.fullName} ({d.phoneNumber}) - {d.licenseClass}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                                    <button type="button" onClick={() => setIsAssignModalOpen(false)} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50">Hủy</button>
                                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors flex items-center gap-2 disabled:opacity-50">
                                        {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        Lưu lại
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};
