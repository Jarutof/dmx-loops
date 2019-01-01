import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PatternModule } from './pattern/pattern.module';
import { ChannelModule } from './channel/channel.module';
import { ChannelsGroupModule } from './channels-group/channels-group.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChannelsGroupModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
