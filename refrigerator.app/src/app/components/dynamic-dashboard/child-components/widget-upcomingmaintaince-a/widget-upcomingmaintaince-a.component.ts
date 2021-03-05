import { ChangeDetectorRef, ViewRef , OnInit, Component, Input, ViewEncapsulation, EventEmitter } from '@angular/core';
import * as moment from 'moment-timezone'
import { NgxSpinnerService } from 'ngx-spinner'
import { DashboardService } from 'app/services/dashboard/dashboard.service';
import { Notification, NotificationService, AlertsService, DeviceService } from 'app/services';
import {Subscription} from 'rxjs/Subscription';

@Component({
	selector: 'app-widget-upcomingmaintaince-a',
	templateUrl: './widget-upcomingmaintaince-a.component.html',
	styleUrls: ['./widget-upcomingmaintaince-a.component.css']
})
export class WidgetupcomingmaintainceAComponent implements OnInit {
	@Input() widget;
	@Input() resizeEvent: EventEmitter<any>;
	@Input() alertLimitchangeEvent: EventEmitter<any>;
	resizeSub: Subscription;
	limitChangeSub: Subscription;
	alerts: any = [];
	upcomingMaintenance: any = [];
	constructor(
		public dashboardService: DashboardService,
		private spinner: NgxSpinnerService,
		private _notificationService: NotificationService,
		private changeDetector : ChangeDetectorRef,
		public _service: AlertsService,
		private deviceService: DeviceService
	){

	}

	ngOnInit() {
		this.resizeSub = this.resizeEvent.subscribe((widget) => {
		});
		this.limitChangeSub = this.alertLimitchangeEvent.subscribe((limit) => {
			this.getDeviceMaintenance();
		});
		this.getDeviceMaintenance();
	}

	getDeviceMaintenance() {
		let currentdatetime = moment().format('YYYY-MM-DD[T]HH:mm:ss');
		let timezone = moment().utcOffset();
		//this.spinner.show();
		this.deviceService.getdevicemaintenance(currentdatetime,timezone).subscribe(response => {
		  //this.spinner.hide();
		  if (response.isSuccess === true) {
			if (response.data) {
			  this.upcomingMaintenance = response.data;
			}
		  }
		  else {
			this.upcomingMaintenance = [];
			this._notificationService.add(new Notification('error', response.message));
		  }
		}, error => {
		  this.spinner.hide();
		  this.upcomingMaintenance = [];
		  this._notificationService.add(new Notification('error', error));
		});
	  }

	getLocalDate(lDate) {
		var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
		// Get the local version of that date
		var localDate = moment(utcDate).local();
		let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
		return res;
	}

	ngOnDestroy() {
		this.resizeSub.unsubscribe();
		this.limitChangeSub.unsubscribe();
	}
}
