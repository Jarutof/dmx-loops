import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelsGroupComponent } from './channels-group.component';
import { ChannelModule } from '../channel/channel.module';

@NgModule({
  imports: [
    CommonModule,
    ChannelModule
  ],
  declarations: [ChannelsGroupComponent],
  exports: [ChannelsGroupComponent]
})
export class ChannelsGroupModule { }
