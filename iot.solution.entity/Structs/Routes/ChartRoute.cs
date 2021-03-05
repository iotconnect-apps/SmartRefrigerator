using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity.Structs.Routes
{
    public class ChartRoute
    {
        public struct Name
        {
            public const string GetStatisticsByEntity = "chart.getstatisticsbyentity";
            public const string EnergyUsage = "chart.energyusage";
            public const string FuelUsage = "chart.fuelusage";
            public const string QualityParameter = "chart.qualityparameter";
            public const string DeviceBatteryStatus = "chart.devicebatterystatus";
            public const string ExecuteCrone = "chart.executecrone";
            public const string PowerBI = "chart.powerbi";
        }

        public struct Route
        {
            public const string Global = "api/chart";
            public const string GetStatisticsByEntity = "getstatisticsbyentity";
            public const string EnergyUsage = "getenergyusage";
            public const string FuelUsage = "getfuelusage";
            public const string QualityParameter = "getqualityparameterbydevice";
            public const string DeviceBatteryStatus = "getdevicebatterystatus";
            public const string ExecuteCrone = "executecron";
            public const string PowerBI = "powerbi";
        }
    }
}
