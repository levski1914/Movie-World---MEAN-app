import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SnowfallComponent } from './snowfall/snowfall.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, SnowfallComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLoggedIn = false;
  username: string | null = null;

  toggleStyle: boolean = false;
  constructor(private authService: AuthService, private router: Router) {
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });

    this.authService.username$.subscribe((username) => {
      this.username = username;
    });
  }

  ngOnInit(): void {
    this.authService.initializeAuthState();
    this.isLoggedIn = this.authService.isLoggedIn();
    this.username = this.authService.getUsername();
  }
  onToggle() {
    this.toggleStyle = !this.toggleStyle;
  }

  logOut() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
