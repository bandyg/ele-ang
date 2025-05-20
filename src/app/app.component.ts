import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { CartConfig } from './models/cart-config.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, TranslateModule, FormsModule, ShoppingCartComponent],
  template: `
    <div class="container">
      <h1>{{ 'TITLE.APP' | translate }}</h1>
      <nav>
        <a routerLink="home">Home</a>
        <a routerLink="detail">Detail</a>
      </nav>

      <div class="config-options">
        <h2>购物车设置</h2>
        <div class="config-row">
          <label>位置预设:</label>
          <select [(ngModel)]="cartConfig.position" (change)="updateConfig()">
            <option value="custom">自定义</option>
            <option value="top-left">左上角</option>
            <option value="top-right">右上角</option>
            <option value="bottom-left">左下角</option>
            <option value="bottom-right">右下角</option>
          </select>
        </div>

        <div class="config-row">
          <label>固定位置:</label>
          <input
            type="checkbox"
            [(ngModel)]="cartConfig.fixed"
            (change)="updateConfig()"
          />
        </div>

        <div class="config-row">
          <label>展开方向:</label>
          <select
            [(ngModel)]="cartConfig.expandDirection"
            (change)="updateConfig()"
          >
            <option value="down">向下</option>
            <option value="up">向上</option>
            <option value="left">向左</option>
            <option value="right">向右</option>
          </select>
        </div>

        <div class="config-row">
          <label>主色调:</label>
          <input
            type="color"
            [(ngModel)]="cartConfig.primaryColor"
            (change)="updateConfig()"
          />
        </div>

        <div class="config-row">
          <label>次色调:</label>
          <input
            type="color"
            [(ngModel)]="cartConfig.secondaryColor"
            (change)="updateConfig()"
          />
        </div>

        <div class="config-row">
          <label>徽章颜色:</label>
          <input
            type="color"
            [(ngModel)]="cartConfig.badgeColor"
            (change)="updateConfig()"
          />
        </div>

        <div class="config-row">
          <label>点击外部折叠:</label>
          <input
            type="checkbox"
            [(ngModel)]="cartConfig.autoCollapse"
            (change)="updateConfig()"
          />
        </div>

        <div class="config-row">
          <label>显示结账按钮:</label>
          <input
            type="checkbox"
            [(ngModel)]="cartConfig.showCheckoutButton"
            (change)="updateConfig()"
          />
        </div>

        <div class="config-row">
          <label>边框圆角:</label>
          <input
            type="range"
            min="0"
            max="20"
            [(ngModel)]="cartConfig.borderRadius"
            (change)="updateConfig()"
          />
          <span>{{ cartConfig.borderRadius }}px</span>
        </div>

        <div class="config-row">
          <label>折叠时大小:</label>
          <input
            type="number"
            min="30"
            max="100"
            [(ngModel)]="cartConfig.collapsedSize.width"
            (change)="updateConfig()"
          />
          <span>x</span>
          <input
            type="number"
            min="30"
            max="100"
            [(ngModel)]="cartConfig.collapsedSize.height"
            (change)="updateConfig()"
          />
        </div>

        <div class="config-row">
          <label>展开时宽度:</label>
          <input
            type="number"
            min="200"
            max="500"
            [(ngModel)]="cartConfig.expandedSize.width"
            (change)="updateConfig()"
          />
        </div>

        <button (click)="resetConfig()">重置配置</button>
      </div>

      <router-outlet></router-outlet>

      <!-- 购物车组件 -->
      <app-shopping-cart [config]="currentConfig"></app-shopping-cart>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
      }
      nav {
        margin: 20px 0;
        a {
          margin-right: 15px;
          text-decoration: none;
          &:hover {
            text-decoration: underline;
          }
        }
      }

      .config-options {
        background-color: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }

      .config-row {
        margin-bottom: 10px;
        display: flex;
        align-items: center;

        label {
          width: 120px;
          font-weight: bold;
        }

        select,
        input[type='number'],
        input[type='color'] {
          padding: 5px;
          margin-right: 10px;
        }

        input[type='range'] {
          width: 150px;
          margin-right: 10px;
        }
      }

      button {
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
    `,
  ],
})
export class AppComponent {
  // 默认配置
  cartConfig: CartConfig = {
    position: 'bottom-right',
    fixed: false,
    expandDirection: 'up',
    primaryColor: '#4a90e2',
    secondaryColor: '#ffffff',
    badgeColor: '#ff4757',
    iconColor: '#ffffff',
    borderRadius: 8,
    collapsedSize: { width: 60, height: 60 },
    expandedSize: { width: 320, maxHeight: 'calc(50vh + 60px)' },
    autoCollapse: false,
    emptyCartText: '购物车是空的',
    checkoutButtonText: '结算',
    totalText: '总计:',
    showCheckoutButton: true,
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

  // 当前应用的配置
  currentConfig: CartConfig = { ...this.cartConfig };

  // 更新配置
  updateConfig(): void {
    this.currentConfig = { ...this.cartConfig };
  }

  // 重置配置
  resetConfig(): void {
    this.cartConfig = {
      position: 'bottom-right',
      fixed: false,
      expandDirection: 'up',
      primaryColor: '#4a90e2',
      secondaryColor: '#ffffff',
      badgeColor: '#ff4757',
      iconColor: '#ffffff',
      borderRadius: 8,
      collapsedSize: { width: 60, height: 60 },
      expandedSize: { width: 320, maxHeight: 'calc(50vh + 60px)' },
      autoCollapse: false,
      emptyCartText: '购物车是空的',
      checkoutButtonText: '结算',
      totalText: '总计:',
      showCheckoutButton: true,
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
    this.updateConfig();
  }
}
