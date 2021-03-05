import 'rxjs/add/operator/map'

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'
import { ApiConfigService, NotificationService } from 'app/services';

@Injectable({
  providedIn: 'root'
})
export class RefrigeratorService {

  cookieName = 'FM';
  protected apiServer = ApiConfigService.settings.apiServer;
  constructor(
    private cookieService: CookieService,
    private httpClient: HttpClient,
    private _notificationService: NotificationService
  ) {
    this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
  }

  removeRefrigeratorImage(deviceId) {
    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/device/deleteimage/' + deviceId, {}).map(response => {
      return response;
    });
  }

  removeMediaImage(deviceId, fileId) {
    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/device/deletemediafile/' + deviceId + '/' + fileId, {}).map(response => {
      return response;
    });
  }

  getEnergyGraph(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getenergyusage', data).map(response => {
      return response;
    });
  }
  getAttributeGraph(data) {

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getqualityparameterbydevice', data).map(response => {
      return response;
    });
  }
  getRefrigeratorlist(parameters) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var configHeader = {
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const parameter = {
      params: {
        'pageNo': parameters.pageNumber + 1,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.sortBy,
        'entityGuid': parameters.entityGuid
      },
      timestamp: Date.now()
    };
    var reqParameter = Object.assign(parameter, configHeader);

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/search', reqParameter).map(response => {
      return response;
    });
  }
  getrefregetorTelemetryData(templateGuid) {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/attributes/' + templateGuid).map(response => {
      return response;
    });
  }

  gettelemetryDetails(refId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/telemetry/' + refId).map(response => {
      return response;
    });

  }
  getrefrigeratorGuidDetails(refId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/' + refId).map(response => {
      return response;
    });

  }
  getDevicelookup(entityId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/devicelookup/' + entityId).map(response => {
      return response;
    });

  }

  getLocationlookup(companyId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/entitylookup/' + companyId).map(response => {
      return response;
    });

  }

  getRefrigeratorDetails(refrigeratorGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/' + refrigeratorGuid).map(response => {
      return response;
    });
  }

  checkkitCode(data) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/ValidateKit/' + data).map(response => {
      return response;
    });
  }


  namageRefrigerator(data) {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (data[key]) {
        if (key === 'mediaFiles' || key == 'imageFiles') {
          for (let i = 0; i < value.length; i++) {
            formData.append(key, value[i]);
          }
        } else {
          formData.append(key, value);
        }
      }
    }

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/device/manage', formData).map(response => {
      return response;
    });
  }
}
