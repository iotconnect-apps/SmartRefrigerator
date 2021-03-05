import * as moment from 'moment-timezone'
import { Component, OnInit, ViewChild } from '@angular/core';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { StompRService } from '@stomp/ng2-stompjs';
import { NotificationService, AlertsService, LocationService, Notification, RefrigeratorService, DeviceService } from '../../../services';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material';
import { AppConstant } from '../../../app.constants';
import { Location } from '@angular/common';

@Component({
  selector: 'app-location-details',
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.css']
})
export class LocationDetailsComponent implements OnInit {

  isFilterShow: boolean = false;
  locations = [
    { value: 'orlando', viewValue: 'Orlando' },
    { value: 'florida', viewValue: 'Florida' },
  ];
  slideConfig = {
    'slidesToShow': 3,
    'slidesToScroll': 1,
    'arrows': true,
    // 'margin': 15,
    'centerMode': false,
    'infinite': true
  };
  @ViewChild('refrigeratorCarousel', { static: true }) refrigeratorCarousel: SlickCarouselComponent;
  columnChart: any;
  isOpenFilterGraph: boolean = false;
  locationGuid: any;
  locationObj: any = {};
  overview: any;
  alerts = [];
  devices = [];
  locationList = [];
  locationValue: any;
  bgColor = '#fff';
  chartHeight = 300;
  chartWidth = '100%';
  datadevice: any = [];
  columnArray: any = [];
  headFormate: any = {
    columns: this.columnArray,
    type: 'NumberFormat'
  };
  chart = {
    'energyConsumption': {
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
    },

  };
  type: any;

  constructor(
    //private stompService: StompRService,
    private activatedRoute: ActivatedRoute,
    private deviceService: DeviceService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public _appConstant: AppConstant,
    private _notificationService: NotificationService,
    public location: Location,
    private alertsService: AlertsService,
    private _service: LocationService,
    private refrigeratorService: RefrigeratorService,

  ) {
    this.activatedRoute.params.subscribe(params => {
      if (params.locationGuid) {
        this.locationGuid = params.locationGuid
      }

    })
  }

  public currentUser: any;

  ngOnInit() {
    this.locationObj = { guid: '' };
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let type = 'd';
    this.type = type
    this.getLocationLookup(currentUser.userDetail.companyId)
    this.getLocationDetails(this.locationGuid);
    this.getLocationOverview(this.locationGuid);
    this.getentitydevices(this.locationGuid);
    this.getAlertList(this.locationGuid);
    this.getEnergyGraph(this.locationGuid, type)
  }

  /**
   * Get history data
   * @param key
   * @param data
   * @param hAxisTitle
   * @param vAxisTitle
   */
  createHistoryChart(key, data, hAxisTitle, vAxisTitle) {
    let chartType = 'ColumnChart';
    if (key === 'generatorUsage') {
      chartType = 'PieChart';
    }
    let height = this.chartHeight;
    this.chart[key] = {
      chartType: chartType,
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
    this.spinner.hide();
  }

  /**
   * Get chart data
   * */
  chartData() {
    this.columnChart = {
      chartType: "ColumnChart",
      dataTable: [
        ['', ''],
        ['Sun', 77],
        ['Mon', 34],
        ['Tue', 15],
        ['Wed', 34],
        ['Thu', 65],
        ['Fri', 10],
        ['Sat', 5]
      ],
      options: {
        title: "",
        vAxis: {
          title: "KW",
          titleTextStyle: {
            bold: true
          },
          viewWindow: {
            min: 0
          }
        },
        hAxis: {
          titleTextStyle: {
            bold: true
          },
        },
        legend: false,
        height: "350",
        chartArea: { height: '75%', width: '85%' },
        seriesType: 'bars',
        bar: { groupWidth: "25%" },
        colors: ['#5496d0'],
      }
    };
  }

  /**
  * Show hide filter
  */
  public showHideFilter() {
    this.isFilterShow = !this.isFilterShow;
  }

  /**
   * Get location detail by locationGuid
   * @param locationGuid
   */
  getLocationDetails(locationGuid) {
    this.locationObj = {};
    this.spinner.show();
    this._service.getLocatinDetails(locationGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.locationObj = response.data;
        this.locationObj.guid = this.locationObj.guid.toUpperCase()
       
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
   * Get location overview by locationGuid
   * @param locationGuid
   */
  getLocationOverview(locationGuid) {
    this.overview = null;
    this.spinner.show();
    this._service.getentitydetail(locationGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.overview = response.data;
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
   * 
   * @param event
   */
  changeGraphFilter(event) {
    let type = 'd';
    if (event.value === 'Week') {
      type = 'w';
    } else if (event.value === 'Month') {
      type = 'm';
    }
    else if (event.value === 'Day') {
      type = 'd';
    }
    this.type = type
    this.getEnergyGraph(this.locationGuid, type);

  }

  /**
   * Get energy graph data
   * @param entityId
   * @param type
   */
  getEnergyGraph(entityId, type) {
    this.spinner.show();
    var data = { entityguid: entityId, frequency: type }
    this.refrigeratorService.getEnergyGraph(data).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        let data = [];
        if (response.data.length) {
          data.push(['Months', 'Consumption'])

          response.data.forEach(element => {
            data.push([element.name, parseFloat(element.energyConsumption)])
          });
        }
        this.columnChart = {
          chartType: "ColumnChart",
          dataTable: data,
          options: {
            title: "",
            vAxis: {
              title: "KW",
              titleTextStyle: {
                bold: true
              },
              viewWindow: {
                min: 0
              }
            },
            hAxis: {
              titleTextStyle: {
                bold: true
              },
            },
            legend: 'none',
            height: "350",
            chartArea: { height: '75%', width: '85%' },
            seriesType: 'bars',
            bar: { groupWidth: "25%" },
            colors: ['#5496d0'],
          }
        };
      }
      else {
        this.columnChart.dataTable = [];
        this._notificationService.add(new Notification('error', response.message));

      }
    }, error => {
      this.columnChart.dataTable = [];
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * Get entity device by locationGuid
   * @param locationGuid
   */
  getentitydevices(locationGuid) {
    this.devices = [];
    this.spinner.show();
    this._service.getentitydevices(locationGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.devices = response.data;
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
   * Get alert list by locationGuid
   * @param locationGuid
   */
  getAlertList(locationGuid) {
    this.alerts = [];
    let parameters = {
      pageNo: 0,
      pageSize: 10,
      searchText: '',
      orderBy: 'eventDate desc',
      deviceGuid: '',
      entityGuid: locationGuid,
    };
    this.spinner.show();
    this.alertsService.getAlerts(parameters).subscribe(response => {
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

  /**
   * Get local date
   * @param lDate
   */
  getLocalDate(lDate) {
    var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
    // Get the local version of that date
    var localDate = moment(utcDate).local();
    let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
    return res;

  }

  /**
  * Get Location Lookup by companyId
  * @param companyId
  */
  getLocationLookup(companyId) {
    this.refrigeratorService.getLocationlookup(companyId).
      subscribe(response => {
        if (response.isSuccess === true) {

          this.locationList = response.data;
          this.locationList = this.locationList.filter(word => word.isActive == true);

        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
   * Set location value
   * @param locationValue
   */
  SetLocation(locationValue) {
    this.locationValue = locationValue;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getLocationLookup(currentUser.userDetail.companyId);
    this.getEnergyGraph(this.locationValue, this.type)
    this.getLocationDetails(this.locationValue);
    this.getLocationOverview(this.locationValue);
    this.getentitydevices(this.locationValue);
    this.getAlertList(this.locationValue);
  }
}
