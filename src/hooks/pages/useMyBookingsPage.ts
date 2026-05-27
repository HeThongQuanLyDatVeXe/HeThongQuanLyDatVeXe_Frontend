import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/user-service/useAuth';
import { ROUTES } from '../../constants/routes';

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';
export type TabFilter = 'all' | BookingStatus;

export interface Booking {
  id: string;
  status: BookingStatus;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  operator: string;
  seatInfo: string;
  totalPrice: string;
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    id:            '#VN18392',
    status:        'upcoming',
    origin:        'Hà Nội',
    destination:   'TP.HCM',
    departureTime: '07:00',
    arrivalTime:   '14:30',
    date:          '21/05/2026',
    operator:      'Hải Vân Limousine',
    seatInfo:      '1 Giường nằm',
    totalPrice:    '850.000đ',
  },
  {
    id:            '#VN09211',
    status:        'completed',
    origin:        'Đà Nẵng',
    destination:   'Huế',
    departureTime: '15:00',
    arrivalTime:   '18:00',
    date:          '10/04/2026',
    operator:      'Phượng Hoàng',
    seatInfo:      '2 Ghế ngồi',
    totalPrice:    '320.000đ',
  },
  {
    id:            '#VN07743',
    status:        'cancelled',
    origin:        'TP.HCM',
    destination:   'Đà Lạt',
    departureTime: '09:00',
    arrivalTime:   '15:00',
    date:          '05/03/2026',
    operator:      'Phương Trang',
    seatInfo:      '2 Ghế ngồi',
    totalPrice:    '240.000đ',
  },
];

export const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; barColor: string; badgeBg: string; badgeColor: string; opacity: string }
> = {
  upcoming:  { label: 'Sắp khởi hành', barColor: '#feb246', badgeBg: '#fee3d9', badgeColor: '#5a4137',  opacity: '1' },
  completed: { label: 'Đã hoàn thành', barColor: '#A8BCA1', badgeBg: '#ffe9e2', badgeColor: '#5a4137',  opacity: '0.75' },
  cancelled: { label: 'Đã hủy',        barColor: '#ba1a1a', badgeBg: '#ffdad6', badgeColor: '#93000a', opacity: '0.65' },
};

export const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all',       label: 'Tất cả'         },
  { key: 'upcoming',  label: 'Sắp khởi hành'  },
  { key: 'completed', label: 'Đã hoàn thành'  },
  { key: 'cancelled', label: 'Đã hủy'         },
];

export const SIDEBAR_NAV = [
  { label: 'Thông tin cá nhân', icon: 'person',              to: ROUTES.PROFILE },
  { label: 'Vé của tôi',        icon: 'confirmation_number', to: ROUTES.MY_BOOKINGS, active: true },
];

export const useMyBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filteredBookings =
    activeTab === 'all'
      ? MOCK_BOOKINGS
      : MOCK_BOOKINGS.filter((b) => b.status === activeTab);

  const nextTrip = MOCK_BOOKINGS.find((b) => b.status === 'upcoming');

  const avatarInitials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'NT';

  const handleNavigateProfile = () => {
    navigate(ROUTES.PROFILE);
  };

  return {
    user,
    activeTab,
    setActiveTab,
    filteredBookings,
    nextTrip,
    avatarInitials,
    handleNavigateProfile,
    TABS,
    SIDEBAR_NAV,
    MOCK_BOOKINGS,
    STATUS_CONFIG
  };
};
