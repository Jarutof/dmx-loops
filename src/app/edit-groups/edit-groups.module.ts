import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditGroupsComponent } from './edit-groups.component';
import { GroupChannelComponent } from './group-channel/group-channel.component';
import { GroupBoxComponent } from './group-box/group-box.component';
import { GroupElementComponent } from './group-element/group-element.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [EditGroupsComponent, GroupChannelComponent, GroupBoxComponent, GroupElementComponent],
  exports: [EditGroupsComponent]
})
export class EditGroupsModule { }
