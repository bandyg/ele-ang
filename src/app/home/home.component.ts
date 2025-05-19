import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  template: `
    <div class="container">
      <h2>{{ 'PAGES.HOME.TITLE' | translate }}</h2>
      <div class="content">
        <p>{{ 'PAGES.HOME.DESCRIPTION' | translate }}</p>

        <div class="product-grid">
          <div *ngFor="let product of products" class="product-card">
            <h3>{{ product.name }}</h3>
            <p class="price">{{ product.price | currency }}</p>
            <button (click)="addToCart(product)">Add to Cart</button>
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

      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }

      .product-card {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        flex-direction: column;

        h3 {
          margin-top: 0;
        }

        .price {
          color: #666;
          font-weight: bold;
        }

        button {
          margin-top: auto;
          padding: 8px 16px;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;

          &:hover {
            background-color: #357abd;
          }
        }
      }
    `,
  ],
})
export class HomeComponent {
  products: any[] = [
    {
      id: '1',
      name: 'Laptop',
      price: 999.99,
      quantity: 1,
    },
    {
      id: '2',
      name: 'Smartphone',
      price: 499.99,
      quantity: 1,
    },
    {
      id: '3',
      name: 'Headphones',
      price: 129.99,
      quantity: 1,
    },
    {
      id: '4',
      name: 'Smartwatch',
      price: 249.99,
      quantity: 1,
    },
  ];

  constructor(private cartService: CartService) {}

  addToCart(product: any): void {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    };

    this.cartService.addToCart(cartItem);
  }
}
