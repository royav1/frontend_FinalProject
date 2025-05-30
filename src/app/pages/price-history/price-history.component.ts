import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-price-history',
  templateUrl: './price-history.component.html',
  styleUrls: ['./price-history.component.css']
})
export class PriceHistoryComponent implements OnInit {
  productsWithHistory: any[] = [];
  selectedProductId: string | null = null;

  productTitle: string = '';
  targetPrice: number | null = null;
  priceHistory: any[] = [];
  error: string = '';

  selectedRangeDays: number = 30;
  dateOptions = [
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 90 Days', value: 90 },
    { label: 'Last 6 months', value: 180 },
    { label: 'Last year', value: 365 }
  ];

  saleEvents: string[] = [];
  selectedEvent: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProductsWithHistory();
    this.fetchSaleEvents();
  }

  fetchProductsWithHistory(): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>('http://127.0.0.1:8000/products-with-history/', { headers }).subscribe({
      next: (data) => {
        this.productsWithHistory = data.map(p => ({
          ...p,
          id: p.id !== null ? p.id.toString() : `snapshot:${p.title}`
        }));
      },
      error: (err) => {
        console.error('❌ Failed to fetch products with history:', err);
        this.error = 'Failed to load products.';
      }
    });
  }

  fetchSaleEvents(): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<string[]>('http://127.0.0.1:8000/sale-events/', { headers }).subscribe({
      next: (events) => {
        this.saleEvents = events.map(e => e.trim());
      },
      error: (err) => {
        console.error('❌ Failed to fetch sale events:', err);
      }
    });
  }

  fetchPriceHistory(): void {
    if (!this.selectedProductId) return;

    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params: string[] = [`days=${this.selectedRangeDays}`];

    if (this.selectedEvent && this.selectedEvent.trim() !== '') {
      params.push(`event=${encodeURIComponent(this.selectedEvent.trim())}`);
    }

    const isSnapshot = this.selectedProductId.startsWith('snapshot:');
    let url = '';

    if (isSnapshot) {
      const title = this.selectedProductId.replace('snapshot:', '').trim();
      const encodedTitle = encodeURIComponent(title);
      url = `http://127.0.0.1:8000/price-history/snapshot/${encodedTitle}/?${params.join('&')}`;
    } else {
      url = `http://127.0.0.1:8000/price-history/${this.selectedProductId}/?${params.join('&')}`;
    }

    this.http.get<any>(url, { headers }).subscribe({
      next: (data) => {
        this.productTitle = data.product_title;
        this.targetPrice = data.target_price;
        this.priceHistory = data.price_history;
        this.error = '';
      },
      error: (err) => {
        console.error('❌ Failed to fetch price history:', err);
        this.error = 'Failed to load price history.';
        this.productTitle = '';
        this.priceHistory = [];
        this.targetPrice = null;
      }
    });
  }

  onRangeChange(): void {
    this.fetchPriceHistory();
  }

  onEventChange(): void {
    this.fetchPriceHistory();
  }
}
