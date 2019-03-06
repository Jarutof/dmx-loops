import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HideableContainerComponent } from '../hideable-container/hideable-container.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [HideableContainerComponent],
  declarations: [HideableContainerComponent]
})
export class SharedModule { }
