import 'rxjs/add/operator/map'

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'
import { NotificationService, ApiConfigService } from '..';
import * as moment from 'moment'

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  cookieName = 'FM';
  protected apiServer = ApiConfigService.settings.apiServer;
  constructor(
    private cookieService: CookieService,
    private httpClient: HttpClient,
    private _notificationService: NotificationService
  ) {
    this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
  }

  /**
  * Manage Maintenance
  * @param data
  */
  scheduleMaintenance(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/devicemaintenance/manage', data).map(response => {
      return response;
    });
  }

  getMaintenancelist(parameters) {
    let currentDate=moment(new Date()).format('YYYY-MM-DDTHH:mm:ss');
    var timeZone = moment().utcOffset();
    const reqParameter:any = {
      params: {
        'entityGuid': parameters.entityGuid,
        'deviceId': parameters.deviceId,
        'pageNo': parameters.pageNumber+1,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.sortBy,
        'currentDate':currentDate,
        'timeZone':timeZone
      }
    };

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/devicemaintenance/search', reqParameter).map(response => {
      return response;
    });
  }

  getMaintenancelistWithFilter(parameters) {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/devicemaintenance/upcoming', parameters).map(response => {
      return response;
    });
  }
  getMaintenanceDetails(id) {
    let currentDate=moment(new Date()).format('YYYY-MM-DDTHH:mm:ss');
    var timeZone = moment().utcOffset();
    var path='api/devicemaintenance/'+id+'?currentDate='+currentDate+'&timeZone='+timeZone;
    return this.httpClient.get<any>(this.apiServer.baseUrl + path).map(response => {
      return response;
    });
  }
  getTimeZone() {
    return /\((.*)\)/.exec(new Date().toString())[1];
  }

  deleteMaintenance(guid) {
    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/devicemaintenance/delete/' + guid, "").map(response => {
      return response;
    });
  }
}
