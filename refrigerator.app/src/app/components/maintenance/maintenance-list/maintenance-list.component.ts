import * as moment from 'moment-timezone';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { AppConstant, DeleteAlertDataModel } from '../../../app.constants';
import { Notification, NotificationService, RefrigeratorService } from '../../../services';
import { MaintenanceService } from '../../../services/maintenance/maintenance.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DeleteDialogComponent } from '../..';

@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.css']
})
export class MaintenanceListComponent implements OnInit {

  displayedColumns: string[] = ['startDate','endDate', 'deviceName', 'entityName', 'status', 'actions'];

  locationList: any = [];
  maintenances = [
    { value: 'maintenance_1', viewValue: 'Maintenance 1' },
    { value: 'maintenance_2', viewValue: 'Maintenance 2' },
    { value: 'maintenance_3', viewValue: 'Maintenance 3' }
  ];
  isFilterShow: boolean = false;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  searchParameters = {
    entityGuid: '',
    deviceId: '',
    pageNumber: 0,
    pageSize: 10,
    searchText: '',
    sortBy: 'deviceName asc'
  };
  totalRecords = 0;
  checkFilterSubmitStatus: boolean = false;
  maintenanceList = [];
  refrigerators: any = [];
  isSearch = false;
  filterForm: FormGroup;
  constructor(public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private router: Router,
    private formBuilder: FormBuilder,
    public _appConstant: AppConstant, private refrigeratorService: RefrigeratorService,
    private _notificationService: NotificationService,
    private _service: MaintenanceService, ) { }

  ngOnInit() {
    this.createFilterFormGroup();

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getLocationLookup(currentUser.userDetail.companyId);
    this.getMaintenance();
  }

  /**
 * Show hide filter
 */
  public showHideFilter() {
    this.isFilterShow = !this.isFilterShow;
  }


  createFilterFormGroup() {
    this.filterForm = this.formBuilder.group({
      entityGuid: ['', Validators.required],
      deviceId: ['', Validators.required]
    });
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
 * Get Refrigerator Lookup by locationId
 * @param locationId
 */
  getRefrigeratorlookup(locationId) {
    this.spinner.show();
    this.refrigeratorService.getDevicelookup(locationId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.spinner.hide();
          this.refrigerators = response.data;
          this.refrigerators = this.refrigerators.filter(word => word.isActive == true);

        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  setOrder(sort: any) {
    console.log(sort);
    if (!sort.active || sort.direction === '') {
      return;
    }
    if (sort.active == 'deviceName') {
      sort.active = 'deviceName';
    }
    this.searchParameters.sortBy = sort.active + ' ' + sort.direction;

    this.getMaintenance();

  }

  deleteAlertDataModel: DeleteAlertDataModel;
  deleteModel(model: any) {
    this.deleteAlertDataModel = {
      title: "Delete Scheduled Maintenance",
      message: this._appConstant.msgConfirm.replace('modulename', "Scheduled Maintenance"),
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
        this.deleteMaintenance(model.guid);
      }
    });
  }

  deleteMaintenance(guid) {
    this.spinner.show();
    this._service.deleteMaintenance(guid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Scheduled Maintenance")));
        this.getMaintenance();
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }


  getMaintenance() {
    this.spinner.show();
    this._service.getMaintenancelist(this.searchParameters).subscribe((response: any) => {
      this.spinner.hide();
      this.totalRecords = response.data.count;
      if (response.data.count) {
        this.maintenanceList = response.data.items;
      } else {
        this.maintenanceList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  onPageSizeChangeCallback(pageSize) {
    this.searchParameters.pageSize = pageSize;
    this.searchParameters.pageNumber = 1;
    this.isSearch = true;
    this.getMaintenance();
  }

  ChangePaginationAsPageChange(pagechangeresponse) {
    this.searchParameters.pageNumber = pagechangeresponse.pageIndex;
    this.searchParameters.pageSize = pagechangeresponse.pageSize;
    this.isSearch = true;
    this.getMaintenance();
  }

  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNumber = 0;
    this.getMaintenance();
    this.isSearch = true;
  }

  getLocalDate(lDate) {
    // var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
    
    // // Get the local version of that date
    // var localDate = moment(lDate).local();
    // let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
    // return res;

    //var date = moment.utc().format('YYYY-MM-DD HH:mm:ss');

//console.log(date); // 2015-09-13 03:39:27

var stillUtc = moment.utc(lDate).toDate();
var local = moment(stillUtc).local().format('MMM DD, YYYY hh:mm:ss A');
return local;
  }


  // For filter maintanance list
  filterCall() {
    this.checkFilterSubmitStatus = true;
    if (this.filterForm.valid) {
      this.searchParameters.entityGuid = this.filterForm.value.entityGuid;
      this.searchParameters.deviceId = this.filterForm.value.deviceId;
      this.getMaintenance();
    }
  }

  // For Cleare filter maintanance list
  clearFilter() {
    this.filterForm.reset();
    this.isFilterShow = false;
    this.checkFilterSubmitStatus = false;
    this.searchParameters.entityGuid = '';
    this.searchParameters.deviceId = '';
    this.getMaintenance();
  }


}
