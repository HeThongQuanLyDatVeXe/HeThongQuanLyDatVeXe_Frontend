import React from 'react';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useAdminVehicleTypesPage, AMENITY_OPTIONS } from '../../hooks/pages/admin/useAdminVehicleTypesPage';

export const AdminVehicleTypesPage: React.FC = () => {
    const {
        vehicleTypes,
        loading,
        submitting,
        isModalOpen,
        editingType,
        formData,
        setFormData,
        selectedAmenities,
        setSelectedAmenities,
        formErrors,
        openModal,
        closeModal,
        handleSubmit,
        handleDelete,
        getAmenityLabels
    } = useAdminVehicleTypesPage();

    return (
        <AdminLayout>
            <div className="space-y-6 text-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Loại xe</h1>
                        <p className="text-sm text-slate-500 mt-1">Quản lý các loại xe: mã, tên, số ghế, số tầng, tiện ích</p>
                    </div>
                    <button onClick={() => openModal()} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors">
                        <span className="material-symbols-outlined">add</span>
                        Thêm Loại xe
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 font-semibold">Mã</th>
                                <th className="px-6 py-4 font-semibold">Tên loại xe</th>
                                <th className="px-6 py-4 font-semibold text-center">Số ghế</th>
                                <th className="px-6 py-4 font-semibold text-center">Số tầng</th>
                                <th className="px-6 py-4 font-semibold">Tiện ích</th>
                                <th className="px-6 py-4 font-semibold">Mô tả</th>
                                <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold w-28 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Đang tải...
                                    </div>
                                </td></tr>
                            ) : vehicleTypes.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl text-slate-300">directions_bus</span>
                                        <span>Chưa có loại xe nào.</span>
                                        <button onClick={() => openModal()} className="text-[#F4600C] text-sm underline hover:no-underline">Thêm loại xe đầu tiên</button>
                                    </div>
                                </td></tr>
                            ) : vehicleTypes.map((vt) => {
                                const amenityLabels = getAmenityLabels(vt.amenities);
                                return (
                                <tr key={vt.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">{vt.code}</span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">{vt.name}</td>
                                    <td className="px-6 py-4 text-center">{vt.totalSeats}</td>
                                    <td className="px-6 py-4 text-center">{vt.floors}</td>
                                    <td className="px-6 py-4">
                                        {amenityLabels.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {amenityLabels.map(label => (
                                                    <span key={label} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{label}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-sm">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate" title={vt.description || ''}>
                                        {vt.description || <span className="text-slate-400">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${vt.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {vt.isActive ? 'Hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1 justify-center">
                                            <button onClick={() => openModal(vt)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(vt.id, vt.name)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                {!loading && vehicleTypes.length > 0 && (
                    <div className="text-sm text-slate-500 flex gap-4">
                        <span>Tổng: <strong>{vehicleTypes.length}</strong> loại xe</span>
                        <span>Hoạt động: <strong>{vehicleTypes.filter(v => v.isActive).length}</strong></span>
                        <span>Đã khóa: <strong>{vehicleTypes.filter(v => !v.isActive).length}</strong></span>
                    </div>
                )}

                {/* Modal Create/Edit */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-2">{editingType ? 'Sửa loại xe' : 'Thêm loại xe mới'}</h2>
                            <p className="text-sm text-slate-500 mb-6">
                                {editingType
                                    ? `Đang chỉnh sửa: ${editingType.code} — ${editingType.name}`
                                    : 'Điền thông tin loại xe mới. Các trường có (*) là bắt buộc.'
                                }
                            </p>

                            {/* Error Display */}
                            {formErrors.length > 0 && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">error</span>
                                        <div className="text-sm text-red-700">
                                            {formErrors.map((err, idx) => (
                                                <p key={idx}>{err}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Mã loại xe <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className={`w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg ${editingType ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            placeholder="VD: LIMOUSINE_34"
                                            disabled={Boolean(editingType)}
                                            maxLength={20}
                                        />
                                        {editingType && <p className="text-xs text-slate-400 mt-1">Mã không thể thay đổi sau khi tạo</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tên loại xe <span className="text-red-500">*</span></label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="VD: Limousine 34 chỗ" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Số ghế <span className="text-red-500">*</span></label>
                                        <input required type="number" min={1} max={100} value={formData.totalSeats} onChange={e => setFormData({ ...formData, totalSeats: Number(e.target.value) })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                        <p className="text-xs text-slate-400 mt-1">Backend: Short (1-32767)</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Số tầng <span className="text-red-500">*</span></label>
                                        <input required type="number" min={1} max={3} value={formData.floors} onChange={e => setFormData({ ...formData, floors: Number(e.target.value) })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                                        <p className="text-xs text-slate-400 mt-1">Thường 1 hoặc 2 tầng</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Tiện ích</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {AMENITY_OPTIONS.map(option => (
                                            <label key={option.key} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer transition-colors ${selectedAmenities.includes(option.key) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAmenities.includes(option.key)}
                                                    onChange={e => {
                                                        setSelectedAmenities(prev => e.target.checked
                                                            ? Array.from(new Set([...prev, option.key]))
                                                            : prev.filter(item => item !== option.key)
                                                        );
                                                    }}
                                                    className="w-4 h-4 accent-blue-600"
                                                />
                                                <span className="material-symbols-outlined text-base">{option.icon}</span>
                                                {option.label}
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Lưu dưới dạng JSON: {`{wifi: true, usb: true, ...}`}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" rows={2} placeholder="Mô tả thêm về loại xe..."></textarea>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className={`relative inline-flex items-center cursor-pointer`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                    <span className="text-sm font-medium">{formData.isActive ? 'Hoạt động' : 'Không hoạt động'}</span>
                                </div>

                                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                                    <button type="button" onClick={closeModal} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50">Hủy</button>
                                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors disabled:opacity-50 flex items-center gap-2">
                                        {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        {submitting ? 'Đang xử lý...' : (editingType ? 'Cập nhật' : 'Thêm mới')}
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
