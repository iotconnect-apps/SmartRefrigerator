using iot.solution.data;
using iot.solution.model.Repository.Interface;
using iot.solution.service.Interface;
using System.Collections.Generic;
using Request = iot.solution.entity.Request;
using Response = iot.solution.entity.Response;
using System.Data;
using System.Data.Common;
using System.Reflection;
using component.logger;
using System;
using Entity = iot.solution.entity;
using LogHandler = component.services.loghandler;
using System.Linq;
using component.helper.Interface;
using component.helper;
using System.Threading.Tasks;
using System.IO;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Microsoft.WindowsAzure.Storage;

namespace iot.solution.service.Implementation
{
    public class ChartService : IChartService
    {
        private readonly IEntityRepository _entityRepository;
        private readonly ILogger _logger;
        private readonly IEmailHelper _emailHelper;
        public string ConnectionString = component.helper.SolutionConfiguration.Configuration.ConnectionString;
        
        //private readonly LogHandler.Logger _logger;
       public string folderPath = Environment.CurrentDirectory + "//" + SolutionConfiguration.UploadBasePath + SolutionConfiguration.PowerBIFile;
        public ChartService(IEntityRepository entityRepository, IEmailHelper emailHelper,ILogger logger)//, LogHandler.Logger logger)
        {
            _entityRepository = entityRepository;
            _emailHelper = emailHelper;
            _logger = logger;
           
        }
        public Entity.ActionStatus TelemetrySummary_DayWise()
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                _logger.InfoLog(LogHandler.Constants.ACTION_ENTRY, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = new List<DbParameter>();
                    sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[TelemetrySummary_DayWise_Add]", CommandType.StoredProcedure, null), parameters.ToArray());
                }
                _logger.InfoLog(LogHandler.Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);

            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.ActionStatus TelemetrySummary_HourWise()
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                _logger.InfoLog(LogHandler.Constants.ACTION_ENTRY, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = new List<DbParameter>();
                    sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[TelemetrySummary_HourWise_Add]", CommandType.StoredProcedure, null), parameters.ToArray());
                }
                _logger.InfoLog(LogHandler.Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);

            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.BaseResponse<List<Response.EntityStatisticsResponse>> GetStatisticsByEntity(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.EntityStatisticsResponse>> result = new Entity.BaseResponse<List<Response.EntityStatisticsResponse>>();
            try
            {
                _logger.Information(Constants.ACTION_ENTRY, "Chart_StatisticsByEntity.Get");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", request.EntityGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("frequency", request.Frequency, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("attribute", request.Attribute, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("syncDate", DateTime.UtcNow, DbType.DateTime, ParameterDirection.Output));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Chart_StatisticsByEntity]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Data = DataUtils.DataReaderToList<Response.EntityStatisticsResponse>(dbDataReader, null);
                    if (parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault() != null)
                    {
                        result.LastSyncDate = Convert.ToString(parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault().Value);
                    }
                }
                _logger.InfoLog(Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return result;
        }
        public Entity.BaseResponse<List<Response.DeviceUsageResponse>> GetQualityParameterByDevice(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.DeviceUsageResponse>> result = new Entity.BaseResponse<List<Response.DeviceUsageResponse>>();
            try
            {
                _logger.Information(Constants.ACTION_ENTRY, "GetQualityParameterByDevice.Get");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", request.DeviceGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("frequency", request.Frequency, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("attribute", request.Attribute, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("syncDate", DateTime.UtcNow, DbType.DateTime, ParameterDirection.Output));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Chart_QualityParameter]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Data = DataUtils.DataReaderToList<Response.DeviceUsageResponse>(dbDataReader, null);
                    if (parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault() != null)
                    {
                        result.LastSyncDate = Convert.ToString(parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault().Value);
                    }
                }
                _logger.InfoLog(Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return result;
        }
        public List<Response.EnergyUsageResponse> GetEnergyUsage(Request.ChartRequest request)
        {
            List<Response.EnergyUsageResponse> result = new List<Response.EnergyUsageResponse>();
            try
            {
                _logger.Information(Constants.ACTION_ENTRY, "Chart_StatisticsByEntity.Get");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", request.DeviceGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("entityGuid", request.EntityGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("frequency", request.Frequency, DbType.String, ParameterDirection.Input));
                    // parameters.Add(sqlDataAccess.CreateParameter("attribute", request.Attribute, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("syncDate", DateTime.UtcNow, DbType.DateTime, ParameterDirection.Output));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Chart_EnergyConsumption]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result = DataUtils.DataReaderToList<Response.EnergyUsageResponse>(dbDataReader, null);
                }
                _logger.InfoLog(Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return result;
        }
        public async Task<Entity.BaseResponse<List<Response.PowerBIAttributeResponse>>> GetPowerBIDataAsync(Request.PowerBIChartRequest request)
        {
            Entity.BaseResponse<List<Response.PowerBIAttributeResponse>> result = new Entity.BaseResponse<List<Response.PowerBIAttributeResponse>>(true);
            try
            {
                _logger.Information(Constants.ACTION_ENTRY, "Chart_GetPowerBIData.Get");
                var downloadStatus = await ImportForcastData(folderPath);
                if (!downloadStatus.IsSuccess)
                {
                    result.IsSuccess = false;
                    result.Message = downloadStatus.Message;
                }
                else 
                {
                    //Import Forcast Data and Retrive Historical data from database 
                    
                    using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                    {
                        List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                        parameters.Add(sqlDataAccess.CreateParameter("uniqueid", request.UniqueId, DbType.String, ParameterDirection.Input));                      
                        parameters.Add(sqlDataAccess.CreateParameter("attribute", request.Attribute, DbType.String, ParameterDirection.Input));
                        parameters.Add(sqlDataAccess.CreateParameter("companyGuid",SolutionConfiguration.CompanyId, DbType.Guid, ParameterDirection.Input));
                        if(!string.IsNullOrEmpty(downloadStatus.Data))
                        parameters.Add(sqlDataAccess.CreateParameter("attributeValues",  downloadStatus.Data , DbType.Xml, ParameterDirection.Input));
                        parameters.Add(sqlDataAccess.CreateParameter("syncDate", DateTime.UtcNow, DbType.DateTime, ParameterDirection.Output));
                        parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                        DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Chart_PowerBIQualityParameter]", CommandType.StoredProcedure, null), parameters.ToArray());
                        result.Data = DataUtils.DataReaderToList<Response.PowerBIAttributeResponse>(dbDataReader, null);
                        if (parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault() != null)
                        {
                            result.LastSyncDate = Convert.ToString(parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault().Value);
                        }
                    }
                  
                }
                _logger.InfoLog(Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Message = ex.Message;
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return result;
        }
        private static DataTable ConvertCSVtoDataTable(string strFilePath)
        {
            StreamReader sr = new StreamReader(strFilePath);
            string[] headers = sr.ReadLine().Split(',');
            DataTable dt = new DataTable();
            foreach (string header in headers)
            {
                dt.Columns.Add(header);
            }
            while (!sr.EndOfStream)
            {
                string[] rows = Regex.Split(sr.ReadLine(), ",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                DataRow dr = dt.NewRow();
                for (int i = 0; i < headers.Length; i++)
                {
                    dr[i] = rows[i];
                }

                dt.Rows.Add(dr);
            }
            return dt;
        }
        private static async Task<Entity.BaseResponse<string>> ImportForcastData(string folderPath)
        {
            Entity.BaseResponse<string> response = new Entity.BaseResponse<string>(false);
            try
            {
                
                string ticks = "_" + DateTime.UtcNow.Ticks + ".csv";
                var storageAccount = CloudStorageAccount.Parse(SolutionConfiguration.Configuration.CloudStorageAccount);
                var blobClient = storageAccount.CreateCloudBlobClient();
                // Get Blob Container
                var container = blobClient.GetContainerReference("iotdatastorage");
                // Get reference to blob (binary content)
                string forcastFileName = "MLProcessOutput/MLProcessForecastFile";
                var pageBlob = container.GetBlockBlobReference(forcastFileName + ".csv");
                string strFilePath = folderPath + forcastFileName + ticks;
                await pageBlob.DownloadToFileAsync(strFilePath, FileMode.OpenOrCreate);

                // response.Data = ConvertCSVtoDataTable(folderPath + forcastFileName + ticks);
                if (File.Exists(strFilePath))
                {
                    var lines = File.ReadAllLines(strFilePath);

                    string[] csvheaders = lines[0].Split(',').Select(x => x.Trim('\"')).ToArray();

                    XElement xml = new XElement("Items",
                       lines.Where((line, index) => index > 0).Select(line => new XElement("Item",
                          line.Split(',').Select((column, index) => new XElement(csvheaders[index], column)))));
                    //xml.Save(strFilePath.Replace(".csv", ".xml"));
                    response.Data = xml.ToString();
                    response.IsSuccess = true;
                }
                else {
                    response.Message = "File not found!";
                    response.Data =null;
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Data=null;
                response.Message = ex.Message;
            }
            return response;
        }
        //private static async Task<string> DownloadFile(string folderPath)
        //{
        //    try
        //    {

        //        string ticks = "_"+ DateTime.UtcNow.Ticks + ".csv";
        //        var storageAccount = CloudStorageAccount.Parse(SolutionConfiguration.Configuration.CloudStorageAccount);
        //        var blobClient = storageAccount.CreateCloudBlobClient();
        //        // Get Blob Container
        //        var container = blobClient.GetContainerReference("iotdatastorage");
        //        // Get reference to blob (binary content)
        //        string forcastFileName = "MLProcessOutput/MLProcessForecastFile";
        //        var pageBlob = container.GetBlockBlobReference(forcastFileName+".csv");
        //        await pageBlob.DownloadToFileAsync(folderPath + forcastFileName+ ticks, FileMode.OpenOrCreate);

        //        //second file
        //        // Get reference to blob (binary content)
        //        string anomalyFileName = "MLProcessOutput/MLProcessAnomalyFile";
        //        pageBlob = container.GetBlockBlobReference(anomalyFileName + ".csv");
        //        await pageBlob.DownloadToFileAsync(folderPath + anomalyFileName+ticks, FileMode.OpenOrCreate);
        //        //third file ETLProcessOutput/ETLProcessOutputFile.csv
        //        // Get reference to blob (binary content)
        //        string outputFileName = "ETLProcessOutput/ETLProcessOutputFile.csv";
        //        pageBlob = container.GetBlockBlobReference(outputFileName + ".csv");

        //        await pageBlob.DownloadToFileAsync(folderPath + outputFileName+ticks, FileMode.OpenOrCreate);
        //        return "Done";
        //    }
        //    catch (Exception ex) {
        //        return ex.Message;
        //    }

        //}
        public Entity.ActionStatus SendSubscriptionNotification()
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                _logger.InfoLog(LogHandler.Constants.ACTION_ENTRY, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = new List<DbParameter>();
                    System.Data.Common.DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Get_UserSubscriptionEndData]", CommandType.StoredProcedure, null), parameters.ToArray());
                    var result = DataUtils.DataReaderToList<Response.SubscriptionEndData>(dbDataReader, null);
                    foreach (var item in result)
                    {
                        _emailHelper.SendSubscriptionOverEmail(item.CustomerName, item.ExpiryDate.ToString("dd MMM yyy"), item.Email);
                    }
                }
                _logger.InfoLog(LogHandler.Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);

            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public List<Response.DeviceBatteryStatusResponse> GetDeviceBatteryStatus(Request.ChartRequest request)
        {
        
            Dictionary<string, string> parameters = new Dictionary<string, string>();
            parameters.Add("companyguid", request.CompanyGuid.ToString());
            parameters.Add("entityguid", request.EntityGuid.ToString());
            parameters.Add("hardwarekitguid", request.HardwareKitGuid.ToString());
            return _entityRepository.ExecuteStoredProcedure<Response.DeviceBatteryStatusResponse>("[GensetUsage_Get]", parameters);
        }

        public List<Response.FuelUsageResponse> GetFuelUsage(Request.ChartRequest request)
        {
            Dictionary<string, string> parameters = new Dictionary<string, string>();
            parameters.Add("companyguid", request.CompanyGuid.ToString());
            parameters.Add("entityguid", request.EntityGuid.ToString());
            parameters.Add("hardwarekitguid", request.HardwareKitGuid.ToString());
            return _entityRepository.ExecuteStoredProcedure<Response.FuelUsageResponse>("[ChartDate]", parameters);
        }
     
    }
}
