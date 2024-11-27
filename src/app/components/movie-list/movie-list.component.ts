import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
})
export class MovieListComponent implements OnInit {
  movies: any[] = [];
  filteredMovies: any[] = [];
  genre: any[] = [];

  searchQuery: string = '';
  selectedGenre: string = '';
  sortOption: string = 'alphabetical';

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService.getMovies().subscribe(
      (data) => {
        this.movies = data;
        this.filteredMovies = [...this.movies];
        this.genre = [...new Set(this.movies.map((movie) => movie.genre))];
      },
      (error) => {
        console.error('Error loading movies:', error);
      }
    );
  }

  filterMovies(): void {
    this.filteredMovies = this.movies.filter((movie) => {
      const matchesTitle = movie.title
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());

      const matchesGenre =
        this.selectedGenre === '' || movie.genre === this.selectedGenre;
      return matchesTitle && matchesGenre;
    });

    this.sortMovies();
  }

  sortMovies(): void {
    if (this.sortOption === 'alphabetical') {
      this.filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortOption === 'releaseDate') {
      this.filteredMovies.sort(
        (a, b) =>
          new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
      );
    }
  }
}
