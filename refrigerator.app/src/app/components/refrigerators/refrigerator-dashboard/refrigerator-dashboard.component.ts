import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment-timezone'
import * as FileSaver from 'file-saver';
import { StompRService } from '@stomp/ng2-stompjs'
import { Message } from '@stomp/stompjs'
import { Subscription } from 'rxjs'
import { Observable, forkJoin } from 'rxjs';
import * as _ from 'lodash'
import { Location } from '@angular/common';
import 'chartjs-plugin-streaming';
import { DashboardService, DeviceService, NotificationService, RefrigeratorService, Notification} from '../../../services';
import { AppConstant } from '../../../app.constants';

@Component({
  selector: 'app-refrigerator-dashboard',
  templateUrl: './refrigerator-dashboard.component.html',
  styleUrls: ['./refrigerator-dashboard.component.css'],
  providers: [StompRService]
})
export class RefrigeratorDashboardComponent implements OnInit {
  chartColors: any = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',
    cerise: 'rgb(255,0,255)',
    popati: 'rgb(0,255,0)',
    dark: 'rgb(5, 86, 98)',
    solid: 'rgb(98, 86, 98)',
    tenwik: 'rgb(13, 108, 179)',
    redmek: 'rgb(143, 25, 85)',
    yerows: 'rgb(249, 43, 120)',
    redies: 'rgb(225, 208, 62)',
    orangeies: 'rgb(225, 5, 187)',
    yellowies: 'rgb(74, 210, 80)',
    greenies: 'rgb(74, 210, 165)',
    blueies: 'rgb(128, 96, 7)',
    purpleies: 'rgb(8, 170, 196)',
    greyies: 'rgb(122, 35, 196)',
    ceriseies: 'rgb(243, 35, 196)',
    popatiies: 'rgb(243, 35, 35)',
    darkies: 'rgb(87, 17, 35)',
    solidies: 'rgb(87, 71, 35)',

  };
  datasets: any[] = [
    {
      label: 'Dataset 1 (linear interpolation)',
      backgroundColor: 'rgb(153, 102, 255)',
      borderColor: 'rgb(153, 102, 255)',
      fill: false,
      lineTension: 0,
      borderDash: [8, 4],
      data: []
    }
  ];
  optionsdata: any = {
    type: 'line',
    scales: {

      xAxes: [{
        type: 'realtime',
        time: {
          stepSize: 10
        },
        realtime: {
          duration: 90000,
          refresh: 1000,
          delay: 2000,
          //onRefresh: '',

          // delay: 2000

        }

      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'value'
        }
      }]

    },
    tooltips: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }

  };
  WidgetData = {};
  smallWidgetData: any[] = [
    {
      smallWidgetValue: '25',
      smallWidgetTitle: 'Temperature'
    },
    {
      smallWidgetValue: '4.9',
      smallWidgetTitle: 'Humidity'
    },
    {
      smallWidgetValue: '20',
      smallWidgetTitle: 'Energy Consumption'
    },
    {
      smallWidgetValue: '30',
      smallWidgetTitle: 'CO2'
    },
    {
      smallWidgetValue: '2.0',
      smallWidgetTitle: 'Door'
    },
    {
      smallWidgetValue: '200',
      smallWidgetTitle: 'Vibration Level'
    },

  ];
  slideConfig = {
    // 'margin': 15,
    'centerMode': false,
    'infinite': true,
    'dots': false,
  };
  objdetailref: any = {}
  sensdata: any = [];
  maintenanceList = [];
  mediaFiles: any = [];
  imagesFiles: any = [];
  alerts = [];
  isFilterShow: boolean = false;
  refrigeratorNames = [
    { value: 'refrigerator_1', viewValue: 'Refrigerator 1' },
    { value: 'refrigerator_2', viewValue: 'Refrigerator 2' },
  ];
  isOpenFilterGraph: boolean = false;
  columnChart: any;
  columnChartattribute: any;
  options: any;
  refrigeratorGuid: any;
  labelname: any;
  type: any;
  mediaUrl: any = ''
  deviceIsConnected = false;
  isConnected = false;
  subscription: Subscription;
  messages: Observable<Message>;
  cpId = '';
  subscribed;
  stompConfiguration = {
    url: '',
    headers: {
      login: '',
      passcode: '',
      host: ''
    },
    heartbeat_in: 0,
    heartbeat_out: 2000,
    reconnect_delay: 5000,
    debug: true
  }
  uniqueId: any;
  maintenanceSchescheduled: any;
  imgUrl: string;
  isChartLoaded = false;
  constructor(private _service: RefrigeratorService,
    private stompService: StompRService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private router: Router,
    public _appConstant: AppConstant,
    private _notificationService: NotificationService,
    public dashboardService: DashboardService,
    private deviceService: DeviceService,
    public location: Location
  ) {
    this.activatedRoute.params.subscribe(params => {
      if (params.refrigeratorGuid) {
        this.getrefrigeratorDetails(params.refrigeratorGuid);
        this.gettelemetryDetails(params.refrigeratorGuid);
        this.refrigeratorGuid = params.refrigeratorGuid;
        this.getAlertList(params.refrigeratorGuid);
        this.getMaintenanceList(params.refrigeratorGuid);
        this.getUpcomingMaintenancedate(params.refrigeratorGuid);
      }
    });
  }

  ngOnInit() {
    this.imgUrl = this._notificationService.apiBaseUrl;
    let type = 'd';
    this.getEnergyGraph(this.refrigeratorGuid, type);
    this.getsensorTelemetryData()
    this.getStompConfig();

  }

  getsensorTelemetryData() {
    this.spinner.show();
    this.dashboardService.getsensorTelemetryData().subscribe(response => {
      if (response.isSuccess === true) {
        this.spinner.hide();
        let temp = [];
        response.data.forEach((element, i) => {
          var colorNames = Object.keys(this.chartColors);
          var colorName = colorNames[i % colorNames.length];
          var newColor = this.chartColors[colorName];
          var graphLabel = {
            label: element.text,
            backgroundColor: 'rgb(153, 102, 255)',
            borderColor: newColor,
            fill: false,
            cubicInterpolationMode: 'monotone',
            data: []
          }
          temp.push(graphLabel);
        });
        this.datasets = temp;
      } else {
        if (response.message) {

          this._notificationService.add(new Notification('error', response.message));
        }
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  devicestatus() {
    this.dashboardService.connectionstatus(this.uniqueId).subscribe(response => {
      if (response.isSuccess === true && response.data != '') {
        this.deviceIsConnected = response.data.isConnected
      }
    })
  }

  getStompConfig() {

    this.deviceService.getStompConfig('LiveData').subscribe(response => {
      if (response.isSuccess) {
        this.stompConfiguration.url = response.data.url;
        this.stompConfiguration.headers.login = response.data.user;
        this.stompConfiguration.headers.passcode = response.data.password;
        this.stompConfiguration.headers.host = response.data.vhost;
        this.cpId = response.data.cpId;
        this.initStomp();
      }
    });
  }

  initStomp() {
    let config = this.stompConfiguration;
    this.stompService.config = config;
    this.stompService.initAndConnect();
    this.stompSubscribe();
  }

  public stompSubscribe() {
    if (this.subscribed) {
      return;
    }

    this.messages = this.stompService.subscribe('/topic/' + this.cpId + '-' + this.uniqueId);
    this.subscription = this.messages.subscribe(this.on_next);
    this.subscribed = true;
  }

  public on_next = (message: Message) => {
    let obj: any = JSON.parse(message.body);
    for (let key in obj.data.data.reporting) {
      obj.data.data.reporting[key] = (obj.data.data.reporting[key].replace(',', ''));
    }
    let reporting_data = obj.data.data.reporting
    this.isConnected = true;

    let dates = obj.data.data.time;
    let now = moment();
    if (obj.data.data.status == undefined && obj.data.msgType == 'telemetry' && obj.data.msgType != 'device' && obj.data.msgType != 'simulator') {
      this.deviceIsConnected = true;
      this.optionsdata = {
        type: 'line',
        scales: {

          xAxes: [{
            type: 'realtime',
            time: {
              stepSize: 5
            },
            realtime: {
              duration: 90000,
              refresh: 6000,
              delay: 2000,
              onRefresh: function (chart: any) {
                if (chart.height) {
                  if (obj.data.data.status != 'on') {
                    chart.data.datasets.forEach(function (dataset: any) {

                      dataset.data.push({

                        x: now,

                        y: reporting_data[dataset.label]

                      });

                    });
                  }
                } else {

                }

              },

              // delay: 2000

            }

          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'value'
            }
          }]

        },
        tooltips: {
          mode: 'nearest',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: false
        }

      }
    } else if (obj.data.msgType === 'simulator' || obj.data.msgType === 'device') {
      if (obj.data.data.status === 'off') {
      this.optionsdata = {
    type: 'line',
    scales: {

      xAxes: [{
        type: 'realtime',
        time: {
          stepSize: 10
        },
        realtime: {
          duration: 90000,
          refresh: 1000,
          delay: 2000,
          //onRefresh: '',

          // delay: 2000

        }

      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'value'
        }
      }]

    },
    tooltips: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }

  };
        this.deviceIsConnected = false;
      } else {
        this.deviceIsConnected = true;
      }
    }
    obj.data.data.time = now;

  }

  /**
   * downloadPdf
   * @param pdfUrls
   * @param pdfNames
   * @param documentExt
   */
  downloadPdf(pdfUrls: string, pdfNames: string, documentExt: string) {
    const pdfUrl = this._notificationService.apiBaseUrl + pdfUrls;
    const pdfName = pdfNames;

    if (documentExt && documentExt !== 'undefined') {
      FileSaver.saveAs(pdfUrl, pdfName + '.' + documentExt);
    }
    else {
      FileSaver.saveAs(pdfUrl, pdfName);
    }
  }

  /**
   * Get upcoming maintenence by refrigeratorGuid
   * @param refrigeratorGuid
   */

    getTimeZone() {
    return /\((.*)\)/.exec(new Date().toString())[1];
  }
  getUpcomingMaintenancedate(refrigeratorGuid) {
	let currentdatetime = moment().format('YYYY-MM-DD[T]HH:mm:ss');
    let timezone = moment().utcOffset();
    this.dashboardService.getUpcomingMaintenancedate(refrigeratorGuid,currentdatetime,timezone).subscribe(response => {
      if (response.isSuccess === true) {
        let msVal = (response.data['day']) ? response.data['day'] : 0;
        msVal += ' d ';
        msVal += (response.data['hour']) ? response.data['hour'] : 0;
        msVal += ' hrs ';
        msVal += (response.data['minute']) ? response.data['minute'] : 0;
        msVal += ' m';
        this.maintenanceSchescheduled = msVal;
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * Get maintenance list by refrigeratorGuid
   * @param refrigeratorGuid
   */
  getMaintenanceList(refrigeratorGuid) {
    this.dashboardService.getUpcomingMaintenance(refrigeratorGuid).subscribe(response => {
      if (response.isSuccess === true) {
        this.maintenanceList = response.data.items;
        this.maintenanceList.forEach(element => {
          element.startDate=moment(element.startDate+'Z').local();
        });
        
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
   * Get telemetry data by refrigeratorGuid
   * @param refrigeratorGuid
   */
  gettelemetryDetails(refrigeratorGuid) {
    this._service.gettelemetryDetails(refrigeratorGuid).subscribe(response => {
      if (response.isSuccess === true && response.data != '') {
        this.sensdata = response.data
        let attrObj = {};
        response.data.forEach(element => {
          if (element.attributeName) {
            attrObj[element.attributeName] = element.attributeValue;
          }
        });
        this.WidgetData = attrObj;
        let type = 'd';
        this.type = type;
        this.labelname = response.data[0].attributeName;
        this.getAttributeGraph(this.refrigeratorGuid, type, response.data[0].attributeName);
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
   * Get refrigerator details by refrigeratorGuid
   * @param refrigeratorGuid
   */
  getrefrigeratorDetails(refrigeratorGuid) {
    this.spinner.show();
    this._service.getrefrigeratorGuidDetails(refrigeratorGuid).subscribe(response => {
     
      if (response.isSuccess === true) {
        this.objdetailref = response.data;
        this.mediaUrl = this.imgUrl + this.objdetailref.image;
        this.uniqueId = response.data.uniqueId
        this.mediaFiles = response.data.deviceMediaFiles
        this.imagesFiles = response.data.deviceImageFiles
        this.devicestatus();
      }
      setTimeout(() => {
        this.spinner.hide();
      }, 2000);
    });
  }

  /**
   * Change graph filter
   * @param event
   */
  changeGraphFilter(event) {
    let type = 'd';
    if (event.value === 'Week') {
      type = 'w';
    } else if (event.value === 'Month') {
      type = 'm';
    }
    this.getEnergyGraph(this.refrigeratorGuid, type);

  }

  /**
   * Get energy graph by refrigeratorId and type
   * @param refrigeratorId
   * @param type
   */
  getEnergyGraph(refrigeratorId, type) {
    this.spinner.show();
    var data = { deviceGuid: refrigeratorId, frequency: type }
    this._service.getEnergyGraph(data).subscribe(response => {
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
   * Get attribute graph by refrigeratorId, type and attributename
   * @param refrigeratorId
   * @param type
   * @param attributename
   */
  getAttributeGraph(refrigeratorId, type, attributename) {
    this.isChartLoaded = false;
    var data = { deviceGuid: refrigeratorId, attribute: attributename, frequency: type }
    this._service.getAttributeGraph(data).subscribe(response => {
      if (response.isSuccess === true) {
        let data = [];
        if (response.data.length) {
          data.push(['Months', 'Consumption'])

          response.data.forEach(element => {
            data.push([element.name, parseFloat(element.value)])
          });
        }
        this.columnChartattribute = {
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
            colors: ['#ed734c'],
          }
        };
        setTimeout(() => {
          this.isChartLoaded = true;
        }, 200);
      }
    
      else {
        this.columnChartattribute.dataTable = [];
        this._notificationService.add(new Notification('error', response.message));

      }
    }, error => {
      this.columnChartattribute.dataTable = [];
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * Change graph attribute 
   * @param event
   */
  changeGraphAttribute(event) {
    let type = 'd';
    if (event.value === 'Week') {
      type = 'w';
    } else if (event.value === 'Month') {
      type = 'm';
    }
    this.type = type
    this.getAttributeGraph(this.refrigeratorGuid, type, this.labelname)
  }

  /**
   * On tab change event
   * @param tab
   */
  onTabChange(tab) {
    if (tab != undefined && tab != '') {
      this.labelname = tab.tab.textLabel;
      this.getAttributeGraph(this.refrigeratorGuid, this.type, tab.tab.textLabel)
    }
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
   * Get alert list by refGuid
   * @param refGuid
   */
  getAlertList(refGuid) {
    let parameters = {
      pageNumber: 0,
      pageSize: 10,
      searchText: '',
      sortBy: 'eventDate desc',
      deviceGuid: refGuid,
      entityGuid: '',
    };
    this.spinner.show();
    this.dashboardService.getAlertsList(parameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true && response.data.items) {
        this.alerts = response.data.items;

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
  * Show hide filter
  */
  public showHideFilter() {
    this.isFilterShow = !this.isFilterShow;
  }

}
