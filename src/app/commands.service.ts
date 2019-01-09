import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommandsService {
  public index: number = 0;
  private maxIndex: number = 0;
  public commandsUndo: Array<() => void> = [];
  private commandsRendo: Array<() => void> = [];

setCommands(u: () => void, r: () => void) {
  this.commandsUndo[this.index] = u;
  this.commandsRendo[this.index] = r;
  this.index++;
  this.maxIndex = this.index;
  this.commandsUndo.splice(this.maxIndex, this.commandsUndo.length - this.maxIndex);
  this.commandsRendo.splice(this.maxIndex, this.commandsRendo.length - this.maxIndex);
  r();
}

executeUndo() {
  if (this.index > 0) {
    this.index--;
    this.commandsUndo[this.index]();
  }
}
executeRendo() {
  if (this.index < this.maxIndex) {
    this.commandsRendo[this.index]();
    this.index++;
  }

}

constructor() { }

}
