import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

import { ApiConfigService, NotificationService } from 'app/services';
import 'rxjs/add/operator/map'


@Injectable({
  providedIn: 'root'
})
export class LookupService {
  protected apiServer = ApiConfigService.settings.apiServer;
  constructor(
    private httpClient: HttpClient,
    private _notificationService: NotificationService) {
    this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
  }


  // tag look up based on template ID or code
  getTagsLookup(tagID) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/taglookup/' + tagID).map(response => {
      return response;
    });

  }

  // get time zone list
  getTimezoneList() {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/Lookup/timezone').map(response => {
      return response;
    });
  }

  // get country list
  getcountryList() {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/country').map(response => {
      return response;
    });
  }

  // get city list based on country ID
  getcitylist(countryId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/state/' + countryId).map(response => {
      return response;
    });
  }


  // NoAuth APIs 

  // get time zone list
  getNoAuthTimezoneList() {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/subscriber/gettimezonelookup').map(response => {
      return response;
    });
  }

  // get country list
  getNoAuthcountryList() {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/subscriber/getcountrylookup').map(response => {
      return response;
    });
  }

  // get state list based on country ID
  getNoAuthStaetlist(countryId) {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/subscriber/getstatelookup/' + countryId).map(response => {
      return response;
    });
  }

  // get subscription plans list
  getNoAuthplanslist() {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/subscriber/getsubscriptionplan').map(response => {
      return response;
    });
  }

  postNoAuthRegister(data) {
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/subscriber/company', data).map(response => {
      return response;
    });

  }

  // get subscription plans list
  getNoAuthSripeKey() {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/subscriber/getstripekey').map(response => {
      return response;
    });
  }
  // tag look up based on template ID or code
  getsensor(companyID) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/facilitylookup/' + companyID).map(response => {
      return response;
    });

  }
  gettypelookup() {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/type').map(response => {
      return response;
    });

  }
  gettemplatelookup() {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/template').map(response => {
      return response;
    });

  }
  getZonelookup(parentEntityId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/zonelookup/' + parentEntityId).map(response => {
      return response;
    });

  }
  checkkitCode(data) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/ValidateKit/' + data).map(response => {
      return response;
    });
  }
  addUpdateSensor(data) {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (data[key])
        formData.append(key, value);
    }

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/device/manage', formData).map(response => {
      return response;
    });
  }
  getzonetype() {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/zonetype').map(response => {
      return response;
    });

  }
  getDeviceName(zoneId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/devicelookup/' + zoneId).map(response => {
      return response;
    });

  }
  getzoneonType(type, faciltyId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/zonelookup/' + faciltyId + '/' + type).map(response => {
      return response;
    });

  }

  validate(data) {
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/subscriber/validatecompany', data).map(response => {
      return response;
    });
  }

}
