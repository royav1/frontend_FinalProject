//test file for the guard

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true when access token exists', () => {
    localStorage.setItem('access_token', 'mock_token');
    expect(guard.canActivate()).toBeTrue();
    localStorage.removeItem('access_token');
  });

  it('should return false and redirect when no token', () => {
    localStorage.removeItem('access_token');
    const router = TestBed.inject(Router);
    expect(guard.canActivate()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
