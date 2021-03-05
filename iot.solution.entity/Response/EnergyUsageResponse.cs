using System;
using System.Collections.Generic;

namespace iot.solution.entity.Response
{
    public class DeviceUsageResponse
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }
    public class EnergyUsageResponse
    {
        public string Name { get; set; }
        public string EnergyConsumption { get; set; }
    }
    public class PowerBIAttributeResponse
    {
        public DateTime Date { get; set; }
        public decimal Forcasted { get; set; }
        public decimal Historical { get; set; }
        public PowerBIAttributeResponse()
        { }
            public PowerBIAttributeResponse(DateTime _Date, decimal _Forcasted) {
            Date = _Date;
            Forcasted = _Forcasted;
        }
       
    }
    public class PowerBIAnomalyResponse
    {
        public string Date { get; set; }
        public string Forcasted { get; set; }
        public string Historical { get; set; }
    }
    public class EntityStatisticsResponse
    {
        public string Name { get; set; }
        public string Value { get; set; }
        public string Attribute { get; set; }
        public string EntityName { get; set; }
    }
    public class FuelUsageResponse
    {
        public string Month { get; set; }
        public string Value { get; set; }
    }

    public class DeviceBatteryStatusResponse
    {
        public string Name { get; set; }
        public string Value { get; set; }
   
    }

    public class ConfgurationResponse
    {
        public string cpId { get; set; }
        public string host { get; set; }
        public int isSecure { get; set; }
        public string password { get; set; }
        public int port { get; set; }
        public string url { get; set; }
        public string user { get; set; }
        public string vhost { get; set; }
    }
}
