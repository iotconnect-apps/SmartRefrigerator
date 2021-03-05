using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Entity = iot.solution.entity;
using Request = iot.solution.entity.Request;
using Response = iot.solution.entity.Response;

namespace iot.solution.service.Interface
{
    public interface IChartService
    {
        Entity.ActionStatus TelemetrySummary_DayWise();
        Entity.ActionStatus TelemetrySummary_HourWise();
        List<Response.FuelUsageResponse> GetFuelUsage(Request.ChartRequest request);
        List<Response.EnergyUsageResponse> GetEnergyUsage(Request.ChartRequest request);
        Task<Entity.BaseResponse<List<Response.PowerBIAttributeResponse>>> GetPowerBIDataAsync(Request.PowerBIChartRequest request);
        Entity.BaseResponse<List<Response.EntityStatisticsResponse>> GetStatisticsByEntity(Request.ChartRequest request);
        Entity.BaseResponse<List<Response.DeviceUsageResponse>> GetQualityParameterByDevice(Request.ChartRequest request);
        
        List<Response.DeviceBatteryStatusResponse> GetDeviceBatteryStatus(Request.ChartRequest request);
        Entity.ActionStatus SendSubscriptionNotification();
    }
}
