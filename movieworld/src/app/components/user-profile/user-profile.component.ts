import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { AuthService } from '../../services/auth.service';

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
    private authService: AuthService
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
      (error) => {
        console.log('Error fetching user data: ', error);
      }
    );
  }

  loadCreatedMovies(): void {
    this.movieService.getMyMovies().subscribe(
      (movies) => {
        console.log('Fetched created movies:', movies);
        this.createdMovies = movies;
      },
      (error) => {
        console.log('Error fetching created movies', error);
      }
    );
  }

  loadFavouriteMovies(): void {
    this.movieService.getFavouriteMovies().subscribe(
      (movies) => {
        this.favouriteMovies = movies;
      },
      (error) => {
        console.error('Error fetching favourite movies:', error);
      }
    );
  }

  onEdit(movieId: string): void {}

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
