/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName	NVARCHAR(255)	
	,@syncDate	DATETIME
EXEC [dbo].[Chart_QualityParameter]	
	@guid	= 'C72E9BBB-FED3-4C14-B396-95177B09AFF6'
	,@attribute	= 'PH'
	,@frequency = 'D'
	,@invokinguser  = 'E05A4DA0-A8C5-4A4D-886D-F61EC802B5FD'              
	,@version		= 'v1'              
	,@output		= @output		OUTPUT
	,@fieldname		= @fieldName	OUTPUT
	,@syncDate		= @syncDate		OUTPUT

SELECT @output status, @fieldName fieldName, @syncDate syncDate

001	SR-4 05-05-2020 [Nishit Khakhi]	Added Initial Version to represent attribute value by device
*******************************************************************/
CREATE PROCEDURE [dbo].[Chart_QualityParameter]
(	@guid				UNIQUEIDENTIFIER	= NULL
	,@entityGuid		UNIQUEIDENTIFIER	= NULL
	,@attribute			NVARCHAR(100)
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
            SELECT 'Chart_QualityParameterByBuilding' AS '@procName' 
            , CONVERT(nvarchar(MAX),@guid) AS '@guid' 
			, CONVERT(nvarchar(MAX),@entityGuid) AS '@entityGuid' 
			, CONVERT(nvarchar(2),@frequency) AS '@frequency' 
			, CONVERT(nvarchar(MAX),@version) AS '@version' 
            , CONVERT(nvarchar(MAX),@invokinguser) AS '@invokinguser' 
            FOR XML PATH('Params')
	    ) 
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(nvarchar(MAX), @Param), GETUTCDATE())
    END                    
    
    BEGIN TRY  
		
		DECLARE @startDate DATETIME, @endDate DATETIME
		DECLARE @dt DATETIME = GETUTCDATE(), @uniqueId NVARCHAR(500)

		SELECT Top 1 @uniqueId = [uniqueId]
		FROM dbo.[Device] (NOLOCK) WHERE [guid] = @guid AND [isDeleted] = 0
		
		IF OBJECT_ID('tempdb..#weekdays') IS NOT NULL BEGIN DROP TABLE #weekdays END
		IF OBJECT_ID('tempdb..#OperationHours') IS NOT NULL BEGIN DROP TABLE #OperationHours END
		IF OBJECT_ID('tempdb..#finalTable') IS NOT NULL BEGIN DROP TABLE #finalTable END
		IF OBJECT_ID ('tempdb..#ids') IS NOT NULL DROP TABLE #ids

		CREATE TABLE #weekdays ([weekDay] NVARCHAR(20))
		CREATE TABLE #OperationHours ([name] NVARCHAR(20), [attribute] NVARCHAR(1000), [uniqueId] NVARCHAR(500), [OperatingHours] DECIMAL(18,2)) 
		CREATE TABLE #finalTable ([name] NVARCHAR(20), [attribute] NVARCHAR(1000), [uniqueId] NVARCHAR(500), [OperatingHours] DECIMAL(18,2)) 
		
		SELECT E.[uniqueId] as [uniqueId], E.[guid] as [guid]
		INTO #ids
		FROM [dbo].[Entity] PN (NOLOCK) 
		INNER JOIN [dbo].[Device] E (NOLOCK) ON E.[entityGuid] = PN.[guid] 
		WHERE (E.[guid] = @guid OR PN.[guid] = @entityGuid)
		AND PN.isActive = 1 AND PN.isDeleted = 0 AND E.isDeleted = 0 AND E.isActive = 1

		IF @frequency = 'D'
		BEGIN
			INSERT INTO #weekdays values ('00:00'),('03:00'),('06:00'),('09:00'),('12:00'),('15:00'),('18:00'),('21:00')

			INSERT INTO #OperationHours ([name],[OperatingHours])
			SELECT CASE WHEN LEN(CONVERT(NVARCHAR(2),([Hour]*3))) < 2 THEN 
							'0' + CONVERT(NVARCHAR(2),([Hour]*3)) + ':00'  
						ELSE CONVERT(NVARCHAR(2),([Hour]*3)) + ':00'  
						END 
					AS [HH],[OperatingHours]
			FROM ( 
				SELECT DATEPART(HOUR,[date])/3 AS [Hour]
					,SUM(ROUND(CONVERT(DECIMAL(18,7),[sum]),2)) AS [OperatingHours] 
				FROM #ids I 
				LEFT JOIN [dbo].[TelemetrySummary_Hourwise] T (NOLOCK) ON T.[deviceGuid] = I.[guid]
				WHERE [attribute] = @attribute AND @attribute = 'currentin' AND CONVERT(Date,[date]) = CONVERT(DATE,@dt)
				GROUP BY DATEPART(HOUR,[date])/3
				UNION ALL
				SELECT DATEPART(HOUR,[date])/3 AS [Hour]
					,AVG(ROUND(CONVERT(DECIMAL(18,7),[avg]),2)) AS [OperatingHours] 
				FROM #ids I 
				LEFT JOIN [dbo].[TelemetrySummary_Hourwise] T (NOLOCK) ON T.[deviceGuid] = I.[guid]
				WHERE [attribute] = @attribute AND @attribute <> 'currentin' AND CONVERT(Date,[date]) = CONVERT(DATE,@dt)
				GROUP BY DATEPART(HOUR,[date])/3
				) [data]
			
		INSERT INTO #finalTable([name])
		SELECT [weekDay]
		FROM #weekDays
		CROSS JOIN #ids

		UPDATE F
		SET [OperatingHours] = O.[OperatingHours]
		FROM #finalTable F
		LEFT JOIN #OperationHours O ON O.[name] = F.[name]

		SELECT [name], ISNULL([OperatingHours],0) AS [value]
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

			IF OBJECT_ID ('tempdb..#wresult') IS NOT NULL BEGIN DROP TABLE #result END
			CREATE TABLE [#wresult] ([DATE] DATETIME, [value] DECIMAL(18,2))

			SET @startDate = @dt - 7 
			SET @endDate = @dt
									
			INSERT INTO [#wresult]
			SELECT CONVERT(Date,T.[date]), SUM(ROUND(CONVERT(DECIMAL(18,7),[sum]),2)) AS [value] 
			FROM #ids I 
			INNER JOIN [dbo].[TelemetrySummary_Hourwise] T (NOLOCK) ON T.[deviceGuid] = I.[guid]
			WHERE [attribute] = @attribute AND @attribute = 'currentin' AND CONVERT(Date,T.[date]) BETWEEN CONVERT(DATE,@startDate) AND CONVERT(DATE,@endDate)
			GROUP BY CONVERT(Date,T.[date])
			UNION ALL
			SELECT CONVERT(Date,T.[date]),AVG(ROUND(CONVERT(DECIMAL(18,7),[avg]),2)) AS [value] 
			FROM #ids I 
			INNER JOIN [dbo].[TelemetrySummary_Hourwise] T (NOLOCK) ON T.[deviceGuid] = I.[guid]
			WHERE [attribute] = @attribute AND @attribute <> 'currentin' AND CONVERT(Date,T.[date]) BETWEEN CONVERT(DATE,@startDate) AND CONVERT(DATE,@endDate)
			GROUP BY CONVERT(Date,T.[date])
			
			SELECT CONCAT(DATENAME(day, DATEADD(DAY, (T.i - 6), @endDate)), ' - ', FORMAT( DATEADD(DAY, (T.i - 6), @endDate), 'ddd')) AS [name]
			, ISNULL(RES.[value],0) AS [value]
			FROM (VALUES (6), (5), (4), (3), (2), (1), (0)) AS T(i)
			LEFT OUTER JOIN ( SELECT * FROM [#wresult]) RES ON RES.[DATE] = DATEADD(DAY, (T.i - 6), CAST(@endDate AS Date))
			ORDER BY DATEADD(DAY, (T.i - 6), @endDate)
			
		END
		ELSE
		BEGIN

			IF OBJECT_ID ('tempdb..#result') IS NOT NULL BEGIN DROP TABLE #result END
			CREATE TABLE #result ([year] INT, [month] TINYINT, [localName] NVARCHAR(1000), [value] DECIMAL(18,2))

			IF OBJECT_ID ('tempdb..#months') IS NOT NULL BEGIN DROP TABLE #months END
			CREATE TABLE [#months] ([date] DATETIME)

			INSERT INTO [#months]
			SELECT CONVERT(DATE, DATEADD(Month, (T.i - 11), @dt)) AS [Date]
			FROM (VALUES (11), (10), (9), (8), (7), (6), (5), (4), (3), (2), (1), (0)) AS T(i)

			SELECT @startDate = MIN(CONVERT(DATE, [Date] - DAY([Date]) + 1)), @endDate = MAX(CONVERT(DATE,EOMONTH([Date])))
			FROM [#months]

			INSERT INTO #result
			SELECT DATEPART(YY,[date]), DATEPART(MM,[date]), [attribute], AVG(ROUND(CONVERT(DECIMAL(18,7),[avg]),2)) AS [value] 
			FROM #ids I 
			INNER JOIN [dbo].[TelemetrySummary_Hourwise] T (NOLOCK) ON T.[deviceGuid] = I.[guid]
			WHERE [attribute] = @attribute AND @attribute <> 'currentin' AND ( CONVERT(Date,T.[date]) BETWEEN @startDate AND @endDate) 
			GROUP BY DATEPART(YY,[date]), DATEPART(MM,[date]), [attribute]
			UNION ALL
			SELECT DATEPART(YY,[date]), DATEPART(MM,[date]), [attribute], SUM(ROUND(CONVERT(DECIMAL(18,7),[sum]),2)) AS [value] 
			FROM #ids I 
			INNER JOIN [dbo].[TelemetrySummary_Hourwise] T (NOLOCK) ON T.[deviceGuid] = I.[guid]
			WHERE [attribute] = @attribute AND @attribute = 'currentin' AND ( CONVERT(Date,T.[date]) BETWEEN @startDate AND @endDate) 
			GROUP BY DATEPART(YY,[date]), DATEPART(MM,[date]), [attribute]
			
			SELECT SUBSTRING(DATENAME(MONTH, M.[date]), 1, 3) + '-' + FORMAT(M.[date],'yy') AS [name]
					, ISNULL(R.[value],0) [value]
			FROM [#months] M
			LEFT OUTER JOIN #result R ON R.[Month] = DATEPART(MM, M.[date]) AND R.[Year] = DATEPART(YY, M.[date]) 
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