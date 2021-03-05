/*******************************************************************
DECLARE @output INT = 0
		,@fieldName	nvarchar(255)
		,@syncDate	DATETIME
EXEC [dbo].[CompanyStatistics_Get]
	 @guid				= '2D442AEA-E58B-4E8E-B09B-5602E1AA545A'	
	,@currentDate	= '2020-05-21 06:47:56.890'
	,@invokingUser  	= '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT
	,@syncDate		= @syncDate		OUTPUT
               
 SELECT @output status,  @fieldName AS fieldName, @syncDate syncDate    
 
001	SR-1 28-04-2020 [Nishit Khakhi]	Added Initial Version to Get Company Statistics
*******************************************************************/

CREATE PROCEDURE [dbo].[CompanyStatistics_Get]
(	 @guid				UNIQUEIDENTIFIER	
	,@currentDate		DATETIME			= NULL
	,@invokingUser		UNIQUEIDENTIFIER	= NULL
	,@version			NVARCHAR(10)
	,@output			SMALLINT		  OUTPUT
	,@fieldName			NVARCHAR(255)	  OUTPUT
	,@syncDate			DATETIME			OUTPUT
	,@culture			NVARCHAR(10)	  = 'en-Us'
	,@enableDebugInfo	CHAR(1)			  = '0'
)
AS
BEGIN
    SET NOCOUNT ON
	IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML
        SELECT @Param =
        (
            SELECT 'CompanyStatistics_Get' AS '@procName'
			, CONVERT(nvarchar(MAX),@guid) AS '@guid'
			, CONVERT(VARCHAR(50),@currentDate) as '@currentDate'
	        , CONVERT(nvarchar(MAX),@invokingUser) AS '@invokingUser'
			, CONVERT(nvarchar(MAX),@version) AS '@version'
			, CONVERT(nvarchar(MAX),@output) AS '@output'
            , CONVERT(nvarchar(MAX),@fieldName) AS '@fieldName'
            FOR XML PATH('Params')
	    )
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(nvarchar(MAX), @Param), GETUTCDATE())
    END
    Set @output = 1
    SET @fieldName = 'Success'

    BEGIN TRY
		SET @syncDate = (SELECT TOP 1 CONVERT(DATETIME,[value]) FROM dbo.[Configuration] (NOLOCK) WHERE [configKey] = 'telemetry-last-exectime')
		
		IF OBJECT_ID ('tempdb..#ids') IS NOT NULL DROP TABLE #ids

		CREATE TABLE #ids ([guid] UNIQUEIDENTIFIER,[companyGuid] UNIQUEIDENTIFIER, [uniqueId] NVARCHAR(500), [name] NVARCHAR(500))

		INSERT INTO #ids
		SELECT [guid], [companyGuid], [uniqueId], [name]
		FROM dbo.[Device] (NOLOCK) 
		WHERE [companyGuid] = @guid AND [isDeleted] = 0 

		;WITH CTE_Location
		AS (	SELECT [companyGuid], 
					COUNT([guid]) AS [totalLocation]
				FROM [dbo].[Entity] (NOLOCK) 
				WHERE [companyGuid] = @guid AND [isDeleted] = 0 
				and [Guid] not in (select entityGuid from [dbo].[Company] where [Guid]=@guid) 
				GROUP BY [companyGuid]
		)
		,CTE_DeviceCount
		AS (	SELECT [companyGuid]
						, SUM(CASE WHEN [isProvisioned] = 1 THEN 1 ELSE 0 END) [totalConnected] 
						, SUM(CASE WHEN [isProvisioned] = 0 THEN 1 ELSE 0 END) [totalDisConnected] 
				FROM [dbo].[Device] (NOLOCK) 
				WHERE [companyGuid] = @guid AND [isDeleted] = 0
				GROUP BY [companyGuid]
		)
		,CTE_UserCount
		AS (	SELECT [companyGuid]
		                , COUNT(1) [totalUserCount]
						, SUM(CASE WHEN [isActive] = 1 THEN 1 ELSE 0 END) [activeUserCount] 
						, SUM(CASE WHEN [isActive] = 0 THEN 1 ELSE 0 END) [inactiveUserCount] 
				FROM [dbo].[User] (NOLOCK) 
				WHERE [companyGuid] = @guid AND [isDeleted] = 0
				GROUP BY [companyGuid]
		)
		, CTE_Alerts
		AS (	SELECT [companyGuid], COUNT([guid]) AS [totalAlert]
				FROM [dbo].[IOTConnectAlert] I (NOLOCK)
				WHERE I.[companyGuid] = @guid AND CONVERT(DATE,[eventDate]) = CONVERT(DATE,GETUTCDATE())
				GROUP BY [companyGuid]
		)
		, CTE_Maintenance
		AS (	SELECT DM.[companyGuid] AS [companyGuid]
					, CASE WHEN @currentDate >= [startDate] AND @currentDate <= [endDate]
						THEN 'Under Maintenance'
						ELSE CASE WHEN [startDate] < @currentDate AND [endDate] < @currentDate 
						THEN 'Completed'
						ELSE 'Scheduled'
						END
						END AS [status]
				FROM dbo.[DeviceMaintenance] DM (NOLOCK) 
				WHERE DM.[companyGuid] = @guid 
					AND [IsDeleted]=0 
			)
		,CTE_EnergyCount
		AS (	SELECT E.[companyGuid]
						, SUM([sum]) [energyCount]
				FROM [dbo].[TelemetrySummary_HourWise] T (NOLOCK) 
				INNER JOIN #ids E (NOLOCK) ON T.[deviceGuid] = E.[guid]
				WHERE [attribute] = 'currentin'
				GROUP BY E.[companyGuid]
		)
		,CTE_DeviceEnergyCount
		AS (	SELECT T.[deviceGuid]
						, SUM([sum]) [energyCount]
				FROM [dbo].[TelemetrySummary_HourWise] T (NOLOCK) 
				INNER JOIN #ids E (NOLOCK) ON T.[deviceGuid] = E.[guid]
				WHERE [attribute] = 'currentin'
				GROUP BY T.[deviceGuid]
		)
		SELECT [guid]
				, ISNULL(L.[totalLocation],0) AS [totalEntities]
				, ISNULL(D.[totalConnected],0) AS [totalConnected]
				, ISNULL(D.[totalDisConnected],0) AS [totalDisConnected]
				, ISNULL(D.[totalDisConnected],0) + ISNULL(d.[totalConnected],0) AS [totalDevices]
				, ISNULL(A.[totalAlert],0) AS [totalAlerts]
				, ISNULL( U.[activeUserCount],0) AS [activeUserCount]
				, ISNULL( U.[inactiveUserCount],0) AS [inactiveUserCount]
				, ISNULL( U.[totalUserCount],0) AS [totalUserCount]
				, ISNULL(CM.[underMaintenanceCount],0) AS [totalUnderMaintenanceCount]
				, 0 AS [totalScheduledMaintenanceCount]
				, ROUND(ISNULL(Ec.[energyCount],0),3) AS [totalEnergyCount]
				, ISNULL(MinCount.[name],'') AS [minDeviceName]
				, ROUND(ISNULL(MinCount.[minCount],0),3) AS [minDeviceCount]
				, ISNULL(MaxCount.[name],'') AS [maxDeviceName]
				, ROUND(ISNULL(MaxCount.[maxCount],0),3) AS [maxDeviceCount]
		FROM [dbo].[Company] C (NOLOCK) 
		LEFT JOIN CTE_Location L ON C.[guid] = L.[companyGuid]
		LEFT JOIN CTE_DeviceCount D ON C.[guid] = D.[companyGuid]
		LEFT JOIN CTE_Alerts A ON C.[guid] = A.[companyGuid]
		LEFT JOIN CTE_UserCount U ON C.[guid] = U.[companyGuid]
		LEFT JOIN (SELECT M.[companyGuid], COUNT(1) AS [underMaintenanceCount]
					FROM CTE_Maintenance M 
					WHERE M.[status] IN ('Under Maintenance','Scheduled')
					GROUP BY M.[companyGuid]) CM ON C.[guid] = CM.[companyGuid]
		LEFT JOIN CTE_EnergyCount EC ON C.[guid] = EC.[companyGuid]
		LEFT JOIN 
			(SELECT	TOP	1 E.[companyGuid], 
				E.[name],
				MIN([energyCount]) as [minCount]
			 FROM CTE_DeviceEnergyCount CDE 
			 INNER JOIN #ids E ON CDE.[deviceGuid] = E.[guid]
			 GROUP BY E.[companyGuid],E.[name]
			 ORDER BY [minCount] ASC 
			) MinCount ON MinCount.[companyGuid] = C.[guid]
		LEFT JOIN 
			(SELECT	TOP	1 E.[companyGuid], 
				E.[name],
				MAX([energyCount]) as [maxCount]
			 FROM CTE_DeviceEnergyCount CDE 
			 INNER JOIN #ids E ON CDE.[deviceGuid] = E.[guid]
			 GROUP BY E.[companyGuid],E.[name]
			 ORDER BY [maxCount] DESC 
			) MaxCount ON MaxCount.[companyGuid] = C.[guid]
		WHERE C.[guid]=@guid AND C.[isDeleted]=0
		
	END TRY
	BEGIN CATCH
		DECLARE @errorReturnMessage nvarchar(MAX)

		SET @output = 0

		SELECT @errorReturnMessage =
			ISNULL(@errorReturnMessage, '') +  SPACE(1)   +
			'ErrorNumber:'  + ISNULL(CAST(ERROR_NUMBER() as nvarchar), '')  +
			'ErrorSeverity:'  + ISNULL(CAST(ERROR_SEVERITY() as nvarchar), '') +
			'ErrorState:'  + ISNULL(CAST(ERROR_STATE() as nvarchar), '') +
			'ErrorLine:'  + ISNULL(CAST(ERROR_LINE () as nvarchar), '') +
			'ErrorProcedure:'  + ISNULL(CAST(ERROR_PROCEDURE() as nvarchar), '') +
			'ErrorMessage:'  + ISNULL(CAST(ERROR_MESSAGE() as nvarchar(max)), '')
		RAISERROR (@errorReturnMessage, 11, 1)

		IF (XACT_STATE()) = -1
		BEGIN
			ROLLBACK TRANSACTION
		END
		IF (XACT_STATE()) = 1
		BEGIN
			ROLLBACK TRANSACTION
		END
		RAISERROR (@errorReturnMessage, 11, 1)
	END CATCH
END