import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { CreateMovieComponent } from './components/create-movie/create-movie.component';
import { EditMovieComponent } from './components/edit-movie/edit-movie.component';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { AuthGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';

export const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'movie/:id', component: MovieDetailsComponent },
  { path: 'movie-list', component: MovieListComponent },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [noAuthGuard],
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: 'create', component: CreateMovieComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: EditMovieComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
