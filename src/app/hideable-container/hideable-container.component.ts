import { Component, OnInit, Directive, Input } from '@angular/core';



@Component({
  selector: 'app-hideable-container',
  templateUrl: './hideable-container.component.html',
  styleUrls: ['./hideable-container.component.scss']
})

export class HideableContainerComponent implements OnInit {

  @Input() headerName: string;
  public isHide: boolean = true;
  constructor() { }

  ngOnInit() {
  }
}
