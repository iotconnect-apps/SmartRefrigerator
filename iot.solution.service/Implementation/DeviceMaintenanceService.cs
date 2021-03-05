﻿using component.helper;
using component.logger;
using iot.solution.common;
using iot.solution.model.Repository.Interface;
using iot.solution.service.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using Entity = iot.solution.entity;
using Model = iot.solution.model.Models;

namespace iot.solution.service.Implementation
{
    public class DeviceMaintenanceService : IDeviceMaintenanceService
    {
        private readonly IDeviceMaintenanceRepository _deviceMaintenanceRepository;
        private readonly IEntityRepository _entityRepository;


        private readonly IotConnectClient _iotConnectClient;
        private readonly ILogger _logger;

        public DeviceMaintenanceService(IDeviceMaintenanceRepository entityMaintenanceRepository, IEntityRepository entityRepository,ILogger logger)
        {
            _logger = logger;
            _deviceMaintenanceRepository = entityMaintenanceRepository;
            _entityRepository = entityRepository;
            _iotConnectClient = new IotConnectClient(SolutionConfiguration.BearerToken, SolutionConfiguration.Configuration.EnvironmentCode, SolutionConfiguration.Configuration.SolutionKey);
        }
      
        public List<Entity.DeviceMaintenance> Get()
        {
            try
            {

                return _deviceMaintenanceRepository.GetAll().Select(p => Mapper.Configuration.Mapper.Map<Entity.DeviceMaintenance>(p)).ToList();
            }
            catch (Exception ex)
            {

                _logger.Error(Constants.ACTION_EXCEPTION, "DeviceMaintenance.GetAll " + ex);
                return new List<Entity.DeviceMaintenance>();
            }
        }
        public Entity.DeviceMaintenanceDetail Get(Guid id, DateTime currentDate, string timeZone)
        {
            Entity.DeviceMaintenanceDetail maintenance = new Entity.DeviceMaintenanceDetail();
            try
            {
                //maintenance = _deviceMaintenanceRepository
                //    .FindBy(t => t.Guid == id).Select(p => Mapper.Configuration.Mapper.Map<Entity.DeviceMaintenance>(p)).FirstOrDefault();
                maintenance = _deviceMaintenanceRepository.Get(id,Convert.ToDateTime(currentDate),timeZone);
                return maintenance;
                
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, "DeviceMaintenance.Get " + ex);
                return null;
            }
        }
        public Entity.ActionStatus Manage(Entity.DeviceMaintenance request)
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                if (request.Guid == null || request.Guid == Guid.Empty)
                {
                    var dbDeviceMaintenance = Mapper.Configuration.Mapper.Map<Entity.DeviceMaintenance, Model.DeviceMaintenance>(request);
                    dbDeviceMaintenance.Guid = request.Guid;
                    dbDeviceMaintenance.CompanyGuid = SolutionConfiguration.CompanyId;
                    DateTime dateValue;
                    if (DateTime.TryParse(request.StartDate.ToString(), out dateValue))
                    {
                        dbDeviceMaintenance.StartDate = dateValue.AddMinutes(int.Parse(request.TimeZone));
                    }
                    if (DateTime.TryParse(request.EndDate.ToString(), out dateValue))
                    {
                        dbDeviceMaintenance.EndDate = dateValue.AddMinutes(int.Parse(request.TimeZone));
                    }
                    actionStatus = _deviceMaintenanceRepository.Manage(dbDeviceMaintenance);
                    if (actionStatus.Data != null)
                    {
                        actionStatus.Data = Get(actionStatus.Data,DateTime.Now,request.TimeZone);
                    }
                    if (!actionStatus.Success)
                    {
                        _logger.Error($"DeviceMaintenance is not added, Error: {actionStatus.Message}");
                        actionStatus.Success = false;
                        actionStatus.Message = actionStatus.Message;
                    }
                }
                else
                {
                    var olddbElevatorMaintenance = _deviceMaintenanceRepository.FindBy(x => x.Guid.Equals(request.Guid)).FirstOrDefault();
                    if (olddbElevatorMaintenance == null)
                    {
                        throw new NotFoundCustomException($"{CommonException.Name.NoRecordsFound} : DeviceMaintenance");
                    }
                    var dbElevatorMaintenance = Mapper.Configuration.Mapper.Map(request, olddbElevatorMaintenance);
                    dbElevatorMaintenance.CompanyGuid = SolutionConfiguration.CompanyId;
                    DateTime dateValue;
                    if (DateTime.TryParse(request.StartDate.ToString(), out dateValue))
                    {
                        dbElevatorMaintenance.StartDate = dateValue.AddMinutes(int.Parse(request.TimeZone));
                    }
                    if (DateTime.TryParse(request.EndDate.ToString(), out dateValue))
                    {
                        dbElevatorMaintenance.EndDate = dateValue.AddMinutes(int.Parse(request.TimeZone));
                    }
                    actionStatus = _deviceMaintenanceRepository.Manage(dbElevatorMaintenance);
                    if (actionStatus.Data != null)
                    {
                        actionStatus.Data = Mapper.Configuration.Mapper.Map<Model.DeviceMaintenance, Entity.DeviceMaintenance>(dbElevatorMaintenance);
                    }
                    if (!actionStatus.Success)
                    {
                        _logger.Error($"DeviceMaintenance is not updated , Error: {actionStatus.Message}");
                        actionStatus.Success = false;
                        actionStatus.Message = actionStatus.Message;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, "DeviceMaintenanceManager.Delete " + ex);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.ActionStatus Delete(Guid id)
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                var dbElevatorMaintenance = _deviceMaintenanceRepository.FindBy(x => x.Guid.Equals(id)).FirstOrDefault();
                if (dbElevatorMaintenance == null)
                {
                    throw new NotFoundCustomException($"{CommonException.Name.NoRecordsFound} : DeviceMaintenance");
                }
                dbElevatorMaintenance.IsDeleted = true;             
                return _deviceMaintenanceRepository.Update(dbElevatorMaintenance);     
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, "DeviceMaintenanceManager.Delete " + ex);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.SearchResult<List<Entity.DeviceMaintenanceDetail>> List(Entity.SearchRequest request)
        {
            try
            {
                var result = _deviceMaintenanceRepository.List(request);
                return new Entity.SearchResult<List<Entity.DeviceMaintenanceDetail>>()
                {
                    Items = result.Items.Select(p => Mapper.Configuration.Mapper.Map<Entity.DeviceMaintenanceDetail>(p)).ToList(),
                    Count = result.Count
                };
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, $"DeviceMaintenanceService.List, Error: {ex.Message}");
                return new Entity.SearchResult<List<Entity.DeviceMaintenanceDetail>>();
            }
        }
        //public Entity.ActionStatus UpdateStatus(Guid id, string status)
        //{
        //    Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
        //    try
        //    {
        //        var dbElevatorMaintenance = _deviceMaintenanceRepository.FindBy(x => x.Guid.Equals(id)).FirstOrDefault();
        //        if (dbElevatorMaintenance == null)
        //        {
        //            throw new NotFoundCustomException($"{CommonException.Name.NoRecordsFound} : DeviceMaintenance");
        //        }               
        //            dbElevatorMaintenance.Status = status.ToString();                    
        //            return _deviceMaintenanceRepository.Update(dbElevatorMaintenance);   
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.Error(Constants.ACTION_EXCEPTION, "DeviceMaintenance.UpdateStatus " + ex);
        //        actionStatus.Success = false;
        //        actionStatus.Message = ex.Message;
        //    }
        //    return actionStatus;
        //}

        public List<Entity.DeviceMaintenanceResponse> GetUpComingList(Entity.DeviceMaintenanceRequest request)
        {
            try
            {
                if (request.currentDate.HasValue)
                {
                    DateTime dateValue;
                    if (DateTime.TryParse(request.currentDate.Value.ToString(), out dateValue))
                    {
                        dateValue = dateValue.AddMinutes(int.Parse(request.timeZone));
                    }
                    request.currentDate = dateValue;
                }
                return _deviceMaintenanceRepository.GetUpComingList(request);
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, $"DeviceMaintenanceService.List, Error: {ex.Message}");
                return new List<Entity.DeviceMaintenanceResponse>();
            }
        }
        public Entity.BaseResponse<Entity.DeviceSceduledMaintenanceResponse> GetDeviceScheduledMaintenance(Guid deviceId,DateTime currentDate,string timeZone)
        {
            try
            {
                return _deviceMaintenanceRepository.GetDeviceScheduledMaintenance(deviceId,currentDate,timeZone);
            }
            catch (Exception ex)
            {
                _logger.Error(Constants.ACTION_EXCEPTION, $"DeviceMaintenanceService.Get, Error: {ex.Message}");
                return new Entity.BaseResponse<Entity.DeviceSceduledMaintenanceResponse>();
            }
        }
    }
}
