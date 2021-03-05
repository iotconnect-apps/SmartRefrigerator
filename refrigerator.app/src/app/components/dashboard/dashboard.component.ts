import * as moment from 'moment-timezone'
import { NgxSpinnerService } from 'ngx-spinner'
import { Router } from '@angular/router'
import { AppConstant, DeleteAlertDataModel } from "../../app.constants";
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { DeleteDialogComponent } from '../../components/common/delete-dialog/delete-dialog.component';
import { locationObj } from './dashboard-model';
import { DashboardService, Notification, NotificationService, DeviceService, AlertsService } from '../../services';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
/*Dynamic Dashboard Code*/
import {Component, OnInit,ChangeDetectorRef , EventEmitter, ViewChild} from '@angular/core';
import { DynamicDashboardService } from 'app/services/dynamic-dashboard/dynamic-dashboard.service';
import {DisplayGrid, CompactType, GridsterConfig, GridsterItem, GridsterItemComponent, GridsterPush, GridType, GridsterComponentInterface, GridsterItemComponentInterface} from 'angular-gridster2';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
/*Dynamic Dashboard Code*/

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit {
   /*Dynamic Dashboard Code*/
	@ViewChild('gridster',{static:false}) gridster;
	isDynamicDashboard : boolean = true;
	options: GridsterConfig;
	dashboardWidgets: Array<any> = [];
	dashboardList = [];
	dashboardData = {
   		id : '',
   		index : 0,
   		dashboardName : '',
   		isDefault : false,
   		widgets : []
   	};
   	resizeEvent: EventEmitter<any> = new EventEmitter<any>();
   	alertLimitchangeEvent: EventEmitter<any> = new EventEmitter<any>();
	chartTypeChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	zoomChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	telemetryDeviceChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	telemetryAttributeChangeEvent: EventEmitter<any> = new EventEmitter<any>();
	sideBarSubscription : Subscription;
	deviceData: any = [];
	/*Dynamic Dashboard Code*/
  locationobj = new locationObj();
  lat = 32.897480;
  lng = -97.040443;
  mediaUrl = "";
  //lat = '';
  //lng = '';
  locationList: any = [];
  currentUser: any;
  isShowLeftMenu = true;
  isSearch = false;
  mapview = true;
  totalAlerts: any;
  totalFacilities: any;
  totalZones: any;
  totalIndoorZones: any;
  totalOutdoorZones: any;
  overview: any;
  upcomingMaintenance: any = [];
  deleteAlertDataModel: DeleteAlertDataModel;
  searchParameters = {
    pageNumber: 0,
    pageNo: 0,
    pageSize: 10,
    searchText: '',
    sortBy: 'uniqueId asc'
  };
  ChartHead = ['Date/Time'];
  chartData = [];
  datadevice: any = [];
  columnArray: any = [];
  headFormate: any = {
    columns: this.columnArray,
    type: 'NumberFormat'
  };
  bgColor = '#fff';
  chartHeight = 320;
  chartWidth = '100%';
  chart = {
    'generaytorBatteryStatus': {
      chartType: 'ColumnChart',
      dataTable: [],
      options: {
        height: this.chartHeight,
        width: this.chartWidth,
        interpolateNulls: true,
        backgroundColor: this.bgColor,
        hAxis: {
          title: 'Date/Time',
          gridlines: {
            count: 5
          },
        },
        vAxis: {
          title: 'Values',
          gridlines: {
            count: 1
          },
        }
      },
      formatters: this.headFormate
    }
  };

  slideConfig = {
    'slidesToShow': 3,
    'slidesToScroll': 1,
    'arrows': true,
    'margin': '30px',
    'centerMode': false,
    'infinite': true
  };
  @ViewChild('homeCarousel', { static: true }) homeCarousel: SlickCarouselComponent;

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private dashboardService: DashboardService,
    private _notificationService: NotificationService,
    public _appConstant: AppConstant,
    public dialog: MatDialog,
    private deviceService: DeviceService,
    public _service: AlertsService,
    public dynamicDashboardService: DynamicDashboardService

  ) {
    /*Dynamic Dashboard Code*/
		this.sideBarSubscription = this.dynamicDashboardService.isToggleSidebarObs.subscribe((toggle) => {
			console.log("Sidebar clicked");
			if(this.isDynamicDashboard && this.dashboardList.length > 0){
				/*this.spinner.show();
				this.changedOptions();
		    	let cond = false;
		    	Observable.interval(700)
				.takeWhile(() => !cond)
				.subscribe(i => {
					console.log("Grid Responsive");
					cond = true;
					this.checkResponsiveness();
					this.spinner.hide();
				});*/
			}
	    })
		/*Dynamic Dashboard Code*/
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.mediaUrl = this._notificationService.apiBaseUrl;
  }

  ngOnInit() {
    this.getDashbourdCount(this.currentUser.userDetail.companyId);
    this.getDeviceList();
     	/*Dynamic Dashboard Code*/
		this.options = {
			gridType: GridType.Fixed,
			displayGrid: DisplayGrid.Always,
			initCallback: this.gridInit.bind(this),
			itemResizeCallback: this.itemResize.bind(this),
			fixedColWidth: 20,
			fixedRowHeight: 20,
			keepFixedHeightInMobile: false,
			keepFixedWidthInMobile: false,
			mobileBreakpoint: 640,
			pushItems: false,
			draggable: {
				enabled: false
			},
			resizable: {
				enabled: false
			},
			enableEmptyCellClick: false,
			enableEmptyCellContextMenu: false,
			enableEmptyCellDrop: false,
			enableEmptyCellDrag: false,
			enableOccupiedCellDrop: false,
			emptyCellDragMaxCols: 50,
			emptyCellDragMaxRows: 50,

			minCols: 60,
			maxCols: 192,
			minRows: 62,
			maxRows: 375,
			setGridSize: true,
			swap: true,
			swapWhileDragging: false,
			compactType: CompactType.None,
			margin : 0,
			outerMargin : true,
			outerMarginTop : null,
			outerMarginRight : null,
			outerMarginBottom : null,
			outerMarginLeft : null,
		};
		/*Dynamic Dashboard Code*/
  }
/*Dynamic Dashboard Code*/
getDashboards(){
  this.spinner.show();
  this.dashboardList = [];
  let isAnyDefault = false;
  let systemDefaultIndex = 0;
  this.dynamicDashboardService.getUserWidget().subscribe(response => {
    this.isDynamicDashboard = false;
    for (var i = 0; i <= (response.data.length - 1); i++) {
      response.data[i].id = response.data[i].guid;
      response.data[i].widgets = JSON.parse(response.data[i].widgets);
      this.dashboardList.push(response.data[i]);
      if(response.data[i].isDefault === true){
        isAnyDefault = true;
        this.dashboardData.index = i;
        this.isDynamicDashboard = true;
      }
      if(response.data[i].isSystemDefault === true){
        systemDefaultIndex = i;
      }
    }
    /*Display Default Dashboard if no data*/
    if(!isAnyDefault){
      this.dashboardData.index = systemDefaultIndex;
      this.isDynamicDashboard = true;
      this.dashboardList[systemDefaultIndex].isDefault = true;
    }
    /*Display Default Dashboard if no data*/
    this.spinner.hide();
    if(this.isDynamicDashboard){
      this.editDashboard('view','n');
    }
    else{
      this.getLocationList();
      this.getAlertList();
      this.getDeviceMaintenance();
    }
  }, error => {
    this.spinner.hide();
    /*Load Old Dashboard*/
    this.isDynamicDashboard = false;
    this.getLocationList();
    this.getAlertList();
    this.getDeviceMaintenance();
    /*Load Old Dashboard*/
    this._notificationService.handleResponse(error,"error");
  });
}

editDashboard(type : string = 'view',is_cancel_btn : string = 'n'){
  this.spinner.show();
  this.dashboardWidgets = [];

  this.dashboardData.id = '';
  this.dashboardData.dashboardName = '';
  this.dashboardData.isDefault = false;
  for (var i = 0; i <= (this.dashboardList[this.dashboardData.index].widgets.length - 1); i++) {
    this.dashboardWidgets.push(this.dashboardList[this.dashboardData.index].widgets[i]);
  }

  if (this.options.api && this.options.api.optionsChanged) {
    this.options.api.optionsChanged();
  }
  this.spinner.hide();
}

gridInit(grid: GridsterComponentInterface) {
  if (this.options.api && this.options.api.optionsChanged) {
    this.options.api.optionsChanged();
  }
  /*let cond = false;
    Observable.interval(500)
  .takeWhile(() => !cond)
  .subscribe(i => {
    cond = true;
    this.checkResponsiveness();
  });*/
}

checkResponsiveness(){
  if(this.gridster){
    let tempWidth = 20;
    if(this.gridster.curWidth >= 640 && this.gridster.curWidth <= 1200){
      /*tempWidth = Math.floor((this.gridster.curWidth / 60));
      this.options.fixedColWidth = tempWidth;*/
    }
    else{
      this.options.fixedColWidth = tempWidth;
    }
    for (var i = 0; i <= (this.dashboardWidgets.length - 1); i++) {
      if(this.gridster.curWidth < 640){
        for (var g = 0; g <= (this.gridster.grid.length - 1); g++) {
          if(this.gridster.grid[g].item.id == this.dashboardWidgets[i].id){
            this.dashboardWidgets[i].properties.w = this.gridster.grid[g].el.clientWidth;
          }
        }
      }
      else{
        this.dashboardWidgets[i].properties.w = (tempWidth * this.dashboardWidgets[i].cols);
      }
      this.resizeEvent.emit(this.dashboardWidgets[i]);
    }
    this.changedOptions();
  }
}

changedOptions() {
  if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
}

itemResize(item: any, itemComponent: GridsterItemComponentInterface) {
  this.resizeEvent.emit(item);
}

deviceSizeChange(size){
  this.checkResponsiveness();
}

getDeviceList(){
  this.spinner.show();
  this.deviceData = [];
  this.deviceService.getdevices().subscribe(response => {
    if (response.isSuccess === true){
      this.deviceData = response.data;
    }
    else
      this._notificationService.handleResponse(response,"error");
    this.getDashboards();
  }, error => {
    this.spinner.hide();
    this._notificationService.handleResponse(error,"error");
  });
}
/*Dynamic Dashboard Code*/
  getAlertList() {
    let parameters = {
      pageNo: 0,
      pageSize: 8,
      searchText: '',
      orderBy: 'eventDate desc',
      deviceGuid: '',
      entityGuid: '',
    };
    this.spinner.show();
    this._service.getAlerts(parameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        if (response.data.count) {
          this.alerts = response.data.items;
        }

      }
      else {
        this.alerts = [];
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.alerts = [];

      this._notificationService.add(new Notification('error', error));
    });
  }

  createHistoryChart(key, data, hAxisTitle, vAxisTitle) {
    let height = this.chartHeight;
    this.chart[key] = {
      chartType: 'ColumnChart',
      dataTable: data,
      options: {
        height: height,
        width: this.chartWidth,
        interpolateNulls: true,
        backgroundColor: this.bgColor,
        hAxis: {
          title: hAxisTitle,
          gridlines: {
            count: 5
          },
        },
        vAxis: {
          title: vAxisTitle,
          gridlines: {
            count: 1
          },
        }
      },
      formatters: this.headFormate
    };
  }

  clickAdd() {
    this.router.navigate(['location/add']);
  }

  clickDetail(id) {
    this.router.navigate(['locations/details/', id]);
  }

  convertToFloat(value) {
    return parseFloat(value)
  }

	/**
	 * Get count of variables for Dashboard
	 * */
  getDashbourdCount(companyId) {
    this.spinner.show();
    this.dashboardService.getDashboardoverview(companyId).subscribe(response => {
      if (response.isSuccess === true) {
        this.overview = response.data;
        // console.log(this.overview)
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

	/**
	 * Get Alerts for Dashboard
	 * */
  public alerts: any = [];


  search(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNo = 0;
    this.getLocationList();
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

  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNumber = 0;
    this.getLocationList();
    this.isSearch = true;
  }

  getLocalDate(lDate) {
    var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
    // Get the local version of that date
    var localDate = moment(utcDate).local();
    let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
    return res;

  }
   getTimeZone() {
    return /\((.*)\)/.exec(new Date().toString())[1];
  }

  getDeviceMaintenance() {
    let currentdatetime = moment().format('YYYY-MM-DD[T]HH:mm:ss');
    let timezone = moment().utcOffset();
    this.spinner.show();
    this.deviceService.getdevicemaintenance(currentdatetime,timezone).subscribe(response => {
      this.spinner.hide();
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

}
