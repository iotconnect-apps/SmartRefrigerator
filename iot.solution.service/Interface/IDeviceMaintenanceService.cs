﻿using System;
using System.Collections.Generic;
using Entity = iot.solution.entity;
using Response = iot.solution.entity.Response;

namespace iot.solution.service.Interface
{
    public interface IDeviceMaintenanceService
    {
        List<Entity.DeviceMaintenance> Get();
        Entity.DeviceMaintenanceDetail Get(Guid id, DateTime currentDate, string timeZone);
        Entity.ActionStatus Manage(Entity.DeviceMaintenance request);
        Entity.ActionStatus Delete(Guid id);
        Entity.SearchResult<List<Entity.DeviceMaintenanceDetail>> List(Entity.SearchRequest request);
       // Entity.ActionStatus UpdateStatus(Guid id, string status);
        List<Entity.DeviceMaintenanceResponse> GetUpComingList(Entity.DeviceMaintenanceRequest request);
        Entity.BaseResponse<Entity.DeviceSceduledMaintenanceResponse> GetDeviceScheduledMaintenance(Guid deviceId,DateTime currentDate,string timeZone);

    }
}
