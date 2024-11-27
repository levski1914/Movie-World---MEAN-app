import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-create-movie',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-movie.component.html',
  styleUrl: './create-movie.component.scss',
})
export class CreateMovieComponent {
  movieForm: FormGroup;

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
    });
  }

  onSubmit(): void {
    if (this.movieForm.valid) {
      this.movieService.createMovie(this.movieForm.value).subscribe(
        () => {
          alert('movie created successfully');
          this.router.navigate(['/movie-list']);
        },
        (error) => {
          console.log('error creating movie: ', error);
        }
      );
    }
  }
}
