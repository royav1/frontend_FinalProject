import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-tracked-products',
  templateUrl: './tracked-products.component.html',
  styleUrls: ['./tracked-products.component.css']
})
export class TrackedProductsComponent implements OnInit {
  username: string | null = null;
  watchlists: any[] = [];
  trackedProducts: any[] = [];
  selectedWatchlistId: number | null = null;
  selectedProductMap: Map<number, any[]> = new Map();
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.username = sessionStorage.getItem('username');
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      this.error = 'You must be logged in to view your tracked products.';
      return;
    }
    this.fetchTrackedProducts(token);
    this.fetchWatchlistsAndProducts(token);
  }

  fetchWatchlistsAndProducts(token: string): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>('http://127.0.0.1:8000/get-user-watchlists/', { headers }).subscribe({
      next: (watchlists) => {
        if (watchlists.length === 0) {
          this.watchlists = [];
          this.selectedWatchlistId = null; // ✅ Force fallback to all products
          return;
        }

        const watchlistsTemp: any[] = [];
        let loadedCount = 0;

        for (const wl of watchlists) {
          this.http.get<any[]>(`http://127.0.0.1:8000/watchlist-products/${wl.id}/`, { headers }).subscribe({
            next: (products) => {
              this.selectedProductMap.set(wl.id, products);
              watchlistsTemp.push({ ...wl });
              loadedCount++;
              if (loadedCount === watchlists.length) {
                this.watchlists = watchlistsTemp.sort((a, b) => a.id - b.id);
                this.selectedWatchlistId = this.watchlists[0]?.id ?? null;
              }
            },
            error: (err) => {
              console.error(`❌ Failed to load products for watchlist ${wl.id}:`, err);
            }
          });
        }
      },
      error: (err) => {
        console.error('❌ Failed to load watchlists:', err);
        this.error = 'Failed to load watchlists.';
      }
    });
  }

  fetchTrackedProducts(token: string): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>('http://127.0.0.1:8000/get-tracked-products/', { headers }).subscribe({
      next: (data) => {
        this.trackedProducts = data;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load tracked products.';
      }
    });
  }

  deleteTrackedProduct(productId: number): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `http://127.0.0.1:8000/tracked-product/${productId}/`;

    const deleted = this.trackedProducts.find(p => p.id === productId);

    this.http.delete(url, { headers }).subscribe({
      next: () => {
        this.trackedProducts = this.trackedProducts.filter(p => p.id !== productId);

        this.selectedProductMap.forEach((products, wlId) => {
          const updated = products.filter(p => p.id !== productId);
          this.selectedProductMap.set(wlId, updated);
        });

        if (deleted && deleted.title) {
          this.trackedProducts.push({
            id: `snapshot:${deleted.title}`,
            title: deleted.title,
            price: null,
            rating: null,
            reviews: null,
            availability: null,
            target_price: null
          });
        }

        alert('🗑️ Product deleted.');
      },
      error: (err) => {
        console.error('❌ Failed to delete product:', err);
        alert('❌ Failed to delete tracked product.');
      }
    });
  }

  getSelectedProducts(): any[] {
    // ✅ If no watchlist selected or none exist, show all tracked products
    return this.selectedWatchlistId !== null
      ? this.selectedProductMap.get(this.selectedWatchlistId) || []
      : this.trackedProducts;
  }

  getSelectedWatchlistName(): string {
    const selected = this.watchlists.find(w => w.id === this.selectedWatchlistId);
    return selected ? selected.name : '';
  }

  addProductToWatchlist(productId: number): void {
    if (this.selectedWatchlistId === null) return;

    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload = {
      watchlist_id: this.selectedWatchlistId,
      product_ids: [productId]
    };

    this.http.post('http://127.0.0.1:8000/add-products-to-watchlist/', payload, { headers }).subscribe({
      next: () => {
        const product = this.trackedProducts.find(p => p.id === productId);
        if (!product) return;

        const current = this.selectedProductMap.get(this.selectedWatchlistId!) || [];
        if (!current.some(p => p.id === productId)) {
          current.push(product);
          this.selectedProductMap.set(this.selectedWatchlistId!, current);
        }
      },
      error: (err) => {
        console.error('❌ Failed to add product:', err);
      }
    });
  }

  removeProductFromWatchlist(productId: number): void {
    if (this.selectedWatchlistId === null) return;

    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `http://127.0.0.1:8000/remove-product-from-watchlist/${this.selectedWatchlistId}/${productId}/`;

    this.http.delete(url, { headers }).subscribe({
      next: () => {
        const current = this.selectedProductMap.get(this.selectedWatchlistId!) || [];
        const updated = current.filter(p => p.id !== productId);
        this.selectedProductMap.set(this.selectedWatchlistId!, updated);
      },
      error: (err) => {
        console.error('❌ Failed to remove product:', err);
      }
    });
  }

  setTargetPrice(product: any): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const enteredPrice = product.target_price;
    const currentPrice = product.price;

    if (enteredPrice == null || isNaN(enteredPrice)) {
      alert('⚠️ Please enter a valid target price.');
      return;
    }

    if (currentPrice != null && enteredPrice >= currentPrice) {
      alert(`⚠️ Target price must be lower than current price ($${currentPrice}).`);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload = {
      product_id: product.id,
      target_price: enteredPrice
    };

    this.http.put('http://127.0.0.1:8000/set-target-price/', payload, { headers }).subscribe({
      next: (res: any) => {
        alert(`🎯 Target price set to $${res.target_price} for "${res.product_title}"`);
      },
      error: (err) => {
        console.error('❌ Failed to set target price:', err);
        alert('❌ Failed to update target price.');
      }
    });
  }
}
