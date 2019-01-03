import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternComponent } from './pattern.component';

@NgModule({
  declarations: [PatternComponent],
  imports: [
    CommonModule,
  ],
  exports: [PatternComponent]
})

export class PatternModule { } 
