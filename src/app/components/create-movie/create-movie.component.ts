import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-create-movie',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-movie.component.html',
  styleUrls: ['./create-movie.component.scss'],
})
export class CreateMovieComponent {
  movieForm: FormGroup;
  suggestions$: Observable<any[]> = new Observable();
  genresMap: { [key: number]: string } = {};
  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private router: Router
  ) {
    this.movieForm = this.fb.group({
      title: ['', [Validators.required]],
      desc: ['', [Validators.required]],
      genre: ['', [Validators.required]],
      image: ['', [Validators.required]],
      releaseDate: ['', [Validators.required]],
      tmdbId: [''],
    });

    this.suggestions$ = this.movieForm.get('title')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => this.movieService.searchMoviesFromTMDb(query))
    );
  }
  ngOnInit(): void {
    this.movieService.getAllGenres().subscribe(
      (response) => {
        if (response.genres) {
          this.genresMap = response.genres.reduce((map: any, genre: any) => {
            map[genre.id] = genre.name;
            return map;
          }, {});
        }
      },
      (error) => {
        console.error('Error fetching genres:', error);
      }
    );
  }
  selectMovie(movie: any): void {
    const genres = movie.genre_ids
      ? movie.genre_ids
          .map((id: number) => this.genresMap[id] || 'Unknown')
          .join(', ')
      : 'Unknown';

    this.movieForm.patchValue({
      title: movie.title,
      desc: movie.overview,
      genre: genres,
      image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      releaseDate: movie.release_date,
      tmdbId: movie.id,
    });
  }
  onSubmit(): void {
    if (this.movieForm.valid) {
      this.movieService.createMovie(this.movieForm.value).subscribe(
        () => {
          alert('Movie created successfully');
          this.router.navigate(['/movie-list']);
        },
        (error) => {
          console.error('Error creating movie:', error);
        }
      );
    }
  }
}
