import React from 'react';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useAdminTripTemplatesPage, DAY_NAMES } from '../../hooks/pages/admin/useAdminTripTemplatesPage';

export const AdminTripTemplatesPage: React.FC = () => {
    const {
        templates,
        routes,
        vehicleTypes,
        vehicles,
        loading,
        submitting,
        formErrors,
        isModalOpen,
        setIsModalOpen,
        editingTemplate,
        formData,
        setFormData,
        isGenerateModalOpen,
        setIsGenerateModalOpen,
        selectedTemplateId,
        setSelectedTemplateId,
        generateErrors,
        setGenerateErrors,
        generateData,
        setGenerateData,
        openModal,
        handleSaveTemplate,
        handleDelete,
        handleGenerateTrips,
        getRouteName,
        getVehicleTypeName
    } = useAdminTripTemplatesPage();

    return (
        <AdminLayout>
            <div className="space-y-6 text-slate-800">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Mẫu lịch trình (Trip Templates)</h1>
                    <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
                        <span className="material-symbols-outlined">add</span>
                        Thêm mẫu mới
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 font-semibold">Tuyến</th>
                                <th className="px-6 py-4 font-semibold">Loại xe</th>
                                <th className="px-6 py-4 font-semibold">Giờ đi</th>
                                <th className="px-6 py-4 font-semibold">Thời lượng</th>
                                <th className="px-6 py-4 font-semibold">Ngày chạy</th>
                                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold w-40">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Đang tải...</td></tr> : templates.length === 0 ? <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Chưa có mẫu nào.</td></tr> : templates.map(t => (
                                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">{getRouteName(t.routeId)}</td>
                                    <td className="px-6 py-4 text-sm">{getVehicleTypeName(t.vehicleTypeId)}</td>
                                    <td className="px-6 py-4 font-medium">{t.departureTime}</td>
                                    <td className="px-6 py-4">{t.durationMinutes} phút</td>
                                    <td className="px-6 py-4 text-sm max-w-[150px]">{t.daysOfWeek.map(d => DAY_NAMES[d] || d).join(', ')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.isActive ? 'Hoạt động' : 'Tạm ngưng'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            <button onClick={() => { 
                                                setSelectedTemplateId(t.id); 
                                                setGenerateData({startDate: '', endDate: '', vehicleId: ''});
                                                setGenerateErrors([]);
                                                setIsGenerateModalOpen(true); 
                                            }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Tự động tạo chuyến">
                                                <span className="material-symbols-outlined text-sm">autorenew</span>
                                            </button>
                                            <button onClick={() => openModal(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal Create/Edit Template */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <h2 className="text-2xl font-bold mb-4">{editingTemplate ? 'Sửa mẫu lịch trình' : 'Thêm mẫu lịch trình mới'}</h2>
                            {formErrors.length > 0 && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                                    {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                                </div>
                            )}
                            <form onSubmit={handleSaveTemplate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tuyến đường {editingTemplate && <span className="text-xs text-slate-400">(không thể đổi)</span>}</label>
                                        <select required disabled={!!editingTemplate} value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})} className={`w-full px-4 py-2 border border-slate-200 rounded-lg ${editingTemplate ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'}`}>
                                            <option value="" disabled>-- Chọn tuyến --</option>
                                            {routes.map(r => <option key={r.id} value={r.id}>{r.originCityName} - {r.destinationCityName}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Loại xe</label>
                                        <select required value={formData.vehicleTypeId} onChange={e => setFormData({...formData, vehicleTypeId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                                            <option value="" disabled>-- Chọn loại xe --</option>
                                            {vehicleTypes.map(vt => <option key={vt.id} value={vt.id}>{vt.name || vt.code}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Giờ khởi hành (HH:mm)</label>
                                        <input required type="time" value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Thời lượng chuyến (phút)</label>
                                        <input required type="number" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ngày chạy trong tuần</label>
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {[1,2,3,4,5,6,7].map(day => (
                                            <label key={day} className="flex items-center gap-1 cursor-pointer bg-slate-100 px-3 py-1 rounded-full text-sm">
                                                <input type="checkbox" checked={formData.daysOfWeek.includes(day)} onChange={e => {
                                                    const checked = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        daysOfWeek: checked ? [...prev.daysOfWeek, day].sort() : prev.daysOfWeek.filter(d => d !== day)
                                                    }));
                                                }} />
                                                <span>{DAY_NAMES[day] || day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Có hiệu lực từ</label>
                                        <input type="date" value={formData.validFrom || ''} onChange={e => setFormData({...formData, validFrom: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Đến ngày</label>
                                        <input type="date" value={formData.validUntil || ''} onChange={e => setFormData({...formData, validUntil: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ghi chú</label>
                                    <textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" rows={2} placeholder="Ghi chú tùy chọn..."></textarea>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">Kích hoạt mẫu</p>
                                        <p className="text-xs text-slate-500">Chỉ mẫu đang hoạt động mới có thể tạo chuyến</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={formData.isActive ?? true} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50">Hủy</button>
                                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors flex items-center gap-2 disabled:opacity-50">
                                        {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        Lưu lại
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Generate Trips */}
                {isGenerateModalOpen && (() => {
                    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
                    const filteredVehicles = vehicles.filter(v => {
                        if (!selectedTemplate) return true;
                        return v.vehicleTypeId === selectedTemplate.vehicleTypeId;
                    });
                    const showAllVehicles = filteredVehicles.length === 0 && vehicles.length > 0;
                    const displayVehicles = showAllVehicles ? vehicles : filteredVehicles;

                    return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-4">Tự động tạo chuyến</h2>
                            {selectedTemplate && (
                                <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm">
                                    <p><strong>Mẫu:</strong> {getRouteName(selectedTemplate.routeId)}</p>
                                    <p><strong>Loại xe:</strong> {getVehicleTypeName(selectedTemplate.vehicleTypeId)}</p>
                                    <p><strong>Giờ đi:</strong> {selectedTemplate.departureTime} • <strong>Thời lượng:</strong> {selectedTemplate.durationMinutes} phút</p>
                                </div>
                            )}
                            <p className="text-sm text-slate-500 mb-4">Hệ thống sẽ tạo các chuyến xe từ mẫu lịch trình hiện tại trong khoảng thời gian được chọn.</p>
                            {generateErrors.length > 0 && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                                    {generateErrors.map((e, i) => <p key={i}>{e}</p>)}
                                </div>
                            )}
                            <form onSubmit={handleGenerateTrips} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Xe thực hiện chuyến <span className="text-red-500">*</span></label>
                                    {vehicles.length === 0 ? (
                                        <div className="space-y-2">
                                            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                                                <span className="material-symbols-outlined text-sm align-middle mr-1">warning</span>
                                                Không tải được danh sách xe. Vui lòng nhập ID xe thủ công.
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Nhập Vehicle ID (UUID)"
                                                value={generateData.vehicleId}
                                                onChange={e => setGenerateData({...generateData, vehicleId: e.target.value})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <select required value={generateData.vehicleId} onChange={e => setGenerateData({...generateData, vehicleId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                                                <option value="" disabled>-- Chọn xe --</option>
                                                {displayVehicles.map(v => (
                                                    <option key={v.id} value={v.id}>{v.licensePlate} — {v.brand} {v.model} ({vehicleTypes.find(vt => vt.id === v.vehicleTypeId)?.name || 'N/A'})</option>
                                                ))}
                                            </select>
                                            {showAllVehicles && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    <span className="material-symbols-outlined text-xs align-middle mr-0.5">info</span>
                                                    Không có xe nào thuộc loại "{getVehicleTypeName(selectedTemplate?.vehicleTypeId || '')}". Đang hiển thị tất cả xe.
                                                </p>
                                            )}
                                            {!showAllVehicles && (
                                                <p className="text-xs text-slate-500 mt-1">Chỉ hiển thị xe thuộc loại "{getVehicleTypeName(selectedTemplate?.vehicleTypeId || '')}".</p>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Từ ngày <span className="text-red-500">*</span></label>
                                        <input required type="date" value={generateData.startDate} onChange={e => setGenerateData({...generateData, startDate: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Đến ngày <span className="text-red-500">*</span></label>
                                        <input required type="date" value={generateData.endDate} onChange={e => setGenerateData({...generateData, endDate: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                                    <button type="button" onClick={() => setIsGenerateModalOpen(false)} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50">Hủy</button>
                                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                                        {submitting ? (
                                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-sm">autorenew</span>
                                        )}
                                        Bắt đầu tạo
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    );
                })()}
            </div>
        </AdminLayout>
    );
};
