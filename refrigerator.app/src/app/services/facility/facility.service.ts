import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'
import * as moment from 'moment'
import { ApiConfigService, NotificationService } from 'app/services';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {
  protected apiServer = ApiConfigService.settings.apiServer;
  cookieName = 'FM';
  constructor(private cookieService: CookieService,
    private _notificationService: NotificationService,
    private httpClient: HttpClient) {
    this._notificationService.apiBaseUrl = this.apiServer.baseUrl;
  }

  /**
   * Country list 
   * */
  getcountryList() {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/country').map(response => {
      return response;
    });
  }

  removeImage(entityId) {
    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/entity/deleteimage/'+entityId,{}).map(response => {
      return response;
    });
  }


  /**
   * State list by country id
   * @param countryId
   */
  getstatelist(countryId) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/state/' + countryId).map(response => {
      return response;
    });
  }

  /**
   * Zone type list
   */
  getZoneTypelist() {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/zonetype').map(response => {
      return response;
    });
  }

  /**
   * Add facility
   * @param data
   */
  addFacility(data) {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (data[key])
        formData.append(key, value);
    }

    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/entity/manage', formData).map(response => {
      return response;
    });
  }

  /**
   * Get faility detail by facilityGuid
   * @param facilityGuid
   */
  getFacilityDetails(facilityGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/entity/' + facilityGuid).map(response => {
      return response;
    });
  }

  getAlerts(facilityGuid) {


    return this.httpClient.get<any>(this.apiServer.baseUrl + 'alert?entityGuid/' + facilityGuid).map(response => {
      return response;
    });
    // return this.http.get<any>(environment.baseUrl + 'alert', configHeader).map(response => {
    // 	return response;
    // });
  }


  /**
   * Get list of facility
   * @param parameters
   */
  getFacility(parameters) {

    const reqParameter = {
      params: {
        'parentEntityGuid': parameters.parentEntityGuid,
        'pageNo': parameters.pageNumber,
        'pageSize': parameters.pageSize,
        'searchText': parameters.searchText,
        'orderBy': parameters.sortBy,
        'currentDate': moment(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
        'timeZone': moment().utcOffset().toString()
      },
      timestamp: Date.now()
    };

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/entity/search', reqParameter).map(response => {
      return response;
    });
  }

  getTimeZone() {
    return /\((.*)\)/.exec(new Date().toString())[1];
  }

  /**
   * Update status
   * @param id
   * @param isActive
   */
  changeStatus(id, isActive) {
    let status = isActive == true ? false : true;
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/entity/updatestatus/' + id + '/' + status, {}).map(response => {
      return response;
    });
  }

  deleteFacility(facilityGuid) {

    return this.httpClient.put<any>(this.apiServer.baseUrl + 'api/entity/delete/' + facilityGuid, "").map(response => {
      return response;
    });
  }
  getsensorTelemetryData() {
    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/attributes').map(response => {
      return response;
    });
  }
  getFacilitygraph(zoneId, type, attribute) {
    let data = {
      "entityGuid": zoneId,
      "frequency": type,
      "attribute": attribute
    }
    return this.httpClient.post<any>(this.apiServer.baseUrl + 'api/chart/getstatisticsbyentity', data).map(response => {
      return response;
    });
  }
  getSensorDetails(sensorGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/lookup/deviceattributelookup/' + sensorGuid).map(response => {
      return response;
    });
  }
  getSensorLatestData(sensorGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/telemetry/' + sensorGuid).map(response => {
      return response;
    });
  }
  getwqiindexvalue(deviceGuid) {

    return this.httpClient.get<any>(this.apiServer.baseUrl + 'api/device/getaqiindexvalue/' + deviceGuid).map(response => {
      return response;
    });
  }
}
