export interface Product {
  id: number;
  name: string;
  arabicName?: string;
  category: string;
  subCategory?: string;
  brand: string;
  price: number;
  pack: string;
  size: string;
  unit: string;
  pricePerUnit: number;
  supplier: string;
  img: string;
  description?: string;
  isFeatured?: boolean;
  isMostSelling?: boolean;
  isNew?: boolean;
  stock?: number;
}

export interface Category {
  id: string;
  name: string;
  arabicName: string;
  subCategories: string[];
}

export interface Brand {
  id: string;
  name: string;
  tagline?: string;
}

export interface CustomerAddress {
  id: string;
  title: string;
  country: string;
  region: string;
  city: string;
  locationLink: string;
  closeAtNoon: boolean;
  note: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  customerType: string;
  addresses: CustomerAddress[];
  selectedAddressId?: string;
  joinedDate?: string;
  ordersCount?: number;
  totalSpent?: number;
}

export interface PaymentSettings {
  enableCashOnDelivery: boolean;
  enableCreditCard: boolean;
  enableBankTransfer: boolean;
  enableCreditTerms: boolean;
  bankName: string;
  bankAccountNo: string;
  bankIban: string;
  bankBeneficiary: string;
  bankBranch?: string;
  customPaymentNotes?: string;
  acceptedCardTypes?: string;
}

export interface HeroBanner {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  targetCategory?: string;
  imgUrl: string;
  bgColor?: string;
  textColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  active: boolean;
  aspectRatio?: '16:9' | '21:9' | '16:7' | 'auto';
}

export interface AppNotification {
  id: string;
  type: 'offer' | 'delivery' | 'stock' | 'discount' | 'announcement';
  tag: string;
  title: string;
  desc: string;
  time: string;
  targetCategory?: string;
  active: boolean;
  showInTopBar?: boolean;
  topBarBadge?: string;
}

export interface AppConfig {
  name: string;
  tagline: string;
  logoUrl?: string;
  splashTitle?: string;
  splashTagline?: string;
  email?: string;
  currency: string;
  whatsappNumber: string;
  companyName: string;
  companyDetails: string;
  arabicCompanyName?: string;
  arabicCompanyDetails?: string;
  arabicSultanateDetails?: string;
  crNumber: string;
  vatin: string;
  bankDetails?: string;
  adminPin: string;
  themePreset: string;
  customColor: string;
  language: 'en' | 'ar' | 'ur';
  freeDeliveryThreshold: number;
  paymentSettings?: PaymentSettings;
  heroBanners?: HeroBanner[];
  notifications?: AppNotification[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  name: string;
  arabicName?: string;
  price: number;
  pack: string;
  size: string;
  unit: string;
  quantity: number;
  total: number;
  vatAmount?: number;
}

export interface Order {
  id: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  phone: string;
  customerType: string;
  address: CustomerAddress | null;
  items: OrderItem[];
  subtotal: number;
  vat: number;
  deliveryFee: number;
  grandTotal: number;
  status: 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered';
  paymentMethod?: string;
  paymentDetails?: string;
  whatsappLink?: string;
}
