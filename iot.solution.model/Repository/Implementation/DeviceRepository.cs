﻿using component.helper;
using component.logger;
using iot.solution.data;
using iot.solution.entity;
using iot.solution.model.Repository.Interface;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.IO;
using System.Linq;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;
using Response = iot.solution.entity.Response;

namespace iot.solution.model.Repository.Implementation
{
    public class DeviceRepository : GenericRepository<Model.Device>, IDeviceRepository
    {
        private readonly ILogger logger;
        private readonly IWebHostEnvironment _env;
        public DeviceRepository(IUnitOfWork unitOfWork, ILogger logManager,IWebHostEnvironment env) : base(unitOfWork, logManager)
        {
            logger = logManager;
            _uow = unitOfWork;
            _env = env;
        }

        public Entity.Device Get(Guid device)
        {
            Entity.SearchResult<List<Entity.Device>> listResult = new Entity.SearchResult<List<Entity.Device>>();
            var result = new Entity.Device();
            try
            {
                logger.Information(Constants.ACTION_ENTRY, "DeviceRepository.Get");
                // _uow.DbContext.Device.Where(u => u.Name.Equals(device, StringComparison.CurrentCultureIgnoreCase)).FirstOrDefault();
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<System.Data.Common.DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CompanyId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("companyGuid", component.helper.SolutionConfiguration.CompanyId, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("guid", device, DbType.Guid, ParameterDirection.Input));
                    System.Data.Common.DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Device_Get]", CommandType.StoredProcedure, null), parameters.ToArray());
                    listResult.Items = DataUtils.DataReaderToList<Entity.Device>(dbDataReader, null);
                    if (listResult.Items.Count > 0) {
                        result = listResult.Items[0];
                        result.DeviceMediaFiles = GetMediaFiles(result.Guid.Value,"M");
                        result.DeviceImageFiles = GetMediaFiles(result.Guid.Value, "I");
                    }
                }
                logger.Information(Constants.ACTION_EXIT, "DeviceRepository.Get");
            }
            catch (Exception ex)
            {
                logger.Error(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
        private string GetFileSize(string FilePath) 
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            string fileSize = string.Empty;
            string contentRootPath = _env.ContentRootPath;
            string webRootPath = _env.WebRootPath;
            FileInfo fileInfo = new FileInfo(webRootPath + "/" + FilePath);
            if (fileInfo.Exists)
            {
                try
                {
                    double len = fileInfo.Length;
                    int order = 0;
                    while (len >= 1024 && order < sizes.Length - 1)
                    {
                        order++;
                        len = len / 1024;
                    }

                    // Adjust the format string to your preferences. For example "{0:0.#}{1}" would
                    // show a single decimal place, and no space.
                    fileSize = String.Format("{0:0.##} {1}", len, sizes[order]);
                }
                catch (Exception ex) 
                { 
                
                }
            }
            return fileSize;
        }
       
        public Entity.ActionStatus Manage(Model.Device request)
        {
            ActionStatus result = new ActionStatus(true);
            try
            {
                logger.Information(Constants.ACTION_ENTRY, "DeviceRepository.Manage");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {

                     List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", request.Guid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("companyGuid", request.CompanyGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("entityGuid", request.EntityGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("templateGuid", request.TemplateGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("parentDeviceGuid", request.ParentDeviceGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("typeGuid", request.TypeGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("uniqueId", request.UniqueId, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("name", request.Name, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("note", request.Note, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("tag", request.Tag, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("description", request.Description, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("specification", request.Specification, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("image", request.Image, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("model", request.Model, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("power", request.Power, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("voltage", request.Voltage, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("capacity", request.Capacity, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("netweight", request.NetWeight, DbType.String, ParameterDirection.Input));
	
                    parameters.Add(sqlDataAccess.CreateParameter("isProvisioned", request.IsProvisioned, DbType.Boolean, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("newid", request.Guid, DbType.Guid, ParameterDirection.Output));
                    parameters.Add(sqlDataAccess.CreateParameter("culture", component.helper.SolutionConfiguration.Culture, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    int intResult = sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[Device_AddUpdate]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Data = Guid.Parse(parameters.Where(p => p.ParameterName.Equals("newid")).FirstOrDefault().Value.ToString());                    
                }
                logger.Information(Constants.ACTION_EXIT, "DeviceRepository.Manage");
            }
            catch (Exception ex)
            {
                logger.Error(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
        public Entity.ActionStatus Delete(Guid id)
        {
            throw new NotImplementedException();
        }
        public Entity.SearchResult<List<Model.DeviceDetail>> List(Entity.SearchRequest request)
        {
            Entity.SearchResult<List<Model.DeviceDetail>> result = new Entity.SearchResult<List<Model.DeviceDetail>>();
            try
            {
                logger.Information(Constants.ACTION_ENTRY, "DeviceRepository.List");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<System.Data.Common.DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, request.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("companyguid", component.helper.SolutionConfiguration.CompanyId, DbType.Guid, ParameterDirection.Input));
                    // parameters.Add(sqlDataAccess.CreateParameter("isParent", true, DbType.Boolean, ParameterDirection.Input));
                    if (!request.EntityId.Equals(Guid.Empty) && !request.EntityId.Equals(SolutionConfiguration.EntityGuid))
                    {
                        parameters.Add(sqlDataAccess.CreateParameter("entityGuid", request.EntityId, DbType.Guid, ParameterDirection.Input));
                    }
                    parameters.Add(sqlDataAccess.CreateParameter("search", request.SearchText, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("pagesize", request.PageSize, DbType.Int32, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("pagenumber", request.PageNumber, DbType.Int32, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("orderby", request.OrderBy, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("count", DbType.Int32, ParameterDirection.Output, 16));
                    System.Data.Common.DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Device_List]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Items = DataUtils.DataReaderToList<Model.DeviceDetail>(dbDataReader, null);
                    result.Count = int.Parse(parameters.Where(p => p.ParameterName.Equals("count")).FirstOrDefault().Value.ToString());
                }
                logger.Information(Constants.ACTION_EXIT, "DeviceRepository.List");
            }
            catch (Exception ex)
            {
                logger.Error(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
        

      
      
        public List<Response.EntityWiseDeviceResponse> GetEntityWiseDevices(Guid? locationId, Guid? deviceId)
        {
            List<Response.EntityWiseDeviceResponse> result = new List<Response.EntityWiseDeviceResponse>();
            try
            {
                logger.Information(Constants.ACTION_ENTRY, "GetLocationDevices.Get");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<System.Data.Common.DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CompanyId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("companyGuid", component.helper.SolutionConfiguration.CompanyId, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("entityGuid", locationId, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("pagesize", -1, DbType.Int32, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("pagenumber", -1, DbType.Int32, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("count", DbType.Int32, ParameterDirection.Output, 16));

                    System.Data.Common.DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Device_List]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result = DataUtils.DataReaderToList<Response.EntityWiseDeviceResponse>(dbDataReader, null);
                }
                logger.Information(Constants.ACTION_EXIT, "GetLocationDevices.Get");
            }
            catch (Exception ex)
            {
                logger.Error(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
        public Entity.BaseResponse<int> ValidateKit(string kitCode)
        {
            Entity.BaseResponse<int> result = new Entity.BaseResponse<int>();
            try
            {
                logger.Information(Constants.ACTION_ENTRY, "ValidateKit.Get");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<System.Data.Common.DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CompanyId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("kitCode", kitCode, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("culture", component.helper.SolutionConfiguration.Culture, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    sqlDataAccess.ExecuteScalar(sqlDataAccess.CreateCommand("[Validate_KitCode]", CommandType.StoredProcedure, null), parameters.ToArray());
                    int outPut = int.Parse(parameters.Where(p => p.ParameterName.Equals("output")).FirstOrDefault().Value.ToString());
                    if (outPut > 0)
                    {
                        result.IsSuccess = true;
                    }
                    else {
                        result.IsSuccess = false;
                    }
                    string msg = parameters.Where(p => p.ParameterName.Equals("fieldname")).FirstOrDefault().Value.ToString();
                    if (msg == "InvalidKitCode")
                    {
                        result.Message = "Invalid Kit Code";
                    }
                    else
                    {
                        result.Message = msg;
                    }
                }
                logger.Information(Constants.ACTION_EXIT, "ValidateKit.Get");
            }
            catch (Exception ex)
            {
                logger.Error(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
       
        public Entity.BaseResponse<List<Entity.HardwareKit>> ProvisionKit(Entity.ProvisionKitRequest request)
        {
            Entity.BaseResponse<List<Entity.HardwareKit>> result = new Entity.BaseResponse<List<Entity.HardwareKit>>();
            try
            {
                logger.Information(Constants.ACTION_ENTRY, "DeviceRepository.ProvisionKit");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {                   

                    List<System.Data.Common.DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CompanyId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("kitCode", request.KitCode, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("uniqueId", request.UniqueId, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("culture", component.helper.SolutionConfiguration.Culture, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    System.Data.Common.DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[HardwareKit_GetStatus]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Data = DataUtils.DataReaderToList<Entity.HardwareKit>(dbDataReader, null);
                }
                logger.Information(Constants.ACTION_EXIT, "DeviceRepository.ProvisionKit");
            }
            catch (Exception ex)
            {
                logger.Error(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
        #region MediaFiles
        public List<Entity.DeviceMediaFiles> GetMediaFiles(Guid deviceId,string type)
        {
            var result = new List<DeviceMediaFiles>();
            try
            {
                logger.Information(Constants.ACTION_ENTRY, "DeviceRepository.GetMediaFiles");

                result = _uow.DbContext.DeviceFiles.Where(u => u.DeviceGuid == deviceId && !u.IsDeleted && u.Type==type).Select(g => new Entity.DeviceMediaFiles()
                {
                    Guid = g.Guid,
                    FilePath = g.FilePath,
                    Description = g.Description,
                    FileName = Path.GetFileName(g.FilePath),
                    //  FileSize = GetFileSize(g.FilePath)
                }).ToList();
                foreach (DeviceMediaFiles file in result)
                {
                    file.FileSize = GetFileSize(file.FilePath);
                }
                logger.Information(Constants.ACTION_EXIT, "DeviceRepository.GetMediaFiles");
            }
            catch (Exception ex)
            {
                logger.Error(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
        public Entity.ActionStatus UploadFiles(string xmlString, string deviceId)
        {
            var response = new ActionStatus();
            int outPut = 0;
            try
            {
                logger.Information(Constants.ACTION_ENTRY, "DeviceRepository.UploadFiles");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("deviceGuid", Guid.Parse(deviceId)));
                    parameters.Add(sqlDataAccess.CreateParameter("files", xmlString, DbType.Xml, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("culture", component.helper.SolutionConfiguration.Culture, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    int intResult = sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[DeviceFiles_Add]", CommandType.StoredProcedure, null), parameters.ToArray());
                    outPut = int.Parse(parameters.Where(p => p.ParameterName.Equals("output")).FirstOrDefault().Value.ToString());
                }

                if (outPut == 1)
                {
                    response.Message = "Files Uploaded Successfully!!";
                    response.Data = null;
                    response.Success = true;
                }
                else
                {
                    response.Message = "Unable to Upload Files";
                    response.Data = null;
                    response.Success = false;
                }
                logger.Information(Constants.ACTION_EXIT, "DeviceRepository.UploadFiles");
            }
            catch (Exception ex)
            {
                logger.Error(Constants.ACTION_EXCEPTION, ex);
            }
            return response;
        }
        public ActionStatus DeleteMediaFiles(Guid deviceId, Guid? fileId)
        {
            ActionStatus result = new ActionStatus(true);
            try
            {
                logger.Information(Constants.ACTION_ENTRY, "DeviceRepository.DeleteMediaFiles");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {

                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", fileId, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("deviceGuid", deviceId, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("status", true, DbType.Boolean, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("culture", component.helper.SolutionConfiguration.Culture, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[DeviceFiles_UpdateStatus]", CommandType.StoredProcedure, null), parameters.ToArray());
                    int outPut = int.Parse(parameters.Where(p => p.ParameterName.Equals("output")).FirstOrDefault().Value.ToString());
                    if (outPut > 0)
                    {
                        result.Success = true;
                    }
                    else
                    {
                        result.Success = false;
                    }
                    result.Message = parameters.Where(p => p.ParameterName.Equals("fieldname")).FirstOrDefault().Value.ToString();
                }
                logger.Information(Constants.ACTION_EXIT, "DeviceRepository.DeleteMediaFiles");
            }
            catch (Exception ex)
            {
                logger.Error(Constants.ACTION_EXCEPTION, ex);
            }
            return result;
        }
        #endregion

        #region Lookup       

        public List<Entity.LookupItem> GetDeviceLookup()
        {
            using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
            {
                return sqlDataAccess.QueryList<Entity.LookupItem>("SELECT CONVERT(NVARCHAR(50),[Guid]) AS [Value], [name] AS [Text] FROM [DeviceType] WHERE [isActive] = 1 AND [isDeleted] = 0");
            }
        }
        #endregion
    }
}
