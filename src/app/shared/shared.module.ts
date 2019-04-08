import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HideableContainerComponent } from '../hideable-container/hideable-container.component';
import { CurveParameterComponent } from '../curve-parameter/curve-parameter.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [HideableContainerComponent, CurveParameterComponent],
  declarations: [HideableContainerComponent, CurveParameterComponent]
})
export class SharedModule { }
