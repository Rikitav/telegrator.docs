import {Routes} from '@angular/router';
import {DocsComponent} from './docs.component';

export const routes: Routes = [
  { path: '', redirectTo: 'docs/introduction', pathMatch: 'full' },
  { path: 'docs/:id', component: DocsComponent },
  { path: '**', redirectTo: 'docs/introduction' }
];

