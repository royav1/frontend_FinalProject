// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import components
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { TrackedProductsComponent } from './pages/tracked-products/tracked-products.component';
import { WatchlistsComponent } from './pages/watchlists/watchlists.component';
import { PriceHistoryComponent } from './pages/price-history/price-history.component';

// Import auth guard
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },  // ✅ Redirect to homepage
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },          // ✅ Clickable from navbar
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: SearchComponent },
  { path: 'tracked-products', component: TrackedProductsComponent },
  { path: 'watchlists', component: WatchlistsComponent, canActivate: [AuthGuard] },
  { path: 'price-history', component: PriceHistoryComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/home' }                    // Wildcard to homepage
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
