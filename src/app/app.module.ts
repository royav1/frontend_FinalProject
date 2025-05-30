import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule } from '@angular/forms';                        // ✅ For [(ngModel)] binding
import { HttpClientModule, provideHttpClient } from '@angular/common/http'; // ✅ For HttpClient + Angular 18+ support

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { WatchlistsComponent } from './pages/watchlists/watchlists.component';
import { PriceHistoryComponent } from './pages/price-history/price-history.component';
import { HomeComponent } from './pages/home/home.component';

import { SharedModule } from './shared/shared.module';
import { SearchComponent } from './pages/search/search.component';
import { TrackedProductsComponent } from './pages/tracked-products/tracked-products.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    WatchlistsComponent,
    PriceHistoryComponent,
    HomeComponent,
    SearchComponent,
    TrackedProductsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,          // ✅ Required for ngModel and form input binding
    HttpClientModule,     // ✅ Required for HttpClient-based requests
    SharedModule
  ],
  providers: [
    provideHttpClient()   // ✅ Angular 18+ provider style
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}