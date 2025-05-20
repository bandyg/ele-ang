export interface CartConfig {
  // 位置相关
  initialPosition?: { x: number; y: number }; // 初始位置
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'custom'; // 预设位置
  fixed?: boolean; // 是否固定位置（不可拖动）

  // 尺寸相关
  collapsedSize?: { width: number; height: number }; // 折叠时的尺寸
  expandedSize?: { width: number; maxHeight: string }; // 展开时的尺寸

  // 样式相关
  primaryColor?: string; // 主色调
  secondaryColor?: string; // 次要色调
  badgeColor?: string; // 徽章颜色
  iconColor?: string; // 图标颜色
  borderRadius?: number; // 边框圆角

  // 行为相关
  expandDirection?: 'up' | 'down' | 'left' | 'right'; // 展开方向
  autoCollapse?: boolean; // 点击外部时是否自动折叠
  showCheckoutButton?: boolean; // 是否显示结账按钮
  initialExpanded?: boolean; // 初始状态是否展开

  // 自定义文本
  emptyCartText?: string; // 空购物车文本
  checkoutButtonText?: string; // 结账按钮文本
  totalText?: string; // 总计文本

  // 支付相关
  paymentMethods?: {
    id: string;
    name: string;
    description: string;
    icon: string;
  }[];
}

// 默认配置
export const DEFAULT_CART_CONFIG: CartConfig = {
  initialPosition: { x: 20, y: 20 },
  position: 'custom',
  fixed: false,

  collapsedSize: { width: 60, height: 60 },
  expandedSize: { width: 320, maxHeight: 'calc(50vh + 60px)' },

  primaryColor: '#4a90e2',
  secondaryColor: 'white',
  badgeColor: '#ff4757',
  iconColor: 'white',
  borderRadius: 8,

  expandDirection: 'down',
  autoCollapse: false,
  showCheckoutButton: true,
  initialExpanded: false,

  emptyCartText: 'Your cart is empty',
  checkoutButtonText: 'Checkout',
  totalText: 'Total:',

  paymentMethods: [
    {
      id: 'cash_voucher',
      name: 'Cash Voucher',
      description: 'Pay with cash voucher',
      icon: 'assets/icons/credit-card.svg',
    },
    {
      id: 'ewallet',
      name: 'eWallet',
      description: 'Fast and secure payment',
      icon: 'assets/icons/paypal.svg',
    },
    {
      id: 'alipay_hk',
      name: 'Alipay HK',
      description: 'Chinese payment platform',
      icon: 'assets/icons/alipay.svg',
    },
    {
      id: 'wechat_pay_hk',
      name: 'WeChat Pay HK',
      description: 'Pay with WeChat',
      icon: 'assets/icons/wechat-pay.svg',
    },
  ],
};
