import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PatternModule } from './pattern/pattern.module';
import { ChannelModule } from './channel/channel.module';
import { ChannelsGroupModule } from './channels-group/channels-group.module';
import { EditChannelsGroupModule } from './edit-channels-group/edit-channels-group.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChannelsGroupModule,
    FormsModule,
    EditChannelsGroupModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
