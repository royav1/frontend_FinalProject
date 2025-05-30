import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    const payload = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>('http://localhost:8000/login/', payload).subscribe({
      next: (response) => {
        // ✅ Save tokens and username in sessionStorage
        sessionStorage.setItem('access_token', response.access);
        sessionStorage.setItem('refresh_token', response.refresh);
        sessionStorage.setItem('username', this.username);

        // ✅ Redirect to home
        this.router.navigate(['/home']);
      },
      error: (err) => {
        alert('Login failed. Please check your credentials.');
        console.error(err);
      }
    });
  }
}
