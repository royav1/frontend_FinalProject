import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  username: string = 'Guest';  // Displayed at the top

  // 🔽 Individual toggles for each section
  showSearchDetails: boolean = false;
  showTrackedDetails: boolean = false;
  showWatchlistDetails: boolean = false;
  showHistoryDetails: boolean = false;

  ngOnInit(): void {
    const token = sessionStorage.getItem('access_token');
    const storedUsername = sessionStorage.getItem('username');

    // ✅ Only show username if user is logged in
    if (token && storedUsername) {
      this.username = storedUsername;
    }
  }
}
