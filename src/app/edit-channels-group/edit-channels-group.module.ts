import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditChannelsGroupComponent } from './edit-channels-group.component';
import { ChannelsGroupModule } from '../channels-group/channels-group.module';
import { ChannelInfoComponent } from './channel-info/channel-info.component';

@NgModule({
  imports: [
    CommonModule,
    ChannelsGroupModule,
  ],
  declarations: [EditChannelsGroupComponent, ChannelInfoComponent],
  exports: [EditChannelsGroupComponent]
})
export class EditChannelsGroupModule { }

