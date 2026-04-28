import {
    BootstrapContext,
    bootstrapApplication,
} from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, appConfig, context);

export default bootstrap;