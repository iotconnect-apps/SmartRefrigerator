import { Component, OnInit } from '@angular/core';
import { DeleteAlertDataModel, AppConstant } from '../../../app.constants';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DeviceService, NotificationService, Notification, DashboardService, LocationService } from '../../../services';
import { DeleteDialogComponent } from '../..';

@Component({
  selector: 'app-locations-list',
  templateUrl: './locations-list.component.html',
  styleUrls: ['./locations-list.component.css']
})
export class LocationsListComponent implements OnInit {

  searchParameters = {
    pageNo: 0,
    pageSize: 10,
    searchText: '',
    orderBy: 'name asc'
  };
  locationList = [];
  deleteAlertDataModel: DeleteAlertDataModel;
  mediaUrl: any;
  isSearch = false;

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    public dialog: MatDialog,
    private deviceService: DeviceService,
    private _notificationService: NotificationService,
    public _appConstant: AppConstant,
    public _service: LocationService) {
    this.mediaUrl = this._notificationService.apiBaseUrl;
  }

  ngOnInit() {
    this.getLocationlist();
  }

  /**
   * Get location list
   * */
  getLocationlist() {
    this.locationList = [];
    this.spinner.show();
    this._service.getLocationlist(this.searchParameters).subscribe((response:any) => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.locationList = response.data.items
      }
      else {
        this.locationList = [];
        response.message ? response.message : response.message = "No results found";
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * Search for test in the list
   * @param filterText
   */
  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNo = 0;
    this.getLocationlist();
    this.isSearch = true;
  }

  /**
   * Delete confirmation popup
   * @param userModel
   */
  deleteModel(userModel: any) {
    this.deleteAlertDataModel = {
      title: "Delete Location",
      message: this._appConstant.msgConfirm.replace('modulename', "Location"),
      okButtonName: "Confirm",
      cancelButtonName: "Cancel",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletelocation(userModel.guid);
      }
    });
  }

  /**
   * Delete location by guid
   * @param guid
   */
  deletelocation(guid) {
    this.spinner.show();
    this._service.deleteLocation(guid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Location")));
        this.getLocationlist();

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
   * Confirmation popup
   * @param id
   * @param isActive
   * @param name
   */
  activeInactiveLocation(id: string, isActive: boolean, name: string) {
    var status = isActive == false ? this._appConstant.activeStatus : this._appConstant.inactiveStatus;
    var mapObj = {
      statusname: status,
      fieldname: name,
      modulename: "Location"
    };
    this.deleteAlertDataModel = {
      title: "Status",
      message: this._appConstant.msgStatusConfirm.replace(/statusname|fieldname/gi, function (matched) {
        return mapObj[matched];
      }),
      okButtonName: "Confirm",
      cancelButtonName: "Cancel",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.changeLocationStatus(id, isActive);

      }
    });
  }

  /**
   * Change location status 
   * @param id
   * @param isActive
   */
  changeLocationStatus(id, isActive) {
    this.spinner.show();
    this._service.changeLocationStatus(id, isActive).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgStatusChange.replace("modulename", "Location")));
        this.getLocationlist();
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }

    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
}
