using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.model.Models
{
    public partial class DeviceDetail : Device
    {
        public string EntityName { get; set; }
        public string SubEntityName { get; set; }
        public string TypeName { get; set; }

       
        public string TotalEnergy { get; set; }
        public string TotalAlert { get; set; }
        public bool IsConnected { get; set; }
    }
}
