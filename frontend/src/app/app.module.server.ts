import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { App } from './app';
import { AppModule } from './app-module';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
  ],
  bootstrap: [App],
})
export class AppServerModule {}
