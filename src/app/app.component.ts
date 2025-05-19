import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, TranslateModule, ShoppingCartComponent],
  template: `
    <div class="container">
      <h1>{{ 'TITLE.APP' | translate }}</h1>
      <nav>
        <a routerLink="home">Home</a>
        <a routerLink="detail">Detail</a>
      </nav>
      <router-outlet></router-outlet>

      <!-- Shopping Cart Component shown globally -->
      <app-shopping-cart></app-shopping-cart>
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
    `,
  ],
})
export class AppComponent {
  constructor() {}
}
