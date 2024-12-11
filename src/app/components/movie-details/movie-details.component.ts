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
  isBrowser: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      if (!localStorage.getItem('guestId')) {
        localStorage.setItem('guestId', this.generateGuestId());
      }
    }

    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      if (this.isTMDbId(movieId)) {
        this.loadTMDbMovieDetails(movieId.replace('tmdb-', ''));
      } else {
        this.loadMovieDetails(movieId);
      }
    }
  }

  generateGuestId(): string {
    return 'guest-' + Math.random().toString(36).substr(2, 9);
  }

  isTMDbId(id: string): boolean {
    return id.startsWith('tmdb-');
  }

  loadMovieDetails(movieId: string): void {
    this.movieService.getMoviesById(movieId).subscribe(
      (response) => {
        if (response) {
          this.movie = response;
          this.averageRating = response.rating || 0;
          this.totalRatings = response.ratings?.length || 0;

          if (this.isBrowser) {
            const userId = localStorage.getItem('userId');
            const guestId = localStorage.getItem('guestId');
            const userRating = response.ratings.find(
              (rating: any) =>
                rating.userId === userId || rating.guestId === guestId
            );
            this.userRating = userRating ? userRating.rating : 0;
          }
        }
      },
      (error) => {
        console.error('Error fetching movie details:', error);
      }
    );
  }

  loadTMDbMovieDetails(tmdbId: string): void {
    this.movieService.getTMDbMovieDetails(tmdbId).subscribe(
      (response) => {
        this.movie = response;
      },
      (error) => {
        console.error('Error fetching TMDb movie details:', error);
      }
    );
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

  rateMovie(rating: number): void {
    if (this.isTMDbMovie(this.movie)) {
      alert(`Rating for TMDb movies is stored locally.`);
      // Съхранявайте рейтинга локално или изпращайте на бекенда, ако желаете
      this.userRating = rating;
      return;
    }

    const userId = localStorage.getItem('userId'); // ID на потребителя (ако е логнат)
    const guestId = localStorage.getItem('guestId'); // ID на госта

    if (!userId && !guestId) {
      alert('Error: No valid user or guest ID found.');
      return;
    }

    console.log('Sending data:', {
      movieId: this.movie._id,
      rating,
      userId: userId || null,
      guestId: guestId || null,
    });

    this.movieService
      .rateMovie(this.movie._id, rating, userId, guestId)
      .subscribe(
        (response) => {
          this.averageRating = response.averageRating;
          this.userRating = rating;
          this.totalRatings = response.totalRatings;
          alert('Your rating has been updated!');
        },
        (error) => {
          console.error('Error rating movie:', error);
        }
      );
  }
  addToFavourites(movieId: string): void {
    this.movieService.addFavourite(movieId).subscribe(
      () => alert('Movie added to favourites!'),
      (err) => console.error('Error adding to favourites', err)
    );
  }
}
