import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchTerm: string = '';
  searchDepth: number = 3;
  searchDepthOptions: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  results: any[] = [];
  error: string = '';
  loading: boolean = false;
  isLoggedIn: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token = sessionStorage.getItem('access_token');
    this.isLoggedIn = !!token;

    if (!token) {
      this.error = 'Login required to view previous search results.';
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.loading = true;
    this.error = '';

    this.http.get<any[]>(`http://127.0.0.1:8000/get-scraped-results/`, { headers }).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.results = data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load previous search results:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      this.error = '🔒 You must be logged in to perform a search.';
      return;
    }

    if (!this.searchTerm.trim()) return;
    if (this.searchDepth < 1 || this.searchDepth > 10) {
      this.error = 'Depth must be between 1 and 10.';
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.loading = true;
    this.error = '';
    this.results = [];

    const encodedQuery = encodeURIComponent(this.searchTerm);
    const url = `http://127.0.0.1:8000/search/?query=${encodedQuery}&depth=${this.searchDepth}`;

    // Step 1: Trigger the scraper
    this.http.get(url, { headers }).subscribe({
      next: () => {
        // Step 2: Fetch results
        this.http.get<any[]>(`http://127.0.0.1:8000/get-scraped-results/`, { headers }).subscribe({
          next: (data) => {
            this.results = data;
            this.loading = false;
          },
          error: (err) => {
            console.error('❌ Failed to retrieve scraped results:', err);
            this.error = 'Failed to retrieve search results.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Search trigger failed:', err);
        this.error = 'Search failed. Please try again.';
        this.loading = false;
      }
    });
  }

  trackProduct(product: any): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload = {
      product_name: product.title,
      price: product.price,
      rating: product.rating,
      reviews: product.reviews,
      availability: product.availability
    };

    this.http.post('http://127.0.0.1:8000/add-tracked-product/', payload, { headers }).subscribe({
      next: () => {
        alert('✅ Product added to tracked products.');
      },
      error: (err) => {
        console.error('❌ Failed to add product:', err);
        const message = err.error?.message;
        if (message?.includes('already being tracked')) {
          alert('⚠️ This product is already in your tracked list.');
        } else {
          alert('❌ Failed to track product.');
        }
      }
    });
  }
}
