import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  template: `
    <div class="container">
      <h1>{{ 'TITLE.APP' | translate }}</h1>
      <nav>
        <a routerLink="home">Home</a>
        <a routerLink="detail">Detail</a>
      </nav>
      <router-outlet></router-outlet>
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
