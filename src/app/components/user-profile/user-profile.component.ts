import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {
  username: string = '';
  email: string = '';
  userAvatar: string = 'https://via.placeholder.com/150';

  createdMovies: any[] = [];
  favouriteMovies: any[] = [];

  constructor(
    private movieService: MovieService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();

    this.loadCreatedMovies();

    this.loadFavouriteMovies();
  }
  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe(
      (user) => {
        this.username = user.username;
        this.email = user.email;
      },
      (err) => {
        console.log('Error fetching user data: ', err);
      }
    );
  }

  loadCreatedMovies(): void {
    this.movieService.getMyMovies().subscribe(
      (movies) => {
        console.log('Fetched created movies:', movies);
        this.createdMovies = movies;
      },
      (err) => {
        console.log('Error fetching created movies', err);
      }
    );
  }

  loadFavouriteMovies(): void {
    this.movieService.getFavouriteMovies().subscribe(
      (movies) => {
        this.favouriteMovies = movies.map((favourite) => favourite.movie);
      },
      (error) => {
        console.error('Error fetching favourite movies:', error);
      }
    );
  }

  removeFromFavourites(movieId: string): void {
    this.movieService.removeFavourite(movieId).subscribe(
      () => {
        alert('Филмът беше премахнат от любими.');
        this.loadFavouriteMovies();
      },
      (error) => {
        console.error('Error removing favourite movie:', error);
      }
    );
  }

  onEdit(movieId: string): void {
    this.router.navigate(['/edit-movie', movieId]);
  }

  onDelete(movieId: string): void {
    if (confirm('Are you sure you want to delete this movie?')) {
      this.movieService.deleteMovie(movieId).subscribe(
        () => {
          alert('Movie deleted successfully');
          this.loadCreatedMovies();
        },
        (error) => {
          console.error('Error deleting movie:', error);
        }
      );
    }
  }
}
