import { Component, OnInit } from '@angular/core';
import { DmxModelService } from 'src/app/dmx-model.service';

@Component({
  selector: 'app-channel-info',
  templateUrl: './channel-info.component.html',
  styleUrls: ['./channel-info.component.scss']
})
export class ChannelInfoComponent implements OnInit {

  constructor(public model: DmxModelService) { }

  ngOnInit() {
  }
  addPattern() {
    this.model.selectedChannel.addPattern();
  }

  insertPattern() {
    this.model.selectedChannel.insertPattern();
  }
  deletePattern() {
    this.model.selectedChannel.deletePattern();
    this.model.selectedPattern = undefined;
  }
  getGroup() {
    return this.model.groups[this.model.groupIndex];
  }
}
