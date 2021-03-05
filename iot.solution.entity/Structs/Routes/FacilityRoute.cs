﻿using System;
using System.Collections.Generic;
using System.Text;

namespace iot.solution.entity.Structs.Routes
{
    public struct FacilityRoute
    {
        public struct Name
        {
            public const string Add = "entity.add";
            public const string GetList = "entity.list";
            public const string GetById = "entity.getdevicebyid";
            public const string Delete = "entity.deletedevice";
            public const string DeleteImage = "entity.deletedeviceimage";
            public const string BySearch = "entity.search";
            public const string UpdateStatus = "entity.updatestatus";
            public const string ChildDevice = "entity.childdevicelist";
            public const string ValidateKit = "entity.validatekit";
            public const string ProvisionKit = "entity.provisionkit";
            public const string GetTagLookupByDeviceId = "entity.taglookupbydeviceid";
        }

        public struct Route
        {
            public const string Global = "api/entity";
            public const string Manage = "manage";
            public const string GetList = "";
            public const string GetById = "{id}";
            public const string Delete = "delete/{id}";
            public const string DeleteImage = "deleteimage/{id}";
            public const string UpdateStatus = "updatestatus/{id}/{status}";
            public const string BySearch = "search";
            public const string ChildDevice = "childdevicelist";
            public const string GetTagLookupByDeviceId = "taglookupbydeviceid";

        }
    }
}
