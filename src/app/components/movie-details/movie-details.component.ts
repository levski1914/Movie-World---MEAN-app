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
      this.loadMovieDetails(movieId);
    }
  }

  generateGuestId(): string {
    return 'guest-' + Math.random().toString(36).substr(2, 9);
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

  rateMovie(rating: number): void {
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
