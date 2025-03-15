import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="container">
      <h2>{{ 'PAGES.HOME.TITLE' | translate }}</h2>
      <div class="content">
        <p>{{ 'PAGES.HOME.DESCRIPTION' | translate }}</p>
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
    `,
  ],
})
export class HomeComponent {
  constructor() {}
}
