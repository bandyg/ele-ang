import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import {
  CartConfig,
  DEFAULT_CART_CONFIG,
} from '../../models/cart-config.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="cart-container"
      [class.expanded]="isExpanded"
      [class.fixed]="config.fixed"
      [ngClass]="getPositionClass()"
      [style.top.px]="getTopPosition()"
      [style.bottom.px]="getBottomPosition()"
      [style.left.px]="getLeftPosition()"
      [style.right.px]="getRightPosition()"
      [style.width.px]="getWidth()"
      [style.height]="getHeight()"
      [style.border-radius.px]="config.borderRadius"
      [style.background-color]="config.secondaryColor"
      #cartContainer
    >
      <!-- Cart header and drag handle -->
      <div
        class="cart-header"
        [style.background-color]="config.primaryColor"
        [style.height.px]="config.collapsedSize?.height"
        (mousedown)="config.fixed ? null : startDrag($event)"
      >
        <div class="cart-icon" (click)="handleCartIconClick($event)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            [attr.stroke]="config.iconColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
            ></path>
          </svg>
          <span
            *ngIf="cartCount > 0"
            class="badge"
            [style.background-color]="config.badgeColor"
          >
            {{ cartCount }}
          </span>
        </div>
      </div>

      <!-- Cart content -->
      <div
        class="cart-content"
        *ngIf="isExpanded"
        [ngClass]="'expand-' + config.expandDirection"
      >
        <h3>Shopping Cart</h3>

        <div *ngIf="flattenedCartItems.length === 0" class="empty-cart">
          {{ config.emptyCartText }}
        </div>

        <div *ngIf="flattenedCartItems.length > 0" class="cart-items-container">
          <button
            class="arrow-btn up"
            (click)="scrollUp()"
            [disabled]="!canScrollUp"
          >
            ▲
          </button>
          <div
            class="cart-items-list"
            #cartItemsList
            (scroll)="updateScrollButtons()"
          >
            <div
              *ngFor="let item of flattenedCartItems; let i = index"
              class="cart-item"
            >
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p class="price">{{ item.price | currency }}</p>
              </div>
              <button
                class="remove-btn"
                (click)="removeItemAtIndex(i)"
                [style.color]="config.badgeColor"
              >
                ×
              </button>
            </div>
          </div>
          <button
            class="arrow-btn down"
            (click)="scrollDown()"
            [disabled]="!canScrollDown"
          >
            ▼
          </button>
          <div class="cart-footer">
            <div class="cart-total">
              <span>{{ config.totalText }}</span>
              <span>{{ calculateTotal() | currency }}</span>
            </div>

            <button
              *ngIf="config.showCheckoutButton"
              class="checkout-btn"
              (click)="showPaymentMethods()"
              [style.background-color]="config.primaryColor"
            >
              {{ config.checkoutButtonText }}
            </button>
          </div>
        </div>
      </div>

      <!-- Payment Methods Modal -->
      <div
        *ngIf="showPaymentModal"
        class="payment-modal-overlay"
        (click)="closePaymentModal($event)"
      >
        <div class="payment-modal">
          <div class="payment-modal-header">
            <h3>Select Payment Method</h3>
            <button class="close-btn" (click)="closePaymentModal($event)">
              ×
            </button>
          </div>

          <div class="payment-methods">
            <div
              *ngFor="let method of config.paymentMethods"
              class="payment-method-item"
              [class.selected]="selectedPaymentMethod === method.id"
              (click)="selectPaymentMethod(method.id)"
            >
              <div class="payment-icon">
                <img [src]="method.icon" [alt]="method.name" />
              </div>
              <div class="payment-details">
                <h4>{{ method.name }}</h4>
                <p>{{ method.description }}</p>
              </div>
            </div>
          </div>

          <div class="payment-actions">
            <button class="cancel-btn" (click)="closePaymentModal($event)">
              Cancel
            </button>
            <button
              class="pay-btn"
              [disabled]="!selectedPaymentMethod"
              (click)="processPayment()"
              [style.background-color]="config.primaryColor"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cart-container {
        position: fixed;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s;
        cursor: move;
        overflow: hidden;
        box-sizing: border-box;
      }

      .cart-container.fixed {
        cursor: default;
      }

      .cart-container.position-top-left {
        top: 20px;
        left: 20px;
      }

      .cart-container.position-top-right {
        top: 20px;
        right: 20px;
      }

      .cart-container.position-bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .cart-container.position-bottom-right {
        bottom: 20px;
        right: 20px;
      }

      .cart-container.expanded {
        display: flex;
        flex-direction: column;
        cursor: default;
      }

      .cart-header {
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: move;
        flex-shrink: 0;
      }

      .fixed .cart-header {
        cursor: default;
      }

      .cart-icon {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }

      .badge {
        position: absolute;
        top: 2px;
        right: 2px;
        color: white;
        border-radius: 50%;
        min-width: 20px;
        height: 20px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
      }

      .cart-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
      }

      /* 展开方向样式 */
      .expand-up {
        transform-origin: bottom center;
      }

      .expand-down {
        transform-origin: top center;
      }

      .expand-left {
        transform-origin: right center;
      }

      .expand-right {
        transform-origin: left center;
      }

      .cart-content h3 {
        margin-top: 0;
        margin-bottom: 16px;
        text-align: center;
        flex-shrink: 0;
      }

      .empty-cart {
        text-align: center;
        color: #999;
        padding: 16px 0;
        flex-grow: 1;
      }

      .cart-items-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
      }

      .cart-items-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        flex-grow: 1;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */
      }
      .cart-items-list::-webkit-scrollbar {
        display: none; /* Chrome/Safari/Webkit */
      }

      .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }

      .item-info {
        flex: 1;
      }

      .item-info h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
      }

      .price {
        margin: 0;
        color: #666;
      }

      .remove-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 0 8px;
      }

      .cart-footer {
        margin-top: 12px;
        flex-shrink: 0;
        border-top: 1px solid #eee;
        padding-top: 12px;
      }

      .cart-total {
        display: flex;
        justify-content: space-between;
        padding-bottom: 12px;
        font-weight: bold;
      }

      .checkout-btn {
        width: 100%;
        padding: 12px;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .checkout-btn:hover {
        opacity: 0.9;
      }

      /* Payment Modal Styles */
      .payment-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }

      .payment-modal {
        width: 400px;
        max-width: 90%;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      }

      .payment-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #eee;
      }

      .payment-modal-header h3 {
        margin: 0;
        font-size: 18px;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .payment-methods {
        padding: 16px;
        max-height: 300px;
        overflow-y: auto;
      }

      .payment-method-item {
        display: flex;
        align-items: center;
        padding: 12px;
        border: 1px solid #eee;
        border-radius: 6px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .payment-method-item:hover {
        border-color: #4a90e2;
      }

      .payment-method-item.selected {
        border-color: #4a90e2;
        background-color: rgba(74, 144, 226, 0.05);
      }

      .payment-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
      }

      .payment-icon img {
        max-width: 100%;
        max-height: 100%;
      }

      .payment-details h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
      }

      .payment-details p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }

      .payment-actions {
        display: flex;
        justify-content: space-between;
        padding: 16px;
        border-top: 1px solid #eee;
      }

      .cancel-btn {
        padding: 10px 16px;
        background-color: #f1f1f1;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      }

      .pay-btn {
        padding: 10px 24px;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      }

      .pay-btn:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }

      .arrow-btn {
        width: 100%;
        background: #f1f1f1;
        border: none;
        color: #4a90e2;
        font-size: 18px;
        padding: 4px 0;
        cursor: pointer;
        transition: background 0.2s;
      }

      .arrow-btn:disabled {
        color: #ccc;
        background: #f5f5f5;
        opacity: 0.6;
        cursor: not-allowed;
        box-shadow: none;
      }

      .arrow-btn.up {
        border-radius: 6px 6px 0 0;
      }

      .arrow-btn.down {
        border-radius: 0 0 6px 6px;
      }
    `,
  ],
})
export class ShoppingCartComponent
  implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked
{
  @Input() config: CartConfig = DEFAULT_CART_CONFIG;
  @ViewChild('cartItemsList', { static: false }) cartItemsListRef: any;

  cartItems: CartItem[] = [];
  flattenedCartItems: CartItem[] = [];
  cartCount: number = 0;
  isExpanded: boolean = false;

  // Payment modal properties
  showPaymentModal: boolean = false;
  selectedPaymentMethod: string | null = null;

  position: { x: number; y: number } = { x: 20, y: 20 };

  private dragging = false;
  private dragOffset = { x: 0, y: 0 };
  private subscriptions: Subscription[] = [];
  private isDragged = false;
  scrollAmount = 80;
  canScrollUp = false;
  canScrollDown = false;

  constructor(
    private cartService: CartService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // 合并默认配置和用户配置
    this.config = { ...DEFAULT_CART_CONFIG, ...this.config };

    // 设置初始位置
    if (this.config.initialPosition) {
      this.position = {
        x: this.config.initialPosition.x || 20,
        y: this.config.initialPosition.y || 20,
      };
    }

    // 设置初始展开状态
    this.isExpanded = this.config.initialExpanded || false;

    // 订阅购物车服务
    this.subscriptions.push(
      this.cartService.getCartItems().subscribe((items) => {
        this.cartItems = items;
        this.flattenCartItems();
      }),

      this.cartService.getCartCount().subscribe((count) => {
        this.cartCount = count;
      })
    );

    // 拖拽事件监听器
    if (!this.config.fixed) {
      window.addEventListener('mousemove', this.onMouseMove.bind(this));
      window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    // 点击外部自动折叠
    if (this.config.autoCollapse) {
      window.addEventListener('click', this.onOutsideClick.bind(this));
    }
  }

  ngOnDestroy(): void {
    // 清理订阅
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    // 移除事件监听器
    if (!this.config.fixed) {
      window.removeEventListener('mousemove', this.onMouseMove.bind(this));
      window.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }

    if (this.config.autoCollapse) {
      window.removeEventListener('click', this.onOutsideClick.bind(this));
    }
  }

  ngAfterViewInit(): void {
    this.updateScrollButtons();
  }

  ngAfterViewChecked(): void {
    this.updateScrollButtons();
  }

  updateScrollButtons(): void {
    const el = this.cartItemsListRef?.nativeElement;
    if (!el) return;
    this.canScrollUp = el.scrollTop > 0;
    this.canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight;
  }

  scrollUp(): void {
    const el = this.cartItemsListRef?.nativeElement;
    if (el) {
      el.scrollBy({ top: -this.scrollAmount, behavior: 'smooth' });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  scrollDown(): void {
    const el = this.cartItemsListRef?.nativeElement;
    if (el) {
      el.scrollBy({ top: this.scrollAmount, behavior: 'smooth' });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  // 根据配置获取位置和尺寸
  getPositionClass(): string {
    if (this.config.position === 'custom') {
      return '';
    }
    return `position-${this.config.position}`;
  }

  getTopPosition(): number | null {
    if (
      this.config.position === 'bottom-left' ||
      this.config.position === 'bottom-right'
    ) {
      return null;
    }
    return this.position.y;
  }

  getBottomPosition(): number | null {
    if (
      this.config.position === 'top-left' ||
      this.config.position === 'top-right' ||
      this.config.position === 'custom'
    ) {
      return null;
    }
    return 20; // 距底部20px
  }

  getLeftPosition(): number | null {
    if (
      this.config.position === 'top-right' ||
      this.config.position === 'bottom-right'
    ) {
      return null;
    }
    return this.position.x;
  }

  getRightPosition(): number | null {
    if (
      this.config.position === 'top-left' ||
      this.config.position === 'bottom-left' ||
      this.config.position === 'custom'
    ) {
      return null;
    }
    return 20; // 距右侧20px
  }

  getWidth(): number {
    if (this.isExpanded) {
      return this.config.expandedSize?.width || 320;
    }
    return this.config.collapsedSize?.width || 60;
  }

  getHeight(): string {
    if (this.isExpanded) {
      return this.config.expandedSize?.maxHeight || 'calc(50vh + 60px)';
    }
    return `${this.config.collapsedSize?.height || 60}px`;
  }

  // 点击外部自动折叠
  onOutsideClick(event: MouseEvent): void {
    if (
      this.isExpanded &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.isExpanded = false;
    }
  }

  // Payment methods
  showPaymentMethods(): void {
    this.showPaymentModal = true;
    this.selectedPaymentMethod = null;
  }

  closePaymentModal(event: MouseEvent): void {
    // Check if click was on the overlay or close button
    const target = event.target as HTMLElement;
    if (
      target.classList.contains('payment-modal-overlay') ||
      target.classList.contains('close-btn') ||
      target.classList.contains('cancel-btn')
    ) {
      this.showPaymentModal = false;
      event.stopPropagation();
    }
  }

  selectPaymentMethod(methodId: string): void {
    this.selectedPaymentMethod = methodId;
  }

  processPayment(): void {
    if (this.selectedPaymentMethod) {
      // In a real app, you would process the payment here
      console.log(`Processing payment with ${this.selectedPaymentMethod}`);

      // Show a success message and clear the cart
      alert(
        `Payment successful with ${this.getPaymentMethodName(
          this.selectedPaymentMethod
        )}!`
      );
      this.cartService.clearCart();
      this.showPaymentModal = false;
    }
  }

  getPaymentMethodName(methodId: string): string {
    const method = this.config.paymentMethods?.find((m) => m.id === methodId);
    return method ? method.name : 'Unknown method';
  }

  // Flatten cart items to display each item individually
  private flattenCartItems(): void {
    this.flattenedCartItems = [];
    this.cartItems.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        this.flattenedCartItems.push({
          ...item,
          quantity: 1, // Each flattened item has quantity 1
        });
      }
    });
  }

  removeItemAtIndex(index: number): void {
    if (index >= 0 && index < this.flattenedCartItems.length) {
      const itemToRemove = this.flattenedCartItems[index];

      // Find the original item in cartItems
      const originalItem = this.cartItems.find(
        (item) => item.id === itemToRemove.id
      );

      if (originalItem && originalItem.quantity > 1) {
        // If there are multiple items, reduce quantity by 1
        this.cartService.updateQuantity(
          originalItem.id,
          originalItem.quantity - 1
        );
      } else {
        // If it's the last item, remove it completely
        this.cartService.removeFromCart(itemToRemove.id);
      }
    }
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  handleCartIconClick(event: MouseEvent): void {
    // Only toggle expand if we didn't just finish dragging
    if (!this.isDragged) {
      this.toggleExpand();
    }
    event.stopPropagation();
  }

  startDrag(event: MouseEvent): void {
    if (this.config.fixed) return;

    // Only initiate drag on header
    if ((event.target as HTMLElement).closest('.cart-header')) {
      this.dragging = true;
      this.isDragged = false; // Reset drag state
      this.dragOffset = {
        x: event.clientX - this.position.x,
        y: event.clientY - this.position.y,
      };
      event.preventDefault();
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.dragging) {
      this.isDragged = true; // Set flag that we're dragging
      this.position = {
        x: event.clientX - this.dragOffset.x,
        y: event.clientY - this.dragOffset.y,
      };

      // Ensure cart stays within viewport bounds
      const maxX = window.innerWidth - (this.config.collapsedSize?.width || 60);
      const maxY =
        window.innerHeight - (this.config.collapsedSize?.height || 60);

      if (this.position.x < 0) this.position.x = 0;
      if (this.position.y < 0) this.position.y = 0;
      if (this.position.x > maxX) this.position.x = maxX;
      if (this.position.y > maxY) this.position.y = maxY;
    }
  }

  private onMouseUp(): void {
    // Set a small timeout to keep track of whether we were just dragging
    if (this.dragging) {
      this.dragging = false;
      // Reset isDragged after a small delay to allow for click events
      setTimeout(() => {
        this.isDragged = false;
      }, 200);
    }
  }

  calculateTotal(): number {
    return this.flattenedCartItems.reduce((total, item) => {
      return total + item.price;
    }, 0);
  }
}
