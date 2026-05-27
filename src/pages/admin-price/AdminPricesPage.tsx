import React from 'react';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { useAdminPricesPage } from '../../hooks/pages/admin/useAdminPricesPage';

export const AdminPricesPage: React.FC = () => {
    const {
        activeTab,
        setActiveTab,
        loading,
        submitting,
        formErrors,
        setFormErrors,
        isAddModalOpen,
        setIsAddModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        baseFormData,
        setBaseFormData,
        ruleFormData,
        setRuleFormData,
        surchargeFormData,
        setSurchargeFormData,
        seasonalFormData,
        setSeasonalFormData,
        basePrices,
        rules,
        surcharges,
        seasonal,
        routes,
        vehicleTypes,
        handleAdd,
        handleEditSubmit,
        openEditBaseModal,
        openEditRuleModal,
        openEditSurchargeModal,
        openEditSeasonalModal,
        handleDeleteBasePrice,
        handleDeleteRule,
        handleDeleteSurcharge,
        handleDeleteSeasonal,
        getRouteName,
        getVehicleTypeName,
        formatDate
    } = useAdminPricesPage();

    return (
        <AdminLayout>
            <div className="space-y-6 text-slate-800">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-serif text-[#F4600C]">Quản lý Giá & Phụ phí</h1>
                    <button onClick={() => { setIsAddModalOpen(true); setFormErrors([]); }} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg flex items-center gap-2 hover:bg-[#D5530A] transition-colors shadow-sm">
                        <span className="material-symbols-outlined">add</span>
                        Thêm mới
                    </button>
                </div>

                <div className="flex border-b border-slate-200 overflow-x-auto">
                    <button onClick={() => setActiveTab('base')} className={`px-4 py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'base' ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Giá cơ bản</button>
                    <button onClick={() => setActiveTab('rules')} className={`px-4 py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'rules' ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Quy tắc giá (Rules)</button>
                    <button onClick={() => setActiveTab('surcharges')} className={`px-4 py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'surcharges' ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Phụ phí (Surcharges)</button>
                    <button onClick={() => setActiveTab('seasonal')} className={`px-4 py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'seasonal' ? 'border-[#F4600C] text-[#F4600C]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Giá theo mùa</button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                    {activeTab === 'base' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-3 px-4 font-semibold">Tuyến</th>
                                    <th className="py-3 px-4 font-semibold">Loại xe / Ghế</th>
                                    <th className="py-3 px-4 font-semibold">Mức giá</th>
                                    <th className="py-3 px-4 font-semibold">Hiệu lực</th>
                                    <th className="py-3 px-4 font-semibold">Trạng thái</th>
                                    <th className="py-3 px-4 font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td colSpan={6} className="py-8 text-center text-slate-500">Đang tải...</td></tr> : basePrices.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-slate-500">Chưa có dữ liệu</td></tr> : basePrices.map(item => (
                                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium">{getRouteName(item.routeId)}</td>
                                        <td className="py-3 px-4">{getVehicleTypeName(item.vehicleTypeId)}<br/><span className="text-xs text-slate-500 font-semibold">{item.seatType}</span></td>
                                        <td className="py-3 px-4 text-[#F4600C] font-bold">{Number(item.price).toLocaleString('vi-VN')} {item.currency}</td>
                                        <td className="py-3 px-4 text-sm">{formatDate(item.effectiveFrom)}{item.effectiveTo ? ` → ${formatDate(item.effectiveTo)}` : ''}</td>
                                        <td className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.isActive ? 'Hoạt động' : 'Tạm ngưng'}</span></td>
                                        <td className="py-3 px-4 flex gap-2">
                                            <button onClick={() => openEditBaseModal(item)} className="text-blue-600 hover:text-blue-800" title="Sửa"><span className="material-symbols-outlined text-sm">edit</span></button>
                                            <button onClick={() => handleDeleteBasePrice(item.id)} className="text-red-600 hover:text-red-800" title="Xóa"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'rules' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-3 px-4 font-semibold">Tên quy tắc</th>
                                    <th className="py-3 px-4 font-semibold">Loại sự kiện</th>
                                    <th className="py-3 px-4 font-semibold">Điều chỉnh</th>
                                    <th className="py-3 px-4 font-semibold">Hiệu lực</th>
                                    <th className="py-3 px-4 font-semibold">Trạng thái</th>
                                    <th className="py-3 px-4 font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td colSpan={6} className="py-8 text-center text-slate-500">Đang tải...</td></tr> : rules.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-slate-500">Chưa có quy tắc giá động</td></tr> : rules.map(item => (
                                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium">{item.name}</td>
                                        <td className="py-3 px-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{item.eventType}</span></td>
                                        <td className="py-3 px-4 text-[#F4600C] font-bold">{Number(item.value).toLocaleString('vi-VN')} {item.ruleType === 'PERCENTAGE' ? '%' : 'VND'}</td>
                                        <td className="py-3 px-4 text-sm">{formatDate(item.effectiveFrom)}</td>
                                        <td className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.isActive ? 'Hoạt động' : 'Tạm ngưng'}</span></td>
                                        <td className="py-3 px-4 flex gap-2">
                                            <button onClick={() => openEditRuleModal(item)} className="text-blue-600 hover:text-blue-800" title="Sửa"><span className="material-symbols-outlined text-sm">edit</span></button>
                                            <button onClick={() => handleDeleteRule(item.id)} className="text-red-600 hover:text-red-800" title="Xóa"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'surcharges' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-3 px-4 font-semibold">Tên phụ phí</th>
                                    <th className="py-3 px-4 font-semibold">Mã code</th>
                                    <th className="py-3 px-4 font-semibold">Giá trị</th>
                                    <th className="py-3 px-4 font-semibold">Mô tả</th>
                                    <th className="py-3 px-4 font-semibold">Trạng thái</th>
                                    <th className="py-3 px-4 font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td colSpan={6} className="py-8 text-center text-slate-500">Đang tải...</td></tr> : surcharges.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-slate-500">Chưa có phụ phí</td></tr> : surcharges.map(item => (
                                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium">{item.name}</td>
                                        <td className="py-3 px-4 font-mono text-slate-600">{item.code}</td>
                                        <td className="py-3 px-4 text-[#F4600C] font-bold">{Number(item.value).toLocaleString('vi-VN')} {item.type === 'PERCENTAGE' ? '%' : 'VND'}</td>
                                        <td className="py-3 px-4 text-sm text-slate-500">{item.description || '—'}</td>
                                        <td className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.isActive ? 'Hoạt động' : 'Tạm ngưng'}</span></td>
                                        <td className="py-3 px-4 flex gap-2">
                                            <button onClick={() => openEditSurchargeModal(item)} className="text-blue-600 hover:text-blue-800" title="Sửa"><span className="material-symbols-outlined text-sm">edit</span></button>
                                            <button onClick={() => handleDeleteSurcharge(item.id)} className="text-red-600 hover:text-red-800" title="Xóa"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'seasonal' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-3 px-4 font-semibold">Tên chiến dịch</th>
                                    <th className="py-3 px-4 font-semibold">Từ ngày</th>
                                    <th className="py-3 px-4 font-semibold">Đến ngày</th>
                                    <th className="py-3 px-4 font-semibold">Điều chỉnh</th>
                                    <th className="py-3 px-4 font-semibold">Trạng thái</th>
                                    <th className="py-3 px-4 font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td colSpan={6} className="py-8 text-center text-slate-500">Đang tải...</td></tr> : seasonal.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-slate-500">Chưa có giá theo mùa</td></tr> : seasonal.map(item => (
                                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium">{item.name}</td>
                                        <td className="py-3 px-4">{formatDate(item.startDate)}</td>
                                        <td className="py-3 px-4">{formatDate(item.endDate)}</td>
                                        <td className="py-3 px-4 text-[#F4600C] font-bold">{Number(item.value || 0).toLocaleString('vi-VN')} {item.type === 'PERCENTAGE' ? '%' : 'VND'}</td>
                                        <td className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.isActive ? 'Hoạt động' : 'Tạm ngưng'}</span></td>
                                        <td className="py-3 px-4 flex gap-2">
                                            <button onClick={() => openEditSeasonalModal(item)} className="text-blue-600 hover:text-blue-800" title="Sửa"><span className="material-symbols-outlined text-sm">edit</span></button>
                                            <button onClick={() => handleDeleteSeasonal(item.id)} className="text-red-600 hover:text-red-800" title="Xóa"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">Thêm {activeTab === 'base' ? 'Giá cơ bản' : activeTab === 'rules' ? 'Quy tắc giá' : activeTab === 'surcharges' ? 'Phụ phí' : activeTab === 'seasonal' ? 'Giá theo mùa' : 'Mới'}</h2>
                            {formErrors.length > 0 && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                                    {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                                </div>
                            )}
                            <form onSubmit={handleAdd} className="space-y-4">
                                {activeTab === 'base' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tuyến đường (Route)</label>
                                            <select required value={baseFormData.routeId} onChange={e => setBaseFormData({...baseFormData, routeId: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                <option value="" disabled>-- Chọn tuyến đường --</option>
                                                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Loại xe (Vehicle Type)</label>
                                            <select required value={baseFormData.vehicleTypeId} onChange={e => setBaseFormData({...baseFormData, vehicleTypeId: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                <option value="" disabled>-- Chọn loại xe --</option>
                                                {vehicleTypes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Loại ghế (Seat Type)</label>
                                            <select required value={baseFormData.seatType} onChange={e => setBaseFormData({...baseFormData, seatType: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                <option value="REGULAR">Ghế thường (REGULAR)</option>
                                                <option value="VIP">Ghế VIP (VIP)</option>
                                                <option value="BED">Giường nằm (BED)</option>
                                                <option value="LIMOUSINE">Limousine (LIMOUSINE)</option>
                                                <option value="DOUBLE_BED">Giường đôi (DOUBLE_BED)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Mức giá</label>
                                            <input required type="number" min="0" value={baseFormData.price} onChange={e => setBaseFormData({...baseFormData, price: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tiền tệ</label>
                                            <input required value={baseFormData.currency} onChange={e => setBaseFormData({...baseFormData, currency: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-slate-100 outline-none" readOnly />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Ngày hiệu lực</label>
                                            <input required type="date" value={baseFormData.effectiveFrom} onChange={e => setBaseFormData({...baseFormData, effectiveFrom: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                    </>
                                )}
                                {activeTab === 'rules' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tên quy tắc</label>
                                            <input required value={ruleFormData.name} onChange={e => setRuleFormData({...ruleFormData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Loại sự kiện</label>
                                                <select required value={ruleFormData.eventType} onChange={e => setRuleFormData({...ruleFormData, eventType: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="EARLY_BIRD">Đặt sớm (EARLY_BIRD)</option>
                                                    <option value="LAST_MINUTE">Giờ chót (LAST_MINUTE)</option>
                                                    <option value="PEAK_HOUR">Giờ cao điểm (PEAK_HOUR)</option>
                                                    <option value="LOW_DEMAND">Thấp điểm (LOW_DEMAND)</option>
                                                    <option value="CUSTOM">Khác (CUSTOM)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Loại điều chỉnh</label>
                                                <select required value={ruleFormData.ruleType} onChange={e => setRuleFormData({...ruleFormData, ruleType: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="PERCENTAGE">Phần trăm (%)</option>
                                                    <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Giá trị điều chỉnh</label>
                                            <input required type="number" step="0.01" value={ruleFormData.value} onChange={e => setRuleFormData({...ruleFormData, value: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Ngày đặt trước (Tối thiểu)</label>
                                                <input type="number" min="0" value={ruleFormData.minDaysBefore || ''} onChange={e => setRuleFormData({...ruleFormData, minDaysBefore: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Ngày đặt trước (Tối đa)</label>
                                                <input type="number" min="0" value={ruleFormData.maxDaysBefore || ''} onChange={e => setRuleFormData({...ruleFormData, maxDaysBefore: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Tỷ lệ lấp đầy tối thiểu (%)</label>
                                                <input type="number" min="0" max="100" step="0.01" value={ruleFormData.minOccupancyPct || ''} onChange={e => setRuleFormData({...ruleFormData, minOccupancyPct: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Tỷ lệ lấp đầy tối đa (%)</label>
                                                <input type="number" min="0" max="100" step="0.01" value={ruleFormData.maxOccupancyPct || ''} onChange={e => setRuleFormData({...ruleFormData, maxOccupancyPct: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Ngày hiệu lực</label>
                                            <input required type="date" value={ruleFormData.effectiveFrom} onChange={e => setRuleFormData({...ruleFormData, effectiveFrom: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                    </>
                                )}
                                {activeTab === 'surcharges' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tên phụ phí</label>
                                            <input required value={surchargeFormData.name} onChange={e => setSurchargeFormData({...surchargeFormData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Mã code</label>
                                            <input required value={surchargeFormData.code} onChange={e => setSurchargeFormData({...surchargeFormData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" placeholder="VD: LUGGAGE_EXTRA" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Loại điều chỉnh</label>
                                                <select required value={surchargeFormData.type} onChange={e => setSurchargeFormData({...surchargeFormData, type: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="PERCENTAGE">Phần trăm (%)</option>
                                                    <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Giá trị điều chỉnh</label>
                                                <input required type="number" step="0.01" value={surchargeFormData.value} onChange={e => setSurchargeFormData({...surchargeFormData, value: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
                                            <textarea value={surchargeFormData.description} onChange={e => setSurchargeFormData({...surchargeFormData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" rows={3}></textarea>
                                        </div>
                                    </>
                                )}
                                {activeTab === 'seasonal' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tên chiến dịch</label>
                                            <input required value={seasonalFormData.name} onChange={e => setSeasonalFormData({...seasonalFormData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" placeholder="VD: Khuyến mãi Hè 2026" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Tuyến đường (Tùy chọn)</label>
                                                <select value={seasonalFormData.routeId} onChange={e => setSeasonalFormData({...seasonalFormData, routeId: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="">-- Áp dụng tất cả tuyến --</option>
                                                    {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Loại xe (Tùy chọn)</label>
                                                <select value={seasonalFormData.vehicleTypeId} onChange={e => setSeasonalFormData({...seasonalFormData, vehicleTypeId: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="">-- Áp dụng tất cả loại xe --</option>
                                                    {vehicleTypes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Từ ngày</label>
                                                <input required type="date" value={seasonalFormData.startDate} onChange={e => setSeasonalFormData({...seasonalFormData, startDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Đến ngày</label>
                                                <input required type="date" value={seasonalFormData.endDate} onChange={e => setSeasonalFormData({...seasonalFormData, endDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Loại điều chỉnh</label>
                                                <select required value={seasonalFormData.type} onChange={e => setSeasonalFormData({...seasonalFormData, type: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="PERCENTAGE">Phần trăm (%)</option>
                                                    <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Giá trị điều chỉnh</label>
                                                <input required type="number" step="0.01" value={seasonalFormData.value} onChange={e => setSeasonalFormData({...seasonalFormData, value: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {activeTab !== 'base' && activeTab !== 'rules' && activeTab !== 'surcharges' && activeTab !== 'seasonal' && <p>Chức năng thêm mới cho mục này đang được phát triển.</p>}
                                
                                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50">Hủy</button>
                                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors flex items-center gap-2 disabled:opacity-50">
                                        {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        Thêm
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">Cập nhật {activeTab === 'base' ? 'Giá cơ bản' : activeTab === 'rules' ? 'Quy tắc giá' : activeTab === 'surcharges' ? 'Phụ phí' : activeTab === 'seasonal' ? 'Giá theo mùa' : ''}</h2>
                            {formErrors.length > 0 && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                                    {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                                </div>
                            )}
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                {activeTab === 'base' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tuyến đường</label>
                                            <input value={getRouteName(baseFormData.routeId)} className="w-full px-4 py-2 border rounded-lg bg-slate-100 outline-none text-slate-500" readOnly />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Loại xe</label>
                                            <input value={getVehicleTypeName(baseFormData.vehicleTypeId)} className="w-full px-4 py-2 border rounded-lg bg-slate-100 outline-none text-slate-500" readOnly />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Loại ghế</label>
                                            <input value={baseFormData.seatType} className="w-full px-4 py-2 border rounded-lg bg-slate-100 outline-none text-slate-500" readOnly />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Mức giá</label>
                                            <input required type="number" min="0" value={baseFormData.price} onChange={e => setBaseFormData({...baseFormData, price: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Ngày hiệu lực</label>
                                            <input required type="date" value={baseFormData.effectiveFrom} onChange={e => setBaseFormData({...baseFormData, effectiveFrom: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                    </>
                                )}
                                {activeTab === 'rules' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tên quy tắc</label>
                                            <input required value={ruleFormData.name} onChange={e => setRuleFormData({...ruleFormData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Loại sự kiện</label>
                                                <select required value={ruleFormData.eventType} onChange={e => setRuleFormData({...ruleFormData, eventType: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="EARLY_BIRD">Đặt sớm (EARLY_BIRD)</option>
                                                    <option value="LAST_MINUTE">Giờ chót (LAST_MINUTE)</option>
                                                    <option value="PEAK_HOUR">Giờ cao điểm (PEAK_HOUR)</option>
                                                    <option value="LOW_DEMAND">Thấp điểm (LOW_DEMAND)</option>
                                                    <option value="CUSTOM">Khác (CUSTOM)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Loại điều chỉnh</label>
                                                <select required value={ruleFormData.ruleType} onChange={e => setRuleFormData({...ruleFormData, ruleType: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="PERCENTAGE">Phần trăm (%)</option>
                                                    <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Giá trị điều chỉnh</label>
                                            <input required type="number" step="0.01" value={ruleFormData.value} onChange={e => setRuleFormData({...ruleFormData, value: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Ngày đặt trước (Tối thiểu)</label>
                                                <input type="number" min="0" value={ruleFormData.minDaysBefore || ''} onChange={e => setRuleFormData({...ruleFormData, minDaysBefore: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Ngày đặt trước (Tối đa)</label>
                                                <input type="number" min="0" value={ruleFormData.maxDaysBefore || ''} onChange={e => setRuleFormData({...ruleFormData, maxDaysBefore: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Tỷ lệ lấp đầy (Tối thiểu %)</label>
                                                <input type="number" min="0" max="100" step="0.01" value={ruleFormData.minOccupancyPct || ''} onChange={e => setRuleFormData({...ruleFormData, minOccupancyPct: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Tỷ lệ lấp đầy (Tối đa %)</label>
                                                <input type="number" min="0" max="100" step="0.01" value={ruleFormData.maxOccupancyPct || ''} onChange={e => setRuleFormData({...ruleFormData, maxOccupancyPct: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Ngày hiệu lực</label>
                                            <input required type="date" value={ruleFormData.effectiveFrom} onChange={e => setRuleFormData({...ruleFormData, effectiveFrom: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                    </>
                                )}
                                {activeTab === 'surcharges' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tên phụ phí</label>
                                            <input required value={surchargeFormData.name} onChange={e => setSurchargeFormData({...surchargeFormData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Mã code <span className="text-xs text-slate-400">(không thể đổi)</span></label>
                                            <input value={surchargeFormData.code} className="w-full px-4 py-2 border rounded-lg bg-slate-100 outline-none text-slate-500" readOnly />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Loại điều chỉnh</label>
                                                <select required value={surchargeFormData.type} onChange={e => setSurchargeFormData({...surchargeFormData, type: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="PERCENTAGE">Phần trăm (%)</option>
                                                    <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Giá trị điều chỉnh</label>
                                                <input required type="number" step="0.01" value={surchargeFormData.value} onChange={e => setSurchargeFormData({...surchargeFormData, value: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
                                            <textarea value={surchargeFormData.description} onChange={e => setSurchargeFormData({...surchargeFormData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" rows={3}></textarea>
                                        </div>
                                    </>
                                )}
                                {activeTab === 'seasonal' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tên chiến dịch</label>
                                            <input required value={seasonalFormData.name} onChange={e => setSeasonalFormData({...seasonalFormData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" placeholder="VD: Khuyến mãi Hè 2026" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Tuyến đường (Tùy chọn)</label>
                                                <select value={seasonalFormData.routeId} onChange={e => setSeasonalFormData({...seasonalFormData, routeId: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="">-- Áp dụng tất cả tuyến --</option>
                                                    {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Loại xe (Tùy chọn)</label>
                                                <select value={seasonalFormData.vehicleTypeId} onChange={e => setSeasonalFormData({...seasonalFormData, vehicleTypeId: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="">-- Áp dụng tất cả loại xe --</option>
                                                    {vehicleTypes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Từ ngày</label>
                                                <input required type="date" value={seasonalFormData.startDate} onChange={e => setSeasonalFormData({...seasonalFormData, startDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Đến ngày</label>
                                                <input required type="date" value={seasonalFormData.endDate} onChange={e => setSeasonalFormData({...seasonalFormData, endDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Loại điều chỉnh</label>
                                                <select required value={seasonalFormData.type} onChange={e => setSeasonalFormData({...seasonalFormData, type: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none">
                                                    <option value="PERCENTAGE">Phần trăm (%)</option>
                                                    <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Giá trị điều chỉnh</label>
                                                <input required type="number" step="0.01" value={seasonalFormData.value} onChange={e => setSeasonalFormData({...seasonalFormData, value: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4600C] outline-none" />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="flex gap-3 justify-end mt-8 border-t pt-4">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={submitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50">Hủy</button>
                                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#F4600C] text-white rounded-lg font-medium hover:bg-[#D5530A] transition-colors flex items-center gap-2 disabled:opacity-50">
                                        {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        Lưu thay đổi
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
