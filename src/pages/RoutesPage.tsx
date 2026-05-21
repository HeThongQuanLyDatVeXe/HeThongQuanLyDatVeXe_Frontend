import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Header } from '../components/layouts/Header';
import { Footer } from '../components/layouts/Footer';
import { 
  Clock, 
  Bus
} from '@phosphor-icons/react';

export interface RouteItem {
  id: string;
  from: string;
  to: string;
  region: 'Miền Bắc' | 'Miền Trung' | 'Miền Nam' | 'Tây Nguyên' | 'Đông Nam Bộ';
  title: string;
  description: string;
  duration: string;
  durationMinutes: number;
  price: number;
  image: string;
  isPopular: boolean;
  vehicleType: 'Giường nằm cao cấp' | 'Limousine Boeing' | 'Ghế ngồi tiêu chuẩn';
}

export const mockRoutes: RouteItem[] = [
  {
    id: '1',
    from: 'Hà Nội',
    to: 'Sapa',
    region: 'Miền Bắc',
    title: 'Hành trình vùng cao',
    description: 'Chinh phục đỉnh Phan Xi Păng huyền thoại và bản làng sương mù.',
    duration: '6 giờ di chuyển',
    durationMinutes: 360,
    price: 280000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAxcdGviOE7-ln1fEiANfo4OaCWXzRPg357tx_EqNQNOYmw_UKqNvLGdOP4nLv-9Znvt-j2bUlR-zOsouaxIBmA9lcMHmMKlVzmG8cYFRbSv4nIAutgVKM-1dGjLB259fic23B4k5mbdoWqKm93hDAriRJsfE5Kf6wtIMXc9CX_prU7dey4gFGCpn3oXtOEtSGttOyC8jTLFCUpS3EEUlMTxfhCsSzerUpX98XU-EvgxjZBQFSzEnZgqMMSbpcswkxr-19ZvRTVrY',
    isPopular: true,
    vehicleType: 'Giường nằm cao cấp'
  },
  {
    id: '2',
    from: 'TP. Hồ Chí Minh',
    to: 'Đà Lạt',
    region: 'Tây Nguyên',
    title: 'Xứ sở ngàn hoa',
    description: 'Tận hưởng không khí se lạnh thơ mộng giữa ngàn thông reo.',
    duration: '8 giờ di chuyển',
    durationMinutes: 480,
    price: 350000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGLQm4daeQnrmdk4XldK8q3uwjeu_DE94aZlBGKix76X9uiBqRXks6tEtO76ggzsNYcmx6EqlNqYW7CnQlqPjo8cRYL6sx--IC6EPQO9Jsg43Y2pPkQLN8qpRkoAGhojVwyhwCsM9-QBDtprx5BOsgGQj4MCpdOhx3ZWah8f5Ok-BhazTAJ_nAN4J0t4lGRqvmHVVgjlm2N1aL4u4Aw5u3J8BBiAOkIjCbwjt_a1FZlilNZFDqPM73eDDJjJeskQ7gxz85tbe-M6w',
    isPopular: true,
    vehicleType: 'Limousine Boeing'
  },
  {
    id: '3',
    from: 'Đà Nẵng',
    to: 'Hội An',
    region: 'Miền Trung',
    title: 'Di sản Phố Cổ',
    description: 'Thả mình bên dòng sông Thu Bồn lung linh ánh hoa đăng.',
    duration: '45 phút di chuyển',
    durationMinutes: 45,
    price: 120000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYQ9RJyIPXaPsUXJ3zPfrRzeD52PdbHm-neMZPxzNaGED89socw5QRGSMz9cPHyIof2Q046u6VC4x3G1aMdapLrsNyVQUWnScSMkJ_WiWcP9EXQ7-knljdDm5xJZWxG67t3BdMkmDtiVZsZFQb7mnF9M7wgCDJbpfcE6dOh1BzOoaz_dFBJNoVlhT___MX-MaOciunXKqfjVPaEb4OCD_5QvuVBcc2ZCpOwjd4sVi3ke-jyS0fS1H2p2qmJlvAvAmlOyQEZSZ1EDY',
    isPopular: true,
    vehicleType: 'Ghế ngồi tiêu chuẩn'
  },
  {
    id: '4',
    from: 'TP. Hồ Chí Minh',
    to: 'Nha Trang',
    region: 'Miền Nam',
    title: 'Biển xanh vẫy gọi',
    description: 'Cát trắng nắng vàng, hải sản tươi ngon tràn ngập hân hoan.',
    duration: '9 giờ di chuyển',
    durationMinutes: 540,
    price: 300000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAih2uXNxVx_sphzMoIqTCdq9qeCGR5eOf9pDYcV9wnxQyqcUdqzKXUUp6_QEfQPY5OgN3k7zT0vg1HA4XWF1ehJpROeBXalqoXs5Xch67Y9PCgT0OZcBz3zloBgc4lY8ZfT7Wz8ExDJaYZV9jdwNnTuVfNl_YgBLITbVEbW1gD-Gk3d5-Nq04jr76JOqqLZVrmAZ8JQ1t5noOf7jSGwSblZC9ehmrdlzCHNn-OPOBLWd9_Mhzke13TAO738iRRbdjbW6bmJnpYLis',
    isPopular: false,
    vehicleType: 'Giường nằm cao cấp'
  },
  {
    id: '5',
    from: 'Hà Nội',
    to: 'Hải Phòng',
    region: 'Miền Bắc',
    title: 'Thành phố hoa phượng đỏ',
    description: 'Hành trình khám phá food tour đất Cảng sôi nổi, nhộn nhịp.',
    duration: '2 giờ di chuyển',
    durationMinutes: 120,
    price: 150000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMhMTRQ3Fj7GU2-rjCAxClTrO019zk7Sq_CSuJ-RxTIDOVeomaZoE-u5SaKIqSTbIQw3zUW_J5LT369SYO74f3wnBM8ruomyUXsdkPWzWs5oHhRF_ZSA7nIG8L64r8Q2n5LK484-rmKqKGPjelsxdV25jABmx5b9XxEIhbqNUqAUgGIg1ApWEKrxGgWphSkW4i_YZZ-a71LaqWmN3m-kYixxuc0saw8iQbYcsqWk5ISeAVsphAsJEmssvmWyiuDdMzLZlZr4tdQxc',
    isPopular: false,
    vehicleType: 'Ghế ngồi tiêu chuẩn'
  },
  {
    id: '6',
    from: 'TP. Hồ Chí Minh',
    to: 'Vũng Tàu',
    region: 'Đông Nam Bộ',
    title: 'Gió biển cuối tuần',
    description: 'Cung đường biển thơ mộng nghỉ dưỡng trọn vẹn lý tưởng.',
    duration: '2.5 giờ di chuyển',
    durationMinutes: 150,
    price: 180000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUz2JVvBa80C-A_MM2FhnwB-ZRRyq6KQ1tj5NQEGTrjrpXiaOvpKlpMRuryWQ1Xs6XT-Asa32gSzbOJBwA47aKgk0_urOoZJKEpAAELFJROXpNtIh0xKJtKBFnYluQ5-kS1H0I50qo38ZIuXXXxZsHIgaInEf6FXtUPcpYMeCPFfooc2IPR_f22R8l8cdtTUB4-g3fNrRXY9j6496FuLPManlJ2wrzoggjZ4E3dNj9Oh7Jyiqf1JYJT3p5uZhhbECDsqnA6eLFV7E',
    isPopular: false,
    vehicleType: 'Limousine Boeing'
  },
  {
    id: '7',
    from: 'Đà Nẵng',
    to: 'Quy Nhơn',
    region: 'Miền Trung',
    title: 'Nắng ấm Quy Nhơn',
    description: 'Khám phá bãi tắm Kỳ Co, Eo Gió hùng vĩ, lộng gió trời.',
    duration: '5 giờ di chuyển',
    durationMinutes: 300,
    price: 250000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaPjhqxPT6PeZQSANp-Q-QN3nU2yZ0Y_ZaeSuLaMh8MucsHtza9L92oniVUeCVCej5zeCm995VISYXqF4kp32S065C-a6FMvcUi66fpv0jgWA3C9emv--i-OW8WYlZZ56tjxsPfPQj-qT4iXZxOiElN_CUDQUAiwuaR2NvAyVVSgFlqygX9Rwq5YUHHEQx3Og4xlkJCRTsHRJx8Hlc6fPmQIPV4DicFRZlBiMEIIwMSQ5OBavbMxIhTrKBMcjPfN1EoX-EaAM649s',
    isPopular: false,
    vehicleType: 'Giường nằm cao cấp'
  },
  {
    id: '8',
    from: 'Hà Nội',
    to: 'Ninh Bình',
    region: 'Miền Bắc',
    title: 'Non nước Ninh Bình',
    description: 'Thăm danh thắng Tràng An, Tam Cốc cảnh sắc thiên nhiên kỳ ảo.',
    duration: '1.5 giờ di chuyển',
    durationMinutes: 90,
    price: 110000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrG72iS8alc_vq4vyfzoQshXWys8ymAA_Y5zMFrVTxA9MIk03vJ-m58FqyV1S1wJr-UyULF-uWGjF07c0lhHk8cELpK-OPXzMM655kHVKIQy1VfZYNQp70wpn-P5voNeIS0byBczTHyl6hSa7FXMlc10txcWfihxaws1CXBY43JA4efSMrDXSYTA0syGzv98y3GBBQPGrS3SnDModkkf716CeDzYjm_u4deGFGhI1loSCu0hHprF9tm7bTrJnnIcFusvIFpIiVImM',
    isPopular: false,
    vehicleType: 'Ghế ngồi tiêu chuẩn'
  },
  {
    id: '9',
    from: 'TP. Hồ Chí Minh',
    to: 'Cần Thơ',
    region: 'Miền Nam',
    title: 'Sông nước Miền Tây',
    description: 'Khám phá chợ nổi Cái Răng náo nhiệt tràn đầy bản sắc phương Nam.',
    duration: '3 giờ di chuyển',
    durationMinutes: 180,
    price: 160000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLxBiWfyIkOSff-4i5wxLaMK78pe9kfMPrqzOxUs_dFG0QyUINzEGrSJ0lk6tAzMo2kyxDgqPPJ7cy9B__dPyYiWiOt6J4oTHkXfBo6DdVV_xbZr4PK9pzldNHl8PKSvTiw9rIRhqI1SyHtr05HZrw8leVJZoLNH9QvAr3EIE5NB6o3zgiaWdcgHxKEDBbUX-QqiUwUNLZB_q7xr924DOp_JeOkPwUPDCd63RkMnX1xccukSZo29QIA_-JZr1LV1zW2MyOCE5TBdQ',
    isPopular: false,
    vehicleType: 'Ghế ngồi tiêu chuẩn'
  },
  {
    id: '10',
    from: 'Buôn Ma Thuột',
    to: 'Nha Trang',
    region: 'Tây Nguyên',
    title: 'Hương ngàn vẫy gọi biển khơi',
    description: 'Nối liền núi rừng cao nguyên lộng gió với vịnh biển thơ mộng.',
    duration: '4 giờ di chuyển',
    durationMinutes: 240,
    price: 220000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrS1_YEG6OXhNbNRC0167ng84EVPHEugkZU1g7VRdzRpBy-BghnT535QHM0WWDDkNkRWGWiGdlziOr_4H2cLnVi1sJilGn3jsNLouVInPzR9mNhxY73A3rp2hq7nBXkCchj3xQ--2Kao_SmLJFbsapjsHCqN2NC0nO0_sO8ZmHPWC9dbf4JJqiSf52amNKj18qa0yoLup0VFO4ka8iCaFosQTBsNWfK1ePBHhfy5EVyfmBYuQnDPGe35gSTxBcgz7UNHNLr_m20XM',
    isPopular: false,
    vehicleType: 'Limousine Boeing'
  },
  {
    id: '11',
    from: 'Hà Nội',
    to: 'Cao Bằng',
    region: 'Miền Bắc',
    title: 'Kỳ vĩ Thác Bản Giốc',
    description: 'Chiêm ngưỡng ngọn thác đẹp bậc nhất biên cương Đông Bắc đất nước.',
    duration: '7 giờ di chuyển',
    durationMinutes: 420,
    price: 320000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtm9kf5mZscRc5iT1CLtdGE0B525F0rlierj3AzA03TwcpWYtY4r4SHwOhgR6NZKhsoqRK38dIDBCLcL1OMAxyYd8VRaiVHUuiAWtLsYXCYtAFXOCCIuKIXU9ij4nPmI9P3a1jVLR7An_7zmm5KHmCJhIOWtLtQuRpCTsc6AcjNGIUUKl9sNHK4PlSg_71XZ8D8djNHB-wdnD-c-T1HV36zXKbYQZX2rxJ1zDHkSPsQqT34BEQ0cRdf6x0UXl-VpapPM7oUVV9KvQ',
    isPopular: false,
    vehicleType: 'Giường nằm cao cấp'
  },
  {
    id: '12',
    from: 'Đà Nẵng',
    to: 'Huế',
    region: 'Miền Trung',
    title: 'Cố đô thâm trầm',
    description: 'Vượt đèo Hải Vân đệ nhất hùng quan tìm về Kinh thành rêu phong.',
    duration: '2.5 giờ di chuyển',
    durationMinutes: 150,
    price: 100000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAih2uXNxVx_sphzMoIqTCdq9qeCGR5eOf9pDYcV9wnxQyqcUdqzKXUUp6_QEfQPY5OgN3k7zT0vg1HA4XWF1ehJpROeBXalqoXs5Xch67Y9PCgT0OZcBz3zloBgc4lY8ZfT7Wz8ExDJaYZV9jdwNnTuVfNl_YgBLITbVEbW1gD-Gk3d5-Nq04jr76JOqqLZVrmAZ8JQ1t5noOf7jSGwSblZC9ehmrdlzCHNn-OPOBLWd9_Mhzke13TAO738iRRbdjbW6bmJnpYLis',
    isPopular: false,
    vehicleType: 'Ghế ngồi tiêu chuẩn'
  }
];

const popularCities = [
  { name: 'Sapa', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6B2vIJO0FJgmNpQHkgM8qdJT6n-9nT3vdWSxWRHktSi1ch0LBnUEiT-obl3q5A5512Jr-6mdNx5z_5abiZtiU7djK_dyXpXn_n8NDfgjzONAiO8nByImWMFiCBzEDzVWERaq_xtdRIuWcBashhjCkKQEMZeVLM8bKtLY_joZzGIF9cvv7t6emQY0-juOE6NW0Ogz-zOgtEZO9LcO6nGw0r5Mx0GDDeQ2q6Ukhxk0nq7O3DJonfITF7d2ncnbrrzh_-mSfS-3uu14' },
  { name: 'Đà Nẵng', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZ-xLLrTeeY3if2IG-wdZ3YrWqkYbatD-mddE_4yWpr78wJfpcLHZa5KCjKaclLJl4lG_oTQNAHKGeTw9iNmqQ3EiYpQTOGcHL2P8VmjPicY1PLGT74l7xON51GHe1aaXMtcU-Wrmg8AGsCvxoH9a4nR08rpWaJXo_ahs8Lm8tAKJrpMRXnp-_8sRO1ZlkgOJkD7sqNTKiqQY8ynMjnOSpnv0wiGc3HquRER8MMdDlbw1vLASMxShuNcExSYLg1-bgHCti74fRFQ' },
  { name: 'Đà Lạt', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGLQm4daeQnrmdk4XldK8q3uwjeu_DE94aZlBGKix76X9uiBqRXks6tEtO76ggzsNYcmx6EqlNqYW7CnQlqPjo8cRYL6sx--IC6EPQO9Jsg43Y2pPkQLN8qpRkoAGhojVwyhwCsM9-QBDtprx5BOsgGQj4MCpdOhx3ZWah8f5Ok-BhazTAJ_nAN4J0t4lGRqvmHVVgjlm2N1aL4u4Aw5u3J8BBiAOkIjCbwjt_a1FZlilNZFDqPM73eDDJjJeskQ7gxz85tbe-M6w' },
  { name: 'Nha Trang', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAih2uXNxVx_sphzMoIqTCdq9qeCGR5eOf9pDYcV9wnxQyqcUdqzKXUUp6_QEfQPY5OgN3k7zT0vg1HA4XWF1ehJpROeBXalqoXs5Xch67Y9PCgT0OZcBz3zloBgc4lY8ZfT7Wz8ExDJaYZV9jdwNnTuVfNl_YgBLITbVEbW1gD-Gk3d5-Nq04jr76JOqqLZVrmAZ8JQ1t5noOf7jSGwSblZC9ehmrdlzCHNn-OPOBLWd9_Mhzke13TAO738iRRbdjbW6bmJnpYLis' },
  { name: 'Vũng Tàu', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUz2JVvBa80C-A_MM2FhnwB-ZRRyq6KQ1tj5NQEGTrjrpXiaOvpKlpMRuryWQ1Xs6XT-Asa32gSzbOJBwA47aKgk0_urOoZJKEpAAELFJROXpNtIh0xKJtKBFnYluQ5-kS1H0I50qo38ZIuXXXxZsHIgaInEf6FXtUPcpYMeCPFfooc2IPR_f22R8l8cdtTUB4-g3fNrRXY9j6496FuLPManlJ2wrzoggjZ4E3dNj9Oh7Jyiqf1JYJT3p5uZhhbECDsqnA6eLFV7E' }
];

export const RoutesPage: React.FC = () => {
  const navigate = useNavigate();
  // Input search parameters
  const [startQuery, setStartQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  
  // Filtering selections
  const [selectedRegion, setSelectedRegion] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('Phổ biến nhất');
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([
    'Giường nằm cao cấp',
    'Limousine Boeing',
    'Ghế ngồi tiêu chuẩn'
  ]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Smooth back to top on route filters click
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleShortcutClick = (cityName: string) => {
    setDestQuery(cityName);
    // Smooth scroll down to main route selection catalog
    const element = document.getElementById('catalog-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleVehicleCheckbox = (type: string) => {
    if (selectedVehicles.includes(type)) {
      setSelectedVehicles(selectedVehicles.filter(item => item !== type));
    } else {
      setSelectedVehicles([...selectedVehicles, type]);
    }
  };

  // Filter & Sort dynamic logic
  const filteredRoutes = mockRoutes
    .filter(route => {
      // Search matches
      const matchesStart = route.from.toLowerCase().includes(startQuery.toLowerCase());
      const matchesDest = route.to.toLowerCase().includes(destQuery.toLowerCase());
      
      // Region matches
      const matchesRegion = selectedRegion === 'Tất cả' || route.region === selectedRegion;
      
      // Price matches
      const matchesPrice = route.price <= maxPrice;
      
      // Vehicle type matches
      const matchesVehicle = selectedVehicles.includes(route.vehicleType);
      
      return matchesStart && matchesDest && matchesRegion && matchesPrice && matchesVehicle;
    })
    .sort((a, b) => {
      if (sortBy === 'Giá thấp nhất') {
        return a.price - b.price;
      }
      if (sortBy === 'Thời gian ngắn nhất') {
        return a.durationMinutes - b.durationMinutes;
      }
      // Popular defaults: popular markers first, then price descending
      const aVal = (a.isPopular ? 1 : 0);
      const bVal = (b.isPopular ? 1 : 0);
      if (bVal !== aVal) {
        return bVal - aVal;
      }
      return b.price - a.price;
    });

  return (
    <div className="min-h-screen bg-background text-on-background font-body select-none">
      <Header />

      <main className="pt-20">
        {/* Grain Overlay matching design */}
        <div className="grain-overlay" />

        {/* Hero Header Section */}
        <section className="h-[280px] bg-[#1A1410] relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#F4600C22_0%,_transparent_70%)] opacity-60 pointer-events-none" />
          <div className="relative z-10 w-full max-w-container-max px-gutter text-center">
            <h1 className="typo-headline-lg text-on-primary mb-6">Hành trình hoài niệm</h1>
            
            {/* Quick Search Bar (Capsule Row, non-stacking across viewports) */}
            <div className="bg-surface-container-lowest p-2 rounded-full shadow-lg max-w-2xl w-full mx-auto flex items-center gap-2 border border-outline/20">
              <div className="flex-1 flex items-center px-4 gap-3">
                <span className="material-symbols-outlined text-outline">location_on</span>
                <input 
                  value={startQuery}
                  onChange={(e) => setStartQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 focus:outline-none w-full typo-body-md placeholder:text-outline-variant text-on-surface" 
                  placeholder="Điểm khởi hành" 
                  type="text"
                />
              </div>
              <div className="h-8 w-px bg-outline-variant shrink-0" />
              <div className="flex-1 flex items-center px-4 gap-3">
                <span className="material-symbols-outlined text-outline">distance</span>
                <input 
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 focus:outline-none w-full typo-body-md placeholder:text-outline-variant text-on-surface" 
                  placeholder="Điểm đến" 
                  type="text"
                />
              </div>
              <button className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors shadow-md active:scale-95 cursor-pointer shrink-0">
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>
        </section>

        {/* Sticky Region Filter Tab Bar */}
        <section className="sticky top-20 z-40 bg-surface-bright/80 backdrop-blur-md border-b border-outline/10 overflow-x-auto hide-scrollbar">
          <div className="max-w-container-max mx-auto px-gutter flex items-center gap-lg h-16">
            {['Tất cả', 'Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên', 'Đông Nam Bộ'].map((region) => (
              <button 
                key={region}
                className={`whitespace-nowrap py-4 px-2 typo-label-caps tracking-widest uppercase transition-all duration-300 border-b-2 cursor-pointer ${
                  selectedRegion === region 
                    ? 'region-tab-active text-primary' 
                    : 'text-on-surface-variant hover:text-primary border-transparent'
                }`}
                onClick={() => setSelectedRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>
        </section>

        {/* Popular Destinations Shortcuts strip */}
        <section className="py-sm bg-surface-container-low/30 border-b border-outline/5 select-none">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="flex overflow-x-auto gap-md py-4 hide-scrollbar items-center">
              <span className="typo-label-caps text-[10px] uppercase tracking-wider text-outline whitespace-nowrap mr-2">Phổ biến:</span>
              <div className="flex gap-md items-center">
                {popularCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleShortcutClick(city.name)}
                    className="flex flex-col items-center gap-2 group cursor-pointer bg-transparent border-none outline-none focus:outline-none shrink-0"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-transparent hover:border-primary p-1 transition-all group-hover:scale-105">
                      <img className="w-full h-full object-cover rounded-full" src={city.img} alt={city.name} />
                    </div>
                    <span className="typo-label-caps text-[10px] uppercase tracking-tighter text-on-background">{city.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid Catalog */}
        <div id="catalog-content" className="max-w-container-max mx-auto px-gutter py-lg grid grid-cols-1 lg:grid-cols-12 gap-lg scroll-mt-36">
          
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3">
            <div className="sticky top-40 space-y-lg">
              <div>
                <h3 className="typo-headline-md mb-md text-on-surface">Lọc kết quả</h3>
                <div className="space-y-4">
                  <label className="block">
                    <span className="typo-label-caps mb-2 block text-outline">Sắp xếp theo</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-xl border-outline/20 bg-surface-container-lowest focus:ring-primary focus:border-primary typo-body-md text-on-surface"
                    >
                      <option value="Phổ biến nhất">Phổ biến nhất</option>
                      <option value="Giá thấp nhất">Giá thấp nhất</option>
                      <option value="Thời gian ngắn nhất">Thời gian ngắn nhất</option>
                    </select>
                  </label>

                  <div className="pt-4">
                    <span className="typo-label-caps mb-2 block text-outline">Khoảng giá (VNĐ)</span>
                    <input 
                      className="w-full accent-primary cursor-pointer"
                      max="2000000" 
                      min="100000" 
                      step="50000" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      type="range"
                    />
                    <div className="flex justify-between typo-label-sm text-outline mt-2">
                      <span>100k</span>
                      <span className="text-primary font-bold">{maxPrice.toLocaleString()}₫</span>
                      <span>2.000k</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <span className="typo-label-caps mb-3 block text-outline">Loại xe</span>
                    <div className="space-y-2">
                      {['Giường nằm cao cấp', 'Limousine Boeing', 'Ghế ngồi tiêu chuẩn'].map((type) => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer select-none group">
                          <input 
                            checked={selectedVehicles.includes(type)}
                            onChange={() => toggleVehicleCheckbox(type)}
                            className="rounded border-outline/20 text-primary focus:ring-primary h-4.5 w-4.5 transition-all"
                            type="checkbox"
                          />
                          <span className="typo-body-md text-on-surface-variant group-hover:text-primary transition-colors">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Route Grid Content Section */}
          <div className="lg:col-span-9 flex flex-col gap-md">
            <div className="flex justify-between items-center mb-md">
              <p className="typo-body-md text-on-surface-variant italic">
                Tìm thấy <span className="font-bold text-primary">{filteredRoutes.length}</span> tuyến đường cho hành trình của bạn
              </p>
              
              {/* Layout view controls */}
              <div className="flex gap-2 bg-surface-container p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' 
                      ? 'bg-surface-container-lowest shadow-sm text-primary' 
                      : 'text-outline hover:text-primary'
                  }`}
                  title="Xem dạng lưới"
                >
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list' 
                      ? 'bg-surface-container-lowest shadow-sm text-primary' 
                      : 'text-outline hover:text-primary'
                  }`}
                  title="Xem dạng danh sách"
                >
                  <span className="material-symbols-outlined">reorder</span>
                </button>
              </div>
            </div>

            {/* Routes container */}
            {filteredRoutes.length > 0 ? (
              <div 
                className={`transition-all duration-500 gap-md ${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'flex flex-col'
                }`}
              >
                {filteredRoutes.map((route) => (
                  <article 
                    key={route.id}
                    className={`bg-surface-container-lowest rounded-xl border border-outline-variant hover:shadow-lg transition-all duration-300 overflow-hidden flex ${
                      viewMode === 'grid' 
                        ? 'flex-col h-full' 
                        : 'flex-col md:flex-row items-center'
                    }`}
                  >
                    {/* Cover photo panel */}
                    <div 
                      className={`relative overflow-hidden bg-slate-50 shrink-0 ${
                        viewMode === 'grid' 
                          ? 'h-48 w-full' 
                          : 'h-48 w-full md:h-full md:w-56'
                      }`}
                    >
                      <img 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 select-none pointer-events-none" 
                        src={route.image} 
                        alt={route.to} 
                      />
                      {route.isPopular && (
                        <span className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          🔥 Phổ biến
                        </span>
                      )}
                      <span className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[12px] font-bold text-primary">
                        {route.region}
                      </span>
                    </div>

                    {/* Text description panel */}
                    <div className="p-gutter flex-1 flex flex-col w-full h-full">
                      <div className="flex flex-col gap-1 mb-3 text-left">
                        <h4 className="typo-headline-md mb-1 text-on-surface">
                          {route.from} — {route.to}
                        </h4>
                        <p className="typo-label-sm text-outline mb-4">
                          {route.title}
                        </p>
                      </div>
                      
                      <p className="typo-body-md text-on-surface-variant leading-relaxed mb-4 text-left flex-1 line-clamp-2 md:line-clamp-none">
                        {route.description}
                      </p>

                      {/* Ticket Dash line */}
                      <div className="ticket-divider w-full h-px mb-4" />

                      {/* Card layout bottom controls */}
                      <div className="flex justify-between items-end mt-auto w-full gap-4">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-1 typo-label-sm text-outline-variant">
                            <Clock size={16} className="text-outline-variant" />
                            <span>{route.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 typo-label-sm text-outline-variant">
                            <Bus size={16} className="text-outline-variant" />
                            <span>{route.vehicleType}</span>
                          </div>
                          <div className="text-primary typo-headline-md mt-1">
                            {route.price.toLocaleString()}đ
                          </div>
                        </div>

                        <button 
                          onClick={() => navigate(`${ROUTES.ROUTES}/${route.id}`)}
                          className="bg-primary-fixed-dim hover:bg-primary-container hover:text-white text-on-primary-fixed-variant px-4 py-2 rounded-xl typo-label-caps transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              // Empty search template view
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center shadow-sm flex flex-col items-center gap-4 py-24 select-none">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <span className="material-symbols-outlined text-[32px]">filter_alt_off</span>
                </div>
                <h4 className="typo-headline-md text-primary">Không tìm thấy kết quả phù hợp</h4>
                <p className="typo-body-md text-on-surface-variant max-w-sm leading-relaxed">
                  Hãy thử mở rộng bộ lọc giá vé, thay đổi từ khóa tìm kiếm hoặc chọn vùng miền khác.
                </p>
                <button
                  onClick={() => {
                    setStartQuery('');
                    setDestQuery('');
                    setSelectedRegion('Tất cả');
                    setMaxPrice(2000000);
                    setSelectedVehicles(['Giường nằm cao cấp', 'Limousine Boeing', 'Ghế ngồi tiêu chuẩn']);
                  }}
                  className="mt-4 px-6 py-2.5 border border-outline/20 text-primary rounded-xl typo-label-caps uppercase hover:bg-primary-hover hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editorial CTA Banner */}
        <section className="bg-[#1A1410] py-xl overflow-hidden relative select-none">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] pointer-events-none" />
          <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-2 items-center gap-lg relative z-10">
            <div className="flex flex-col gap-6 text-left">
              <h2 className="typo-headline-lg text-on-primary mb-4 italic leading-tight">
                Chưa biết đi đâu?
              </h2>
              <p className="text-on-primary/70 typo-body-lg mb-lg max-w-md">
                Để chúng tôi gợi ý cho bạn một hành trình mang đậm dấu ấn riêng.
              </p>
              <button 
                onClick={() => alert('Chức năng gợi ý hành trình đang được phát triển!')}
                className="bg-primary text-on-primary px-8 py-3 rounded-xl typo-label-caps hover:bg-primary-container transition-all w-fit cursor-pointer"
              >
                Khám phá cảm hứng
              </button>
            </div>

            <div className="relative h-[400px] flex items-center justify-center w-full">
              {/* Stacked question card effect */}
              <div className="absolute w-64 h-80 bg-surface-container-highest rounded-xl shadow-2xl rotate-6 translate-x-12 translate-y-4 opacity-40" />
              <div className="absolute w-64 h-80 bg-surface-container-high rounded-xl shadow-2xl -rotate-3 translate-x-4 translate-y-2 opacity-60" />
              <div className="absolute w-64 h-80 bg-white rounded-xl shadow-2xl z-10 p-gutter flex flex-col items-center text-center justify-center border border-outline/10">
                <span className="material-symbols-outlined text-[48px] text-primary mb-4 animate-pulse">favorite</span>
                <h4 className="typo-headline-md text-primary mb-2">Sở thích của bạn?</h4>
                <p className="text-on-surface-variant typo-body-md mb-6 leading-relaxed">Bạn thích biển xanh vẫy gọi hay núi rừng tĩnh lặng?</p>
                <div className="flex flex-col w-full gap-2">
                  <button 
                    onClick={() => handleShortcutClick('Nha Trang')}
                    className="w-full py-2 border border-outline/20 rounded-lg hover:bg-primary-container hover:text-white transition-colors typo-label-caps cursor-pointer"
                  >
                    Biển xanh
                  </button>
                  <button 
                    onClick={() => handleShortcutClick('Sapa')}
                    className="w-full py-2 border border-outline/20 rounded-lg hover:bg-primary-container hover:text-white transition-colors typo-label-caps cursor-pointer"
                  >
                    Núi rừng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
