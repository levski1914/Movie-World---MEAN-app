import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import ColorThief from 'colorthief';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  trendingMovies: any[] = [];
  selectedGenre: string = 'Trending';
  movies: any[] = [];
  genres = [
    { id: '1', genre: 'Trending' },
    { id: '2', genre: 'Action' },
    { id: '3', genre: 'Horror' },
    { id: '4', genre: 'Romance' },
    { id: '5', genre: 'Fantasy' },
    { id: '6', genre: 'History' },
    { id: '7', genre: 'Animation' },
  ];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadTrendingMovies();
    this.loadMovies(this.selectedGenre);
  }
  loadMovies(genre: string): void {
    this.selectedGenre = genre;

    if (genre === 'Trending') {
      // Ако е избран трендинг, зареждаме трендинг филмите
      this.loadTrendingMovies();
    } else {
      // Зареждане на филми по жанр
      this.movieService.getMoviesByGenre(genre).subscribe(
        (movies) => {
          this.movies = movies;
        },
        (error) => {
          console.error('Error loading movies:', error);
        }
      );
    }
  }

  loadTrendingMovies(): void {
    this.movieService.getTrendingMovies().subscribe(
      (data) => {
        // Първите 2 трендинг филма за горната част
        this.trendingMovies = data.results.slice(0, 2);

        // Първите 6 трендинг филма за секцията "Other Movies"
        this.movies = data.results.slice(0, 5);
      },
      (err) => console.log('Error fetching trending movies: ', err)
    );
  }
  applyBoxShadow(image: HTMLImageElement, movie: any): void {
    const colorThief = new ColorThief();

    if (image.complete) {
      const dominantColor = colorThief.getColor(image);
      movie.shadow = `0px 10px 20px rgba(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 0.8)`;
    }
  }
}
