﻿/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName					nvarchar(255)
	,@syncDate	DATETIME
EXEC [dbo].[Chart_EnergyConsumption]	
	@entityGuid = '493256B8-F657-4CF1-8F7E-6B1FD473FEC8'
	,@guid	= 'C72E9BBB-FED3-4C14-B396-95177B09AFF6'
	,@frequency = 'D'
	,@invokinguser  = 'E05A4DA0-A8C5-4A4D-886D-F61EC802B5FD'              
	,@version		= 'v1'              
	,@output		= @output		OUTPUT
	,@fieldname		= @fieldName	OUTPUT
	,@syncDate		= @syncDate		OUTPUT

SELECT @output status, @fieldName fieldName, @syncDate syncDate

001	SR-4 05-05-2020 [Nishit Khakhi]	Added Initial Version to represent Energy consumption By Device / Entity
*******************************************************************/
CREATE PROCEDURE [dbo].[Chart_EnergyConsumption]
(	@entityGuid			UNIQUEIDENTIFIER		
	,@guid				UNIQUEIDENTIFIER	= NULL	
	,@frequency			CHAR(1)				
	,@invokinguser		UNIQUEIDENTIFIER	= NULL
	,@version			nvarchar(10)              
	,@output			SMALLINT			OUTPUT
	,@fieldname			nvarchar(255)		OUTPUT
	,@syncDate			DATETIME			OUTPUT
	,@culture			nvarchar(10)		= 'en-Us'	
	,@enabledebuginfo	CHAR(1)				= '0'
)
AS
BEGIN
    SET NOCOUNT ON

    IF (@enabledebuginfo = 1)
	BEGIN
        DECLARE @Param XML 
        SELECT @Param = 
        (
            SELECT 'Chart_EnergyConsumption' AS '@procName' 
            , CONVERT(nvarchar(MAX),@entityGuid) AS '@entityGuid' 
			, CONVERT(nvarchar(MAX),@guid) AS '@guid' 
			, CONVERT(nvarchar(MAX),@version) AS '@version' 
            , CONVERT(nvarchar(MAX),@invokinguser) AS '@invokinguser' 
            FOR XML PATH('Params')
	    ) 
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(nvarchar(MAX), @Param), GETUTCDATE())
    END                    
    
    BEGIN TRY  
		DECLARE @dt DATETIME = GETUTCDATE(), @endDate DATETIME
		IF OBJECT_ID ('tempdb..#ids') IS NOT NULL DROP TABLE #ids
		IF OBJECT_ID('tempdb..#weekdays') IS NOT NULL BEGIN DROP TABLE #weekdays END
		IF OBJECT_ID('tempdb..#EnergyConsumption') IS NOT NULL BEGIN DROP TABLE #EnergyConsumption END
		IF OBJECT_ID('tempdb..#finalTable') IS NOT NULL BEGIN DROP TABLE #finalTable END
		IF OBJECT_ID ('tempdb..#months') IS NOT NULL BEGIN DROP TABLE #months END
		CREATE TABLE [#months] ([date] DATE)
		CREATE TABLE #weekdays ([weekDay] NVARCHAR(20))
		CREATE TABLE #EnergyConsumption ([date] DATE, [Year] INT, [Month] INT, [name] NVARCHAR(20), [EnergyConsumption] DECIMAL(18,2)) 
		CREATE TABLE #finalTable ([date] DATE, [Year] INT, [Month] INT, [name] NVARCHAR(20), [EnergyConsumption] DECIMAL(18,2)) 

		SELECT E.[uniqueId] as [uniqueId], E.[guid] as [guid]
		INTO #ids
		FROM [dbo].[Entity] PN (NOLOCK) 
		INNER JOIN [dbo].[Device] E (NOLOCK) ON E.[entityGuid] = PN.[guid] 
		WHERE (E.[guid] = @guid OR PN.[guid] = @entityGuid)
		AND PN.isActive = 1 AND PN.isDeleted = 0 AND E.isDeleted = 0 AND E.isActive = 1

		IF @frequency = 'D'
		BEGIN
			SET @endDate = @dt
			INSERT INTO #weekdays values ('00:00'),('03:00'),('06:00'),('09:00'),('12:00'),('15:00'),('18:00'),('21:00')

			INSERT INTO #EnergyConsumption([name], [EnergyConsumption])
			SELECT CASE WHEN LEN(CONVERT(NVARCHAR(2),([Hour]*3))) < 2 THEN 
							'0' + CONVERT(NVARCHAR(2),([Hour]*3)) + ':00'  
						ELSE CONVERT(NVARCHAR(2),([Hour]*3)) + ':00'  
						END 
					AS [HH],[value] AS [EnergyConsumption]
			FROM ( 
				SELECT DATEPART(HOUR,[date])/3 AS [Hour],SUM([sum]) AS [value] 
				FROM #ids I 
				LEFT JOIN [dbo].[TelemetrySummary_Hourwise] T (NOLOCK) ON T.[deviceGuid] = I.[guid]
				WHERE [attribute] = 'currentin' AND CONVERT(Date,[date]) = CONVERT(DATE,@dt) 
				GROUP BY DATEPART(HOUR,[date])/3
				) [data]
			
		INSERT INTO #finalTable([name])
		SELECT [weekDay]
		FROM #weekDays
		
		UPDATE F
		SET [EnergyConsumption] = E.[EnergyConsumption]
		FROM #finalTable F
		LEFT JOIN #EnergyConsumption E ON E.[name] = F.[name]
		
		SELECT [name], [EnergyConsumption]
		FROM #finalTable
		ORDER BY 
			CASE [name] 
					WHEN '00:00' THEN 1
					WHEN '03:00' THEN 2
					WHEN '06:00' THEN 3
					WHEN '09:00' THEN 4
					WHEN '12:00' THEN 5
					WHEN '15:00' THEN 6
					WHEN '18:00' THEN 7
					WHEN '21:00' THEN 8
					ELSE 9
			END 
		END
		ELSE IF @frequency = 'W'
		BEGIN
			SET @endDate = DATEADD(DAY,-7,@dt)
			
			INSERT INTO [#months]
			SELECT CONVERT(DATE, DATEADD(DAY, (T.i - 6), @dt)) AS [Date]
			FROM (VALUES (6), (5), (4), (3), (2), (1), (0)) AS T(i)

			INSERT INTO #EnergyConsumption([date], [EnergyConsumption])
			SELECT CONVERT(DATE,[date]) AS [Day],SUM([sum]) AS [EnergyConsumption] 
				FROM #ids I 
				LEFT JOIN [dbo].[TelemetrySummary_Hourwise] T (NOLOCK) ON T.[deviceGuid] = I.[guid]
				WHERE [attribute] = 'currentin' AND CONVERT(Date,[date]) BETWEEN CONVERT(DATE,@endDate) AND CONVERT(DATE,@dt)
				GROUP BY CONVERT(DATE,[date])

			SELECT CONCAT(DATENAME(day, M.[date]), ' - ', FORMAT( M.[date], 'ddd')) AS [name]
				, ISNULL(R.[EnergyConsumption],0) [EnergyConsumption]
			FROM [#months] M
			LEFT OUTER JOIN #EnergyConsumption R ON R.[date] = M.[date]
			ORDER BY  M.[date]
		END
		ELSE
		BEGIN
			SET @endDate = DATEADD(YEAR,-1,@dt)
			
			INSERT INTO [#months]
			SELECT CONVERT(DATE, DATEADD(Month, (T.i - 11), @dt)) AS [Date]
			FROM (VALUES (11), (10), (9), (8), (7), (6), (5), (4), (3), (2), (1), (0)) AS T(i)

			INSERT INTO #EnergyConsumption([Year],[Month],[EnergyConsumption])
			SELECT DATEPART(YY,[date]) AS [Year], DATEPART(MM,[date]) AS [Month],SUM([sum]) AS [EnergyConsumption] 
			FROM #ids I 
			LEFT JOIN [dbo].[TelemetrySummary_Hourwise] T (NOLOCK) ON T.[deviceGuid] = I.[guid]
			WHERE [attribute] = 'currentin' AND CONVERT(Date,[date]) BETWEEN CONVERT(DATE,@endDate) AND CONVERT(DATE,@dt)
			GROUP BY DATEPART(YY,[date]), DATEPART(MM,[date]) 

			SELECT SUBSTRING(DATENAME(MONTH, M.[date]), 1, 3) + '-' + FORMAT(M.[date],'yy') AS [name]
				, ISNULL(R.[EnergyConsumption],0) [EnergyConsumption]
			FROM [#months] M
			LEFT OUTER JOIN #EnergyConsumption R ON R.[Month] = DATEPART(MM, M.[date]) AND R.[Year] = DATEPART(YY, M.[date]) 
			ORDER BY  M.[date]
		END
			
		SET @output = 1
		SET @fieldname = 'Success'  
		SET @syncDate = (SELECT TOP 1 CONVERT(DATETIME,[value]) FROM dbo.[Configuration] (NOLOCK) WHERE [configKey] = 'telemetry-last-exectime')
              
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