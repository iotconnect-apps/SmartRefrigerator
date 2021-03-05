import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { AppConstant } from '../../../app.constants';
import { NotificationService, Notification, RefrigeratorService } from '../../../services';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material'

@Component({
  selector: 'app-refrigerators-list',
  templateUrl: './refrigerators-list.component.html',
  styleUrls: ['./refrigerators-list.component.css']
})
export class RefrigeratorsListComponent implements OnInit {

  displayedColumns: string[] = ['uniqueId', 'name', 'typeName', 'entityName', 'isProvisioned','actions'];
  isFilterShow: boolean = false;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  searchParameters = {
    pageNumber: 0,
    pageSize: 10,
    searchText: '',
    sortBy: 'entityName asc',
    entityGuid: '',
  };
  totalRecords = 0;
  refrigeratorList: any = [];
  locationList: any = [];
  isSearch = false;
  selectedLocation: any;
  dataSource: MatTableDataSource<any>;
  @ViewChild('paginator', { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private router: Router,
    public _appConstant: AppConstant,
    private _notificationService: NotificationService,
    private _service: RefrigeratorService, ) { }

  ngOnInit() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getLocationLookup(currentUser.userDetail.companyId);
    this.getRefrigeratorList();
  }

  /**
  * Show hide filter
  */
  public showHideFilter() {
    this.isFilterShow = !this.isFilterShow;
  }

  /**
   * Get refrigerator list
   * */
  getRefrigeratorList() {
    this.spinner.show();
    this._service.getRefrigeratorlist(this.searchParameters).subscribe(response => {
      this.spinner.hide();
      this.totalRecords = response.data.count;
      if (response.data.count) {
        this.refrigeratorList = response.data.items;
      } else {
        this.refrigeratorList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * List size on change
   * @param pageSize
   */
  onPageSizeChangeCallback(pageSize) {
    this.searchParameters.pageSize = pageSize;
    this.searchParameters.pageNumber = 1;
    this.isSearch = true;
    this.getRefrigeratorList();
  }

  /**
   * Pagination on change of page change
   * @param pagechangeresponse
   */
  ChangePaginationAsPageChange(pagechangeresponse) {
    this.searchParameters.pageNumber = pagechangeresponse.pageIndex;
    this.searchParameters.pageSize = pagechangeresponse.pageSize;
    this.isSearch = true;
    this.getRefrigeratorList();
  }

  /**
   * Search text in list
   * @param filterText
   */
  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNumber = 0;
    this.getRefrigeratorList();
    this.isSearch = true;
  }

  /**
  * Get Location Lookup by companyId
  * @param companyId
  */
  getLocationLookup(companyId) {
    this._service.getLocationlookup(companyId).
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
   * appl
   * @param filterValue
   */
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  onKey(filterValue: string) {
    this.applyFilter(filterValue);
  }

  /**
   * Set sort order
   * @param sort
   */
  setOrder(sort: any) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.searchParameters.sortBy = sort.active + ' ' + sort.direction;
    this.getRefrigeratorList();
  }

  /**
   * Filter by location
   * @param location
   */
  filterByLocation(location) {
    this.refrigeratorList = [];
    this.searchParameters = {
      pageNumber: 0,
      pageSize: 10,
      searchText: '',
      sortBy: 'entityName asc',
      entityGuid: location
    };
    this.getRefrigeratorList();
  }

  /**
   * Clear filter for refrigerator list
   * */
  clearFilter() {
    this.isFilterShow = false;
    this.refrigeratorList = [];
    this.searchParameters = {
      pageNumber: 0,
      pageSize: 10,
      searchText: '',
      sortBy: 'entityName asc',
      entityGuid: ''
    };
    this.selectedLocation = '';
    this.getRefrigeratorList();
  }
}
