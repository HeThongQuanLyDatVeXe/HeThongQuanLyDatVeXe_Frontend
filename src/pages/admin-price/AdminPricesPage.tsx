import React, { useState, useEffect } from 'react';
import { adminPriceService } from '../../services/price-service/adminPriceService';
import type { BasePriceResponse } from '../../types/price-service/AdminPrice';
import { useToast } from '../../contexts/ToastContext';

export const AdminPricesPage: React.FC = () => {
  const [basePrices, setBasePrices] = useState<BasePriceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await adminPriceService.getAllBasePrices();
      const payload = res.data.result || res.data.data;
      if (payload) {
        setBasePrices(payload);
      }
    } catch (error) {
      console.error('Failed to fetch prices', error);
      showToast('Lỗi khi tải dữ liệu giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Quản lý Giá cơ bản</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Thiết lập giá vé cơ bản cho các tuyến đường theo loại xe và loại ghế.
          </p>
        </div>
        <button 
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center"
          onClick={() => alert('Chức năng thêm mới đang được phát triển')}
        >
          <span className="material-symbols-outlined mr-2">add</span>
          Thêm giá mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-sm text-on-surface-variant">
                  <th className="p-4 font-semibold w-16">ID</th>
                  <th className="p-4 font-semibold">Tuyến (Route ID)</th>
                  <th className="p-4 font-semibold">Loại xe / Ghế</th>
                  <th className="p-4 font-semibold">Mức giá</th>
                  <th className="p-4 font-semibold">Ngày hiệu lực</th>
                  <th className="p-4 font-semibold text-center w-24">Trạng thái</th>
                  <th className="p-4 font-semibold text-center w-20">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm text-on-surface">
                {basePrices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                      Chưa có dữ liệu giá cơ bản.
                    </td>
                  </tr>
                ) : (
                  basePrices.map((price) => (
                    <tr key={price.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4 font-mono text-xs text-outline">{price.id.substring(0, 8)}...</td>
                      <td className="p-4 font-medium">{price.routeId.substring(0,8)}...</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{price.vehicleTypeId.substring(0,8)}...</span>
                          <span className="text-xs text-on-surface-variant">Ghế: {price.seatType}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-primary">
                        {price.price.toLocaleString()} {price.currency}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col text-xs">
                          <span>Từ: {new Date(price.effectiveFrom).toLocaleDateString('vi-VN')}</span>
                          {price.effectiveTo && <span>Đến: {new Date(price.effectiveTo).toLocaleDateString('vi-VN')}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          price.isActive 
                            ? 'bg-success/10 text-success' 
                            : 'bg-error/10 text-error'
                        }`}>
                          {price.isActive ? 'Kích hoạt' : 'Vô hiệu'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => alert('Sửa ' + price.id)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded transition-colors"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
