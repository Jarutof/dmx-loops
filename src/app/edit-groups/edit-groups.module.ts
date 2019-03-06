import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditGroupsComponent } from './edit-groups.component';
import { GroupChannelComponent } from './group-channel/group-channel.component';
import { GroupBoxComponent } from './group-box/group-box.component';
import { GroupElementComponent } from './group-element/group-element.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [EditGroupsComponent, GroupChannelComponent, GroupBoxComponent, GroupElementComponent],
  exports: [EditGroupsComponent]
})
export class EditGroupsModule { }
