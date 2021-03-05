﻿CREATE TABLE [dbo].[TelemetrySummary_Hourwise] (
    [guid]       UNIQUEIDENTIFIER NOT NULL,
    [deviceGuid] UNIQUEIDENTIFIER NOT NULL,
    [date]       DATETIME         NOT NULL,
    [attribute]  NVARCHAR (1000)  NULL,
    [min]        DECIMAL(18, 3)              NULL,
    [max]        DECIMAL(18, 3)              NULL,
    [avg]        DECIMAL(18, 3)              NULL,
    [latest]     DECIMAL(18, 3)              NULL,
    [sum]        DECIMAL(18, 3)           NULL,
    PRIMARY KEY CLUSTERED ([guid] ASC)
);

