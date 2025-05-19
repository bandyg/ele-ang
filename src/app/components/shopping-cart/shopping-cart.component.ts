import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="cart-container"
      [class.expanded]="isExpanded"
      [style.top.px]="position.y"
      [style.left.px]="position.x"
      #cartContainer
    >
      <!-- Cart header and drag handle -->
      <div class="cart-header" (mousedown)="startDrag($event)">
        <div class="cart-icon" (click)="handleCartIconClick($event)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
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
          <span *ngIf="cartCount > 0" class="badge">{{ cartCount }}</span>
        </div>
      </div>

      <!-- Cart content -->
      <div class="cart-content" *ngIf="isExpanded">
        <h3>Shopping Cart</h3>

        <div *ngIf="flattenedCartItems.length === 0" class="empty-cart">
          Your cart is empty
        </div>

        <div *ngIf="flattenedCartItems.length > 0" class="cart-items-container">
          <!-- Scrollable item list -->
          <div class="cart-items-list">
            <div
              *ngFor="let item of flattenedCartItems; let i = index"
              class="cart-item"
            >
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p class="price">{{ item.price | currency }}</p>
              </div>
              <button class="remove-btn" (click)="removeItemAtIndex(i)">
                ×
              </button>
            </div>
          </div>

          <!-- Fixed footer with total and checkout -->
          <div class="cart-footer">
            <div class="cart-total">
              <span>Total:</span>
              <span>{{ calculateTotal() | currency }}</span>
            </div>

            <button class="checkout-btn" (click)="showPaymentMethods()">
              Checkout
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
              *ngFor="let method of paymentMethods"
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
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: width 0.3s, height 0.3s;
        cursor: move;
        width: 60px;
        height: 60px;
        overflow: hidden;
      }

      .cart-container.expanded {
        width: 320px;
        height: auto;
        max-height: calc(
          50vh + 60px
        ); /* 50% of viewport height plus header height */
        display: flex;
        flex-direction: column;
        cursor: default;
      }

      .cart-header {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #4a90e2;
        color: white;
        cursor: move;
        flex-shrink: 0;
      }

      .cart-icon {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        cursor: pointer;
      }

      .badge {
        position: absolute;
        top: 2px;
        right: 2px;
        background-color: #ff4757;
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
        max-height: calc(
          50vh - 140px
        ); /* 50% of viewport height minus space for header, title, and footer */
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
        color: #ff4757;
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
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .checkout-btn:hover {
        background-color: #357abd;
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
        background-color: #4a90e2;
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
    `,
  ],
})
export class ShoppingCartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  flattenedCartItems: CartItem[] = [];
  cartCount: number = 0;
  isExpanded: boolean = false;

  // Payment modal properties
  showPaymentModal: boolean = false;
  selectedPaymentMethod: string | null = null;
  paymentMethods = [
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
  ];

  position = {
    x: 20,
    y: 20,
  };

  private dragging = false;
  private dragOffset = { x: 0, y: 0 };
  private subscriptions: Subscription[] = [];
  private isDragged = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.cartService.getCartItems().subscribe((items) => {
        this.cartItems = items;
        this.flattenCartItems();
      }),

      this.cartService.getCartCount().subscribe((count) => {
        this.cartCount = count;
      })
    );

    // Add mouse move and up listeners for dragging
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    // Remove event listeners
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
    window.removeEventListener('mouseup', this.onMouseUp.bind(this));
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
    const method = this.paymentMethods.find((m) => m.id === methodId);
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
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;

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
