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
  styleUrls: ['./movie-list.component.scss'],
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
    this.loadGenres();
  }

  loadMovies(): void {
    this.movieService.getMovies().subscribe(
      (localMovies) => {
        this.movies = localMovies;
        this.filteredMovies = [...this.movies];
        this.loadGenres();
      },
      (error) => console.error('Error loading local movies:', error)
    );
  }

  loadGenres(): void {
    this.movieService.getGenres().subscribe(
      (data: { genres: Array<{ id: number; name: string }> }) => {
        if (data && data.genres) {
          const genreMap: Map<number, string> = new Map(
            data.genres.map((g) => [g.id, g.name])
          );
          this.genre = data.genres.map((g) => g.name);
          this.assignGenresToMovies(genreMap);
        }
      },
      (error) => {
        console.error('Error loading genres:', error);
      }
    );
  }

  assignGenresToMovies(genreMap: Map<number, string>): void {
    this.movies.forEach((movie) => {
      if (movie.genre_ids) {
        movie.genre = movie.genre_ids
          .map((id: number) => genreMap.get(id))
          .filter((g: string | undefined): g is string => g !== undefined)
          .join(', ');
      }
    });
    this.filterMovies();
  }

  filterMovies(): void {
    this.filteredMovies = this.movies.filter((movie) => {
      const matchesTitle = movie.title
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());

      const matchesGenre =
        this.selectedGenre === '' || movie.genre.includes(this.selectedGenre);
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
          new Date(a.releaseDate || a.release_date).getTime() -
          new Date(b.releaseDate || b.release_date).getTime()
      );
    } else if (this.sortOption === 'rating') {
      this.filteredMovies.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
  }

  getTMDbImage(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : 'placeholder.jpg';
  }
}
