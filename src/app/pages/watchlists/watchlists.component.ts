import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-watchlists',
  templateUrl: './watchlists.component.html',
  styleUrls: ['./watchlists.component.css']
})
export class WatchlistsComponent implements OnInit {
  watchlists: any[] = [];
  newWatchlistName: string = '';
  error: string = '';
  scrapingEnabled: boolean | null = null;

  renameStates: { [watchlistId: number]: boolean } = {};
  newNames: { [watchlistId: number]: string } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchWatchlists();
    this.fetchScrapingSetting();
  }

  fetchWatchlists(): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>('http://127.0.0.1:8000/get-user-watchlists/', { headers }).subscribe({
      next: (data) => {
        this.watchlists = data;
        for (const wl of data) {
          this.renameStates[wl.id] = false;
          this.newNames[wl.id] = wl.name;
        }
      },
      error: (err) => {
        console.error('❌ Failed to fetch watchlists:', err);
        this.error = 'Failed to fetch watchlists.';
      }
    });
  }

  fetchScrapingSetting(): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<{ scheduled_scraping_enabled: boolean }>('http://127.0.0.1:8000/check-scraping-setting/', { headers }).subscribe({
      next: (res) => {
        this.scrapingEnabled = res.scheduled_scraping_enabled;
      },
      error: (err) => {
        console.error('❌ Failed to get scraping setting:', err);
      }
    });
  }

  toggleScrapingSetting(): void {
    const token = sessionStorage.getItem('access_token');
    if (!token || this.scrapingEnabled === null) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post<{ scheduled_scraping_enabled: boolean }>('http://127.0.0.1:8000/toggle-scraping-setting/', {}, { headers }).subscribe({
      next: (res) => {
        this.scrapingEnabled = res.scheduled_scraping_enabled;
        alert(`🔁 Scraping ${this.scrapingEnabled ? 'enabled' : 'disabled'} globally.`);
      },
      error: (err) => {
        console.error('❌ Failed to toggle scraping setting:', err);
        alert('Failed to update global scraping setting.');
      }
    });
  }

  createWatchlist(): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    if (!this.newWatchlistName.trim()) {
      alert('Please enter a watchlist name.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload = { name: this.newWatchlistName };

    this.http.post('http://127.0.0.1:8000/create-watchlist/', payload, { headers }).subscribe({
      next: () => {
        this.newWatchlistName = '';
        this.fetchWatchlists();
      },
      error: (err) => {
        console.error('❌ Failed to create watchlist:', err);
        alert('Failed to create watchlist.');
      }
    });
  }

  renameWatchlist(watchlistId: number): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const newName = this.newNames[watchlistId]?.trim();
    if (!newName) {
      alert('Please enter a new name.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload = { name: newName };

    this.http.put(`http://127.0.0.1:8000/change-watchlist-name/${watchlistId}/`, payload, { headers }).subscribe({
      next: () => {
        alert('✅ Watchlist renamed successfully.');
        this.renameStates[watchlistId] = false;
        this.fetchWatchlists();
      },
      error: (err) => {
        console.error('❌ Failed to rename watchlist:', err);
        alert('Failed to rename watchlist.');
      }
    });
  }

  deleteWatchlist(watchlistId: number): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const watchlist = this.watchlists.find(w => w.id === watchlistId);
    const productCount = watchlist?.products?.length || 0;
    const confirmMessage = productCount
      ? `This watchlist contains ${productCount} product(s). Are you sure you want to delete it?`
      : 'Are you sure you want to delete this watchlist?';

    if (!confirm(confirmMessage)) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.delete(`http://127.0.0.1:8000/delete-watchlist/${watchlistId}/`, { headers }).subscribe({
      next: () => {
        alert('🗑️ Watchlist deleted.');
        this.fetchWatchlists();
      },
      error: (err) => {
        console.error('❌ Failed to delete watchlist:', err);
        alert('Failed to delete watchlist.');
      }
    });
  }

  scrapeProduct(productId: number): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post<any>(`http://127.0.0.1:8000/scrape/${productId}/`, {}, { headers }).subscribe({
      next: (res) => {
        console.log('✅ Scraping success:', res);
        alert('Scraping completed for selected product.');

        const result = res.results?.[0];
        if (result?.alert_sent) {
          const msg = `📬 Mock email sent from ${result.from_email} to ${result.to_email} for "${result.title}" — Target price reached!`;
          this.showFloatingNotification(msg);
        }
      },
      error: (err) => {
        console.error('❌ Scraping error:', err);
        alert('Scraping failed. Check console.');
      }
    });
  }

  showFloatingNotification(message: string): void {
    const notification = document.createElement('div');
    notification.innerText = message;

    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#4caf50',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      zIndex: '1000',
      fontSize: '16px',
      opacity: '1',
      transition: 'opacity 0.5s ease'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 10000);
  }
}
