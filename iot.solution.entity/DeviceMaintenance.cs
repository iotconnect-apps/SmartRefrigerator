﻿using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity
{
    public class DeviceMaintenance
    {
        public Guid Guid { get; set; }
        public Guid CompanyGuid { get; set; }
        //This is wing Guid
        public Guid? EntityGuid { get; set; }
        public Guid DeviceGuid { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedDate { get; set; }
       
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string TimeZone { get; set; }
        public bool IsDeleted { get; set; }
    }
    public class DeviceMaintenanceDetail : DeviceMaintenance
    {
        public string DeviceName { get; set; }
        public string EntityName { get; set; }
        public string Wing { get; set; }
    }

    public class DeviceMaintenanceResponse
    {
        public Guid EntityGuid { get; set; }
        public string DeviceName { get; set; }
        public string EntityName { get; set; }
        public string Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class DeviceMaintenanceRequest
    {
        public Guid? EnityGuid { get; set; }
        public Guid? DeviceGuid { get; set; }
        public DateTime? currentDate { get; set; }
        public string timeZone { get; set; }
    }

    public class DeviceSceduledMaintenanceResponse
    {
        public string UniqueId { get; set; }
        public string Day { get; set; }
        public string Hour { get; set; }
        public string Minute { get; set; }
        public DateTime startDate { get; set; }
    }
}
