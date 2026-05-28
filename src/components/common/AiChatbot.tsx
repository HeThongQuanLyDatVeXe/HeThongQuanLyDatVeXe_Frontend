import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Link as LinkIcon } from 'lucide-react';
import { aiService } from '../../services/route-service/aiService';
import { Link } from 'react-router-dom';

import { toast } from 'react-hot-toast';
import { adminPriceService } from '../../services/price-service/adminPriceService';
import { adminRouteService } from '../../services/route-service/adminRouteService';
import { adminTripService } from '../../services/trip-service/adminTripService';
import { adminUserService } from '../../services/user-service/adminUserService';
import { adminDriverService } from '../../services/driver-service/adminDriverService';
import { vehicleService } from '../../services/vehicle-service/vehicleService';
import { apiCache } from '../../utils/apiCache';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Xin chào! Tôi là trợ lý AI ảo của DiVeNha. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdminMode = window.location.pathname.startsWith('/admin');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAutoExecute = async (parsed: any) => {
    try {
      // === ROUTE SERVICE ===
      if (parsed.action === 'CREATE_ROUTE') {
        toast.loading('Đang tạo tuyến đường...', { id: 'aiAction' });
        await adminRouteService.createRoute({
          code: parsed.code, name: parsed.name, originCityId: parsed.originCityId, destinationCityId: parsed.destinationCityId,
          distanceKm: parsed.distanceKm, durationMinutes: parsed.durationMinutes
        } as any);
        toast.success('Đã tạo tuyến đường thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'UPDATE_ROUTE') {
        toast.loading('Đang cập nhật tuyến đường...', { id: 'aiAction' });
        await adminRouteService.updateRoute(parsed.routeId, {
          name: parsed.name, distanceKm: parsed.distanceKm, durationMinutes: parsed.durationMinutes
        } as any);
        toast.success('Đã cập nhật tuyến đường thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'DELETE_ROUTE') {
        toast.loading('Đang xóa tuyến đường...', { id: 'aiAction' });
        await adminRouteService.deleteRoute(parsed.routeId);
        toast.success('Đã xóa tuyến đường thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'UPDATE_ROUTE_STATUS') {
        toast.loading('Đang cập nhật trạng thái tuyến...', { id: 'aiAction' });
        await adminRouteService.updateRouteStatus(parsed.routeId, { isActive: parsed.isActive });
        toast.success('Đã cập nhật trạng thái tuyến đường thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'CREATE_CITY') {
        toast.loading('Đang tạo thành phố...', { id: 'aiAction' });
        await adminRouteService.createCity({ name: parsed.name, code: parsed.code, province: parsed.province, sortOrder: parsed.sortOrder || 0 } as any);
        toast.success('Đã tạo thành phố thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'UPDATE_CITY') {
        toast.loading('Đang cập nhật thành phố...', { id: 'aiAction' });
        await adminRouteService.updateCity(parsed.cityId, { name: parsed.name, code: parsed.code, sortOrder: parsed.sortOrder } as any);
        toast.success('Đã cập nhật thành phố thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'DELETE_CITY') {
        toast.loading('Đang xóa thành phố...', { id: 'aiAction' });
        await adminRouteService.deleteCity(parsed.cityId);
        toast.success('Đã xóa thành phố thành công!', { id: 'aiAction' });
      }
      // === TRIP SERVICE ===
      else if (parsed.action === 'CREATE_TRIP') {
        toast.loading('Đang tạo chuyến xe...', { id: 'aiAction' });
        await adminTripService.createTrip({
          routeId: parsed.routeId, vehicleId: parsed.vehicleId,
          departureDatetime: parsed.departureDatetime, arrivalDatetime: parsed.arrivalDatetime
        } as any);
        toast.success('Đã tạo chuyến xe thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'UPDATE_TRIP') {
        toast.loading('Đang cập nhật chuyến xe...', { id: 'aiAction' });
        await adminTripService.updateTrip(parsed.tripId, { departureDatetime: parsed.departureDatetime, arrivalDatetime: parsed.arrivalDatetime } as any);
        toast.success('Đã cập nhật chuyến xe thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'DELETE_TRIP') {
        toast.loading('Đang xóa chuyến xe...', { id: 'aiAction' });
        await adminTripService.deleteTrip(parsed.tripId);
        toast.success('Đã xóa chuyến xe thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'CANCEL_TRIP') {
        toast.loading('Đang hủy chuyến xe...', { id: 'aiAction' });
        await adminTripService.cancelTrip(parsed.tripId, { reason: parsed.reason || 'Hủy theo yêu cầu quản trị' });
        toast.success('Đã hủy chuyến xe thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'UPDATE_TRIP_STATUS') {
        toast.loading('Đang đổi trạng thái chuyến...', { id: 'aiAction' });
        await adminTripService.updateTripStatus(parsed.tripId, { status: parsed.status } as any);
        toast.success(`Đã đổi trạng thái chuyến thành ${parsed.status}!`, { id: 'aiAction' });
      } else if (parsed.action === 'ASSIGN_DRIVER') {
        toast.loading('Đang gán tài xế...', { id: 'aiAction' });
        await adminTripService.assignDriver(parsed.tripId, { driverId: parsed.driverId } as any);
        toast.success('Đã gán tài xế thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'ASSIGN_STAFF') {
        toast.loading('Đang gán phụ xe...', { id: 'aiAction' });
        await adminTripService.assignStaff(parsed.tripId, { driverId: parsed.driverId } as any);
        toast.success('Đã gán phụ xe thành công!', { id: 'aiAction' });
      }
      // === PRICE SERVICE ===
      else if (parsed.action === 'UPDATE_PRICE') {
        toast.loading('Đang cập nhật giá...', { id: 'aiAction' });
        const res = await adminPriceService.getAllBasePrices();
        const basePrices = res.data.result || [];
        let targetPrices = basePrices.filter((p: any) => p.routeId === parsed.routeId);
        if (parsed.vehicleTypeId) {
          targetPrices = targetPrices.filter((p: any) => p.vehicleTypeId === parsed.vehicleTypeId);
        }
        if (parsed.seatType) {
          // Normalize seatType comparison (case-insensitive)
          targetPrices = targetPrices.filter((p: any) => 
            p.seatType && parsed.seatType && p.seatType.toUpperCase() === parsed.seatType.toUpperCase()
          );
        }
        if (targetPrices.length === 0) {
          toast.error('Không tìm thấy cấu hình giá nào khớp với yêu cầu!', { id: 'aiAction' });
          return;
        }
        
        const finalPrice = parsed.amount || parsed.price;
        if (!finalPrice) {
          toast.error('Không tìm thấy giá trị tiền (amount/price) trong lệnh AI!', { id: 'aiAction' });
          return;
        }

        for (const bp of targetPrices) {
          // Format effectiveFrom and effectiveTo securely
          let eFrom = bp.effectiveFrom;
          if (Array.isArray(eFrom)) eFrom = `${eFrom[0]}-${String(eFrom[1]).padStart(2,'0')}-${String(eFrom[2]).padStart(2,'0')}`;
          
          let eTo = bp.effectiveTo;
          if (Array.isArray(eTo)) eTo = `${eTo[0]}-${String(eTo[1]).padStart(2,'0')}-${String(eTo[2]).padStart(2,'0')}`;

          await adminPriceService.updateBasePrice(bp.id, {
            price: Number(finalPrice), 
            currency: bp.currency || 'VND',
            effectiveFrom: eFrom, 
            effectiveTo: eTo || undefined,
            isActive: bp.isActive !== undefined ? bp.isActive : true
          } as any);
        }
        toast.success(`Đã cập nhật giá thành ${finalPrice} VNĐ!`, { id: 'aiAction' });
      } else if (parsed.action === 'CREATE_BASE_PRICE') {
        toast.loading('Đang tạo giá cơ bản...', { id: 'aiAction' });
        await adminPriceService.createBasePrice({
          routeId: parsed.routeId, vehicleTypeId: parsed.vehicleTypeId,
          seatType: parsed.seatType || 'REGULAR', price: parsed.price || parsed.amount, currency: parsed.currency || 'VND',
          effectiveFrom: parsed.effectiveFrom || new Date().toISOString().split('T')[0]
        } as any);
        toast.success('Đã tạo giá cơ bản thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'DELETE_BASE_PRICE') {
        toast.loading('Đang xóa giá cơ bản...', { id: 'aiAction' });
        await adminPriceService.deleteBasePrice(parsed.basePriceId);
        toast.success('Đã xóa giá cơ bản thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'CREATE_SEASONAL_PRICE') {
        toast.loading('Đang tạo giá mùa...', { id: 'aiAction' });
        await adminPriceService.createSeasonalPrice({
          name: parsed.name, type: parsed.type || 'PERCENTAGE', value: parsed.value,
          startDate: parsed.startDate, endDate: parsed.endDate, routeId: parsed.routeId, vehicleTypeId: parsed.vehicleTypeId
        });
        toast.success('Đã tạo giá theo mùa thành công!', { id: 'aiAction' });
      } else if (parsed.action === 'DELETE_SEASONAL_PRICE') {
        toast.loading('Đang xóa giá mùa...', { id: 'aiAction' });
        await adminPriceService.deleteSeasonalPrice(parsed.seasonalPriceId);
        toast.success('Đã xóa giá theo mùa thành công!', { id: 'aiAction' });
      }
      // === VEHICLE SERVICE ===
      else if (parsed.action === 'UPDATE_VEHICLE_STATUS') {
        toast.loading('Đang đổi trạng thái xe...', { id: 'aiAction' });
        await vehicleService.updateVehicleStatus(parsed.vehicleId, { status: parsed.status } as any);
        toast.success(`Đã đổi trạng thái xe thành ${parsed.status}!`, { id: 'aiAction' });
      } else if (parsed.action === 'DELETE_VEHICLE') {
        toast.loading('Đang xóa xe...', { id: 'aiAction' });
        await vehicleService.deleteVehicle(parsed.vehicleId);
        toast.success('Đã xóa xe thành công!', { id: 'aiAction' });
      }
      // === USER SERVICE ===
      else if (parsed.action === 'UPDATE_USER_STATUS') {
        toast.loading('Đang cập nhật trạng thái người dùng...', { id: 'aiAction' });
        await adminUserService.updateUserStatus(parsed.userId, { status: parsed.status, reason: 'AI Agent' } as any);
        toast.success(`Đã cập nhật trạng thái người dùng thành ${parsed.status}!`, { id: 'aiAction' });
      } else if (parsed.action === 'DELETE_USER') {
        toast.loading('Đang xóa người dùng...', { id: 'aiAction' });
        await adminUserService.deleteUser(parsed.userId);
        toast.success('Đã xóa người dùng thành công!', { id: 'aiAction' });
      }
      // === DRIVER SERVICE ===
      else if (parsed.action === 'UPDATE_DRIVER_STATUS') {
        toast.loading('Đang cập nhật trạng thái tài xế...', { id: 'aiAction' });
        await adminDriverService.updateDriverStatus(parsed.driverId, { status: parsed.status, reason: 'AI Agent' } as any);
        toast.success(`Đã cập nhật trạng thái tài xế thành ${parsed.status}!`, { id: 'aiAction' });
      } else if (parsed.action === 'DELETE_DRIVER') {
        toast.loading('Đang xóa tài xế...', { id: 'aiAction' });
        await adminDriverService.deleteDriver(parsed.driverId);
        toast.success('Đã xóa tài xế thành công!', { id: 'aiAction' });
      } else {
        toast.error(`Hành động "${parsed.action}" chưa được hỗ trợ.`, { id: 'aiAction' });
      }

      // Xóa toàn bộ cache frontend sau khi AI thực thi lệnh
      // Lần tới khi Admin chuyển trang hoặc refresh table, data mới sẽ được gọi.
      apiCache.clearAll();

    } catch (err: any) {
      console.error('Error executing AI action:', err);
      toast.error('Lỗi khi thực thi. Vui lòng thao tác thủ công.', { id: 'aiAction' });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input.trim();
    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let botText = '';
      if (isAdminMode) {
        const res = await aiService.getAdminSuggestion({ prompt: userText });
        botText = res.data.suggestion;
      } else {
        const res = await aiService.getSuggestion({ prompt: userText });
        botText = res.data.suggestion;
      }

      const botMsg: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: botText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Lỗi khi gọi AI:', error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTextWithLinks = (text: string) => {
    // Regex to match [Link Text](/url/path)
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const linkText = match[1];
      const linkUrl = match[2];
      parts.push(
        <Link 
          key={lastIndex} 
          to={linkUrl} 
          className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          {linkText}
        </Link>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/30 shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right" style={{ height: '520px', maxHeight: '70vh' }}>
          {/* Header */}
          <div className="p-4 flex justify-between items-center text-on-primary rounded-t-2xl" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Bot size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>{isAdminMode ? 'Admin Assistant' : 'Đi Về Nhà'}</h3>
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  {isAdminMode ? 'Đang trực (Admin)' : 'Sẵn sàng hỗ trợ'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <X size={18} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: 'var(--color-surface-container-low)' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container text-on-surface-variant'}`}>
                    {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap overflow-hidden break-words ${msg.sender === 'user' ? 'text-on-primary rounded-tr-sm' : 'text-on-surface border border-outline-variant rounded-tl-sm bg-surface-container-lowest'}`} style={msg.sender === 'user' ? { background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)' } : {}}>
                    {(() => {
                      if (msg.sender === 'bot' && isAdminMode) {
                        try {
                          let jsonStr = msg.text;
                          // Bóc tách nếu AI bọc trong thẻ markdown ```json
                          if (jsonStr.includes('```')) {
                            const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                            if (match) {
                              jsonStr = match[1];
                            }
                          }
                          const parsed = JSON.parse(jsonStr);
                          if (parsed && parsed.action) {
                            return (
                              <div className="p-3 rounded-xl space-y-1.5 text-on-surface" style={{ background: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)' }}>
                                <div className="font-bold text-sm flex items-center gap-1.5 text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>⚡ Lệnh AI Agent</div>
                                <div className="text-xs"><span className="font-semibold text-on-surface-variant">Action:</span> <span className="px-1.5 py-0.5 rounded-md text-xs font-mono font-bold bg-primary-fixed text-on-primary-fixed">{parsed.action}</span></div>
                                
                                {parsed.name && <div><span className="font-semibold">Tên:</span> {parsed.name}</div>}
                                {parsed.routeId && <div><span className="font-semibold">Mã Tuyến:</span> {parsed.routeId}</div>}
                                {parsed.originCityId && <div><span className="font-semibold">TP Đi:</span> {parsed.originCityId}</div>}
                                {parsed.destinationCityId && <div><span className="font-semibold">TP Đến:</span> {parsed.destinationCityId}</div>}
                                {parsed.distanceKm && <div><span className="font-semibold">Khoảng cách:</span> {parsed.distanceKm} km</div>}
                                {parsed.durationMinutes && <div><span className="font-semibold">Thời gian:</span> {parsed.durationMinutes} phút</div>}
                                {parsed.cityId && <div><span className="font-semibold">Mã TP:</span> {parsed.cityId}</div>}
                                {parsed.code && <div><span className="font-semibold">Mã code:</span> {parsed.code}</div>}
                                {parsed.province && <div><span className="font-semibold">Tỉnh/TP:</span> {parsed.province}</div>}
                                
                                {parsed.tripId && <div><span className="font-semibold">Mã Chuyến:</span> {parsed.tripId}</div>}
                                {parsed.vehicleId && <div><span className="font-semibold">Mã Xe:</span> {parsed.vehicleId}</div>}
                                {parsed.departureDatetime && <div><span className="font-semibold">Khởi hành:</span> {parsed.departureDatetime}</div>}
                                {parsed.arrivalDatetime && <div><span className="font-semibold">Đến nơi:</span> {parsed.arrivalDatetime}</div>}
                                {parsed.reason && <div><span className="font-semibold">Lý do:</span> {parsed.reason}</div>}
                                
                                {parsed.amount && <div><span className="font-semibold">Số tiền:</span> {parsed.amount} VNĐ</div>}
                                {parsed.price && <div><span className="font-semibold">Giá:</span> {parsed.price} VNĐ</div>}
                                {parsed.seatType && <div><span className="font-semibold">Loại ghế:</span> {parsed.seatType}</div>}
                                {parsed.vehicleTypeId && <div><span className="font-semibold">Mã Loại Xe:</span> {parsed.vehicleTypeId}</div>}
                                {parsed.basePriceId && <div><span className="font-semibold">Mã Giá:</span> {parsed.basePriceId}</div>}
                                {parsed.effectiveFrom && <div><span className="font-semibold">Hiệu lực từ:</span> {parsed.effectiveFrom}</div>}
                                {parsed.seasonalPriceId && <div><span className="font-semibold">Mã Giá Mùa:</span> {parsed.seasonalPriceId}</div>}
                                {parsed.type && <div><span className="font-semibold">Loại:</span> {parsed.type}</div>}
                                {parsed.value && <div><span className="font-semibold">Giá trị:</span> {parsed.value}</div>}
                                {parsed.startDate && <div><span className="font-semibold">Từ ngày:</span> {parsed.startDate}</div>}
                                {parsed.endDate && <div><span className="font-semibold">Đến ngày:</span> {parsed.endDate}</div>}

                                {parsed.userId && <div><span className="font-semibold">Mã Khách Hàng:</span> {parsed.userId}</div>}
                                {parsed.driverId && <div><span className="font-semibold">Mã Tài Xế/Phụ Xe:</span> {parsed.driverId}</div>}
                                
                                {parsed.status && <div><span className="font-semibold">Trạng thái mới:</span> {parsed.status}</div>}
                                {parsed.isActive !== undefined && <div><span className="font-semibold">Mở bán:</span> {parsed.isActive ? 'Có' : 'Không'}</div>}

                                <div className="mt-2.5 pt-2" style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
                                  <button onClick={() => handleAutoExecute(parsed)} className="w-full py-2 text-on-primary text-xs font-bold rounded-lg transition-all duration-200 hover:opacity-90 active:scale-[0.97] shimmer-btn" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)' }}>
                                    ⚡ Thực thi lệnh
                                  </button>
                                </div>
                              </div>
                            );
                          }
                        } catch(e) {
                          // Not a JSON, fallback to normal text
                        }
                      }
                      return renderTextWithLinks(msg.text);
                    })()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%] flex-row">
                  <div className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0">
                    <Bot size={15} />
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant rounded-tl-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-secondary-container rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-surface-container-lowest border-t border-outline-variant">
            <div className="flex items-center bg-surface-container rounded-xl p-1 pl-4 pr-1 border border-outline-variant transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isAdminMode ? 'Ra lệnh hoặc hỏi AI...' : 'Hỏi về tuyến đường, lịch trình...'}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-on-surface placeholder-on-surface-variant/50 font-body"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 text-on-primary rounded-lg transition-all duration-200 flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                style={{ background: (!isLoading && input.trim()) ? 'var(--color-primary)' : 'var(--color-outline-variant)' }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-on-primary p-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group shimmer-btn"
          style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)', boxShadow: '0 8px 30px rgba(161, 59, 0, 0.35)' }}
        >
          <MessageCircle size={26} className="group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default AiChatbot;
