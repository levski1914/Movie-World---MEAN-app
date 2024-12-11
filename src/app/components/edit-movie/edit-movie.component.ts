import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-edit-movie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-movie.component.html',
  styleUrls: ['./edit-movie.component.scss'],
})
export class EditMovieComponent implements OnInit {
  editMovieForm: FormGroup;
  movieId: string = '';
  movie: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.editMovieForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      desc: ['', [Validators.required, Validators.minLength(10)]],
      genre: ['', Validators.required],
      releaseDate: ['', Validators.required],
      image: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.movieId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.movieId) {
      this.errorMessage = 'Invalid movie ID';
      return;
    }

    this.loadMovie();
  }

  loadMovie(): void {
    this.movieService.getMoviesById(this.movieId).subscribe(
      (movie) => {
        this.movie = movie;
        this.isLoading = false;

        this.editMovieForm.patchValue({
          title: movie.title,
          desc: movie.desc,
          genre: movie.genre,
          releaseDate: movie.releaseDate,
          image: movie.image,
        });
      },
      (error) => {
        this.errorMessage = 'Error loading movie details.';
        console.error(error);
        this.isLoading = false;
      }
    );
  }

  onSubmit(): void {
    if (this.editMovieForm.invalid) {
      return;
    }

    const updatedMovie = this.editMovieForm.value;

    this.movieService.updateMovie(this.movieId, updatedMovie).subscribe(
      (response) => {
        alert('Movie updated successfully!');
        this.router.navigate(['/movies']);
      },
      (error) => {
        this.errorMessage = 'Error updating movie.';
        console.error(error);
      }
    );
  }
}
