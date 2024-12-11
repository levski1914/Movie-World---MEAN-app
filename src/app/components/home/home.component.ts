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
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  trendingMovies: any[] = [];
  selectedGenre: string = 'Action'; // По подразбиране първи жанр
  movies: any[] = [];
  genres = [
    { id: '2', genre: 'Action' },
    { id: '3', genre: 'Horror' },
    { id: '4', genre: 'Romance' },
    { id: '5', genre: 'Fantasy' },
    { id: '6', genre: 'History' },
    { id: '7', genre: 'Animation' },
  ];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadTrendingMovies(); // Зарежда само горната секция с трендинг филми
    this.loadMovies(this.selectedGenre); // Зарежда филми по жанр
  }

  loadMovies(genre: string): void {
    this.selectedGenre = genre;

    this.movieService.getMoviesByGenre(genre).subscribe(
      (movies) => {
        // Проверява дали `movies` съдържа правилния жанр
        this.movies = movies.filter((movie) =>
          movie.genre?.toLowerCase().includes(genre.toLowerCase())
        );
      },
      (error) => {
        console.error('Error loading movies:', error);
      }
    );
  }

  loadTrendingMovies(): void {
    this.movieService.getTrendingMovies().subscribe(
      (data) => {
        // Само горната секция (първите два трендинг филма)
        this.trendingMovies = data.results.slice(0, 2);
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
