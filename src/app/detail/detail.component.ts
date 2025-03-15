import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="container">
      <h2>{{ 'PAGES.DETAIL.TITLE' | translate }}</h2>
      <div class="content">
        <p>{{ 'PAGES.DETAIL.DESCRIPTION' | translate }}</p>
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
export class DetailComponent {
  constructor() {}
}
