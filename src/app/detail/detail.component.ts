import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.model';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  template: `
    <div class="container">
      <h2>{{ 'PAGES.DETAIL.TITLE' | translate }}</h2>
      <div class="content">
        <p>{{ 'PAGES.DETAIL.DESCRIPTION' | translate }}</p>

        <div class="product-details">
          <h3>Featured Product</h3>
          <div class="product-info">
            <h4>{{ product.name }}</h4>
            <p class="price">{{ product.price | currency }}</p>
            <p class="description">
              Premium quality product with amazing features
            </p>
            <div class="quantity-selector">
              <label>Quantity:</label>
              <div class="controls">
                <button (click)="decreaseQuantity()">-</button>
                <span>{{ quantity }}</span>
                <button (click)="increaseQuantity()">+</button>
              </div>
            </div>
            <button class="add-btn" (click)="addToCart()">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
        .content {
          margin-top: 20px;
        }
      }

      .product-details {
        margin-top: 20px;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 20px;
      }

      .product-info {
        margin-top: 16px;

        h4 {
          margin-top: 0;
          font-size: 24px;
        }

        .price {
          color: #666;
          font-weight: bold;
          font-size: 20px;
        }

        .description {
          margin: 16px 0;
          line-height: 1.5;
        }
      }

      .quantity-selector {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        label {
          margin-right: 12px;
        }

        .controls {
          display: flex;
          align-items: center;

          button {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f1f1f1;
            border: none;
            font-size: 16px;
            cursor: pointer;
          }

          span {
            width: 40px;
            text-align: center;
            font-size: 16px;
          }
        }
      }

      .add-btn {
        padding: 12px 24px;
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;

        &:hover {
          background-color: #357abd;
        }
      }
    `,
  ],
})
export class DetailComponent {
  product = {
    id: '5',
    name: 'Premium Wireless Speaker',
    price: 199.99,
  };

  quantity = 1;

  constructor(private cartService: CartService) {}

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    const cartItem: CartItem = {
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      quantity: this.quantity,
    };

    this.cartService.addToCart(cartItem);
    // Reset quantity after adding to cart
    this.quantity = 1;
  }
}
