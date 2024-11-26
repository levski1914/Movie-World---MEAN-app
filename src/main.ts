import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
bootstrapApplication(AppComponent, {
  providers: [provideRouter(appRoutes), importProvidersFrom(HttpClientModule)],
}).catch((err) => console.error(err));
