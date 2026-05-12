import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { httpInterceptorProviders } from 'ui-shared';

import { INVENTORY_ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(INVENTORY_ROUTES),
    provideHttpClient(withInterceptorsFromDi()),
    ...httpInterceptorProviders,
  ],
};
