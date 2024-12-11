import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
})
export class MovieDetailsComponent implements OnInit {
  movie: any = null;
  userRating: number = 0;
  averageRating: number = 0;
  totalRatings: number = 0;
  tmdbRating: number = 0;
  tmdbVotes: number = 0;
  isBrowser: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const guestId = this.getFromLocalStorage('guestId');
      if (!guestId) {
        this.setToLocalStorage('guestId', this.generateGuestId());
      }
    }

    const movieId = this.route.snapshot.paramMap.get('id');
    if (!movieId) {
      console.error('Movie ID is missing in the route.');
      return;
    }

    if (this.isTMDbId(movieId)) {
      this.loadTMDbMovieDetails(movieId.replace('tmdb-', ''));
    } else {
      this.loadMovieDetails(movieId);
    }
  }

  private getFromLocalStorage(key: string): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setToLocalStorage(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }

  generateGuestId(): string {
    return 'guest-' + Math.random().toString(36).substr(2, 9);
  }
  getTMDbImage(path: string | null): string | null {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
  }

  getGenre(movie: any): string {
    if (movie.genre) {
      return movie.genre;
    } else if (movie.genres && movie.genres.length > 0) {
      return movie.genres.map((g: any) => g.name).join(', ');
    }
    return 'Unknown';
  }

  isTMDbMovie(movie: any): boolean {
    return !!movie.id && typeof movie.id === 'number';
  }

  isTMDbId(id: string): boolean {
    return id.startsWith('tmdb-');
  }

  loadTMDbMovieDetails(tmdbId: string): void {
    this.movieService.getTMDbMovieDetails(tmdbId).subscribe(
      (response) => {
        if (!response || !response.title) {
          console.error('Invalid TMDb response');
          this.movie = {
            title: 'Unknown Title',
            desc: 'No description available',
            genre: 'Unknown',
            releaseDate: 'Unknown',
            image: 'default-image.jpg',
          };
          return;
        }

        const movieData = {
          title: response.title,
          desc: response.overview || 'No description available',
          genre:
            response.genres?.map((g: any) => g.name).join(', ') || 'Unknown',
          releaseDate: response.release_date || 'Unknown',
          image: response.poster_path
            ? `https://image.tmdb.org/t/p/w500${response.poster_path}`
            : 'default-image.jpg',
          tmdbId: tmdbId,
        };

        this.movie = movieData;
        this.tmdbRating = response.vote_average || 0;
        this.tmdbVotes = response.vote_count || 0;

        this.movieService.createMovie(movieData).subscribe(
          (createdMovie) => {
            if (createdMovie && createdMovie._id) {
              this.movie._id = createdMovie._id;
            }
          },
          (error) => {
            console.error('Error creating movie in DB:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching TMDb movie details:', error);

        this.movie = {
          title: 'Unknown Title',
          desc: 'No description available',
          genre: 'Unknown',
          releaseDate: 'Unknown',
          image: 'default-image.jpg',
        };
      }
    );
  }

  loadMovieDetails(movieId: string): void {
    this.movieService.getMoviesById(movieId).subscribe(
      (response) => {
        if (response) {
          this.movie = response;
          this.averageRating = response.rating || 0;
          this.totalRatings = response.ratings?.length || 0;

          const userId = this.getFromLocalStorage('userId');
          const guestId = this.getFromLocalStorage('guestId');
          const userRating = response.ratings.find(
            (rating: any) =>
              rating.userId === userId || rating.guestId === guestId
          );
          this.userRating = userRating ? userRating.rating : 0;
        }
      },
      (error) => {
        console.error('Error fetching movie details:', error);
      }
    );
  }
  toggleFavourite(movieId: string): void {
    if (!this.isBrowser) return;
    this.movieService.addFavourite(movieId).subscribe(
      () => alert('Movie added to favourites!'),
      (err) => {
        if (err.status === 400) {
          this.movieService.removeFavourite(movieId).subscribe(
            () => alert('Movie removed from favourites!'),
            (removeErr) =>
              console.error('Error removing from favourites', removeErr)
          );
        } else {
          console.error('Error adding to favourites', err);
        }
      }
    );
  }

  rateMovie(rating: number): void {
    if (!this.movie) {
      console.error('Movie object is undefined.');
      return;
    }

    const movieId = this.isTMDbMovie(this.movie)
      ? `tmdb-${this.movie.id}`
      : this.movie._id;

    if (!movieId) {
      console.error('Cannot rate movie: movie ID is undefined.');
      return;
    }

    const userId = this.getFromLocalStorage('userId');
    const guestId = this.getFromLocalStorage('guestId');

    this.movieService.rateMovie(movieId, rating, userId, guestId).subscribe(
      (response) => {
        this.averageRating = response.averageRating;
        this.totalRatings = response.totalRatings;
        this.userRating = rating;
        console.log('Rating updated successfully.');
      },
      (error) => {
        console.error('Error updating rating:', error);
      }
    );
  }
}
