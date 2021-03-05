import { ChangeDetectorRef, ViewRef , OnInit, Component, Input, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner'
import { DashboardService } from 'app/services/dashboard/dashboard.service';
import { Notification, NotificationService } from 'app/services';
import { Subscription } from 'rxjs/Subscription';
import { AgmMap} from '@agm/core';
import { DeleteDialogComponent } from '../../../../components/common/delete-dialog/delete-dialog.component';
import { AppConstant, DeleteAlertDataModel } from "../../../../app.constants";
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
@Component({
	selector: 'app-widget-map-a',
	templateUrl: './widget-map-a.component.html',
	styleUrls: ['./widget-map-a.component.css']
})
export class WidgetMapAComponent implements OnInit, OnDestroy {
	deleteAlertDataModel: DeleteAlertDataModel;
	locationList: any = [];
	searchParameters = {
		pageNumber: 0,
		pageNo: 0,
		pageSize: 10,
		searchText: '',
		sortBy: 'uniqueId asc'
	  };
	  mapview = true;
	lat = 23.033863;
	lng = 72.585022;
	@Input() widget;
	@Input() count;
	@Input() resizeEvent: EventEmitter<any>;
	@Input() zoomChangeEvent: EventEmitter<any>;
	resizeSub: Subscription;
	zoomSub: Subscription;

	@ViewChild(AgmMap,{static:false}) myMap : any;
	mapHeight = '1000px';
	greenhouse = [];
	mediaUrl: string;
	constructor(
		public _appConstant: AppConstant,
		public dialog: MatDialog,
		public dashboardService: DashboardService,
		private spinner: NgxSpinnerService,
		private _notificationService: NotificationService,
		private changeDetector: ChangeDetectorRef,
		) {
		this.mediaUrl = this._notificationService.apiBaseUrl;
	}

	ngOnInit() {
		this.mapHeight = (this.widget.properties.h > 0 ? parseInt((this.widget.properties.h - 55).toString())+'px' : this.mapHeight);
		this.widget.widgetProperty.zoom = (this.widget.widgetProperty.zoom && this.widget.widgetProperty.zoom > 0 ? parseInt(this.widget.widgetProperty.zoom) : 10);
		this.resizeSub = this.resizeEvent.subscribe((widget) => {
			if(widget.id == this.widget.id){
				this.widget = widget;
				this.resizeMap();
			}
		});
		this.zoomSub = this.zoomChangeEvent.subscribe((widget) => {
			if(widget && widget.id == this.widget.id){
				this.widget = widget; 
				this.resizeMap();
			}
		});
		this.resizeMap();
		this.getLocationList()
	}
	 /**
	*For Handle search textbox call
  **/
 searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNumber = 0;
    this.getLocationList();
    //this.isSearch = true;
  }
	/**
	*For Open Delete Location Confirmation model
  **/
 deleteModel(id: any) {
    this.deleteAlertDataModel = {
      title: "Delete Location",
      message: this._appConstant.msgConfirm.replace('modulename', "Location"),
      okButtonName: "Yes",
      cancelButtonName: "No",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletefacility(id);
      }
    });
  }
/**
	*For Delete Facility
  **/
 deletefacility(guid) {
    this.spinner.show();
    this.dashboardService.deleteFacility(guid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.handleResponse({message:this._appConstant.msgDeleted.replace("modulename", "Location")}, "success");
        this.getLocationList();

      }
      else {
        this._notificationService.handleResponse(response, "error");
      }

    }, error => {
      this.spinner.hide();
      this._notificationService.handleResponse(error, "error");
    });
  }
  getLocationList() {
    this.locationList = [];
    this.spinner.show();
    this.dashboardService.getLocationlist(this.searchParameters).subscribe((response:any) => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.locationList = response.data.items
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

	resizeMap(){
		this.mapHeight = (this.widget.properties.h > 0 ? parseInt((this.widget.properties.h - 55).toString())+'px' : this.mapHeight);
		if(this.myMap){
			this.myMap.triggerResize();
		}
	}

	ngOnDestroy() {
		this.resizeSub.unsubscribe();
		this.zoomSub.unsubscribe();
	}
}
