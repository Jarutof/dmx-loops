import { Injectable } from '@angular/core';
import { ColorpickerWindowComponent } from './colorpicker-window/colorpicker-window.component';

@Injectable({
  providedIn: 'root'
})
export class ModalWindowService {
colorPicker: ColorpickerWindowComponent;
constructor() { }
  showColorPicker(e: MouseEvent, f) {
    this.colorPicker.show(e, f);
  }
}


