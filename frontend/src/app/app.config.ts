import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { type ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { httpInterceptorProviders, UserSettingsService } from 'ui-shared';

import { INVENTORY_ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(INVENTORY_ROUTES),
    provideHttpClient(withInterceptorsFromDi()),
    ...httpInterceptorProviders,
    {
      provide: APP_INITIALIZER,
      useFactory: (userSettings: UserSettingsService) => () => userSettings.loadAndApplySettings(),
      deps: [UserSettingsService],
      multi: true,
    },
  ],
};

