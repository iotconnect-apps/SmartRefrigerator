﻿CREATE TABLE [dbo].[DeviceMaintenance]
(	[guid]         UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [companyGuid]  UNIQUEIDENTIFIER NOT NULL,
    [entityGuid]   UNIQUEIDENTIFIER NOT NULL,
    [deviceGuid] UNIQUEIDENTIFIER NOT NULL,
    [description]  NVARCHAR (1000)  NULL,
    [createdDate]  DATETIME         NULL,
    [startDate]	DATETIME		NULL,
	[endDate]	DATETIME		NULL,
    [isDeleted] BIT Default (0) NOT NULL
)
