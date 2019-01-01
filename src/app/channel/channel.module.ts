import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelComponent } from './channel.component';
import { PatternModule } from '../pattern/pattern.module';

@NgModule({
  imports: [
    CommonModule,
    PatternModule
  ],
  declarations: [ChannelComponent],
  exports: [ChannelComponent]

})
export class ChannelModule { }
