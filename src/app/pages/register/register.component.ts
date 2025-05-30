import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  success = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  registerUser(): void {
    const data = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.http.post('http://127.0.0.1:8000/register/', data).subscribe({
      next: (res) => {
        this.success = '✅ Registration successful. Redirecting to login...';
        this.error = '';
        this.username = '';
        this.email = '';
        this.password = '';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.success = '';
        this.error = '❌ Registration failed: ' + (err.error?.error || 'Unknown error');
      }
    });
  }
}
