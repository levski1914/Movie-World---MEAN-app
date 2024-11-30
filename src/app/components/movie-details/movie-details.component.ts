import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { error } from 'console';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
})
export class MovieDetailsComponent implements OnInit {
  movie: any = null;
  userRating: number = 0;
  averageRating: number = 0;
  totalRatings: number = 0;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    this.loadMovieDetails(movieId!);
  }

  loadMovieDetails(movieId: string): void {
    this.movieService.getMoviesById(movieId).subscribe(
      (data) => {
        this.movie = data;
      },
      (err) => console.log('Error fetching movie details', err)
    );
  }

  addToFavourites(movieId: string): void {
    this.movieService.addFavourite(movieId).subscribe(
      () => {
        alert('movie added to favourite');
      },
      (err) => console.log('errr adding to favourite', err)
    );
  }

  rateMovie(rating: number): void {
    if (rating < 1 || rating > 5) {
      alert('rate must be between 1 and 5');
      return;
    }

    this.movieService.rateMovie(this.movie._id, rating).subscribe(
      (response) => {
        this.averageRating = response.rating;
        this.totalRatings++;
        this.userRating = rating;
      },
      (err) => console.log('Error rating movie', err)
    );
  }
}
