/*******************************************************************
DECLARE @count INT
     	,@output INT = 0
		,@fieldName	VARCHAR(255)

EXEC [dbo].[Entity_List]
	 @companyGuid	= 'AB469212-2488-49AD-BC94-B3A3F45590D2'
	,@currentDate	= '2020-05-21 06:47:56.890'
	,@pageSize		= 10
	,@pageNumber	= 1
	,@orderby		= NULL
	,@count			= @count OUTPUT
	,@invokingUser  = 'C1596B8C-7065-4D63-BFD0-4B835B93DFF2'
	,@version		= 'v1'
	,@output		= @output	OUTPUT
	,@fieldName		= @fieldName	OUTPUT

SELECT @count count, @output status, @fieldName fieldName

001	SR-1	28-04-2019 [Nishit Khakhi]	Added Initial Version to List Entity
*******************************************************************/
CREATE PROCEDURE [dbo].[Entity_List]
(   @companyGuid		UNIQUEIDENTIFIER
	,@currentDate		DATETIME			= NULL
	,@search			VARCHAR(100)		= NULL
	,@pageSize			INT
	,@pageNumber		INT
	,@orderby			VARCHAR(100)		= NULL
	,@invokingUser		UNIQUEIDENTIFIER
	,@version			VARCHAR(10)
	,@culture			VARCHAR(10)			= 'en-Us'
	,@output			SMALLINT			OUTPUT
	,@fieldName			VARCHAR(255)		OUTPUT
	,@count				INT					OUTPUT
	,@enableDebugInfo	CHAR(1)				= '0'
)
AS
BEGIN
    SET NOCOUNT ON

    IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML
        SELECT @Param =
        (
            SELECT 'Entity_List' AS '@procName'
            	, CONVERT(VARCHAR(MAX),@companyGuid) AS '@companyGuid'
				, CONVERT(VARCHAR(50),@currentDate) as '@currentDate'
				, CONVERT(VARCHAR(MAX),@search) AS '@search'
				, CONVERT(VARCHAR(MAX),@pageSize) AS '@pageSize'
				, CONVERT(VARCHAR(MAX),@pageNumber) AS '@pageNumber'
				, CONVERT(VARCHAR(MAX),@orderby) AS '@orderby'
				, CONVERT(VARCHAR(MAX),@version) AS '@version'
            	, CONVERT(VARCHAR(MAX),@invokingUser) AS '@invokingUser'
            FOR XML PATH('Params')
	    )
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(VARCHAR(MAX), @Param), GETDATE())
    END
    
    BEGIN TRY

		SET	@output = 1
		SET @count = -1

		IF OBJECT_ID('tempdb..#temp_Entity') IS NOT NULL DROP TABLE #temp_Entity
		
		CREATE TABLE #temp_Entity
		(	[guid]						UNIQUEIDENTIFIER
			,[name]						NVARCHAR(500)
			,[type]						NVARCHAR(100)
			,[description]				NVARCHAR(1000)
			,[address]					NVARCHAR(500)
			,[address2]					NVARCHAR(500)
			,[city]						NVARCHAR(50)
			,[zipCode]					NVARCHAR(10)
			,[stateGuid]				UNIQUEIDENTIFIER NULL
			,[countryGuid]				UNIQUEIDENTIFIER NULL
			,[image]					NVARCHAR(250)
			,[latitude]					NVARCHAR(50)
			,[longitude]				NVARCHAR(50)
			,[isActive]					BIT
			,[totalDevices]				BIGINT
			,[totalConnected]			BIGINT
			,[totalDisconnected]		BIGINT
			,[totalAlert]				BIGINT
			,[totalUnderMaintenance]	BIGINT
			,[rowNum]					INT
		)

		IF LEN(ISNULL(@orderby, '')) = 0
		SET @orderby = 'name asc'

		DECLARE @Sql nvarchar(MAX) = ''

		SET @Sql = '
		
		SELECT
			*
			,ROW_NUMBER() OVER (ORDER BY '+@orderby+') AS rowNum
		FROM
		(
			SELECT
			L.[guid]
			, L.[name]
			, L.[type]
			, L.[description]
			, L.[address] 
			, L.[address2] AS address2
			, L.[city]
			, L.[zipCode]
			, L.[stateGuid]
			, L.[countryGuid]
			, L.[image]
			, L.[latitude]
			, L.[longitude]
			, L.[isActive]	
			, 0 AS [totalDevices]	
			, 0 AS [totalConnected]
			, 0 AS [totalDisconnected]
			, 0 AS [totalAlert]
			, 0 As [totalUnderMaintenance]
			FROM [dbo].[Entity] AS L WITH (NOLOCK) 
			 WHERE L.[companyGuid]=@companyGuid AND L.[isDeleted]=0 '
			  + ' and L.Guid not in (select entityGuid from [dbo].[Company] where [Guid]=@companyGuid) '
			+ CASE WHEN @search IS NULL THEN '' ELSE
			' AND (L.name LIKE ''%' + @search + '%''
			  OR L.address LIKE ''%' + @search + '%''
			  OR L.address2 LIKE ''%' + @search + '%''
			  OR L.zipCode LIKE ''%' + @search + '%''
			)'
			 END +
		' )  data '
		
		INSERT INTO #temp_Entity
		EXEC sp_executesql 
			  @Sql
			, N'@orderby VARCHAR(100), @companyGuid UNIQUEIDENTIFIER '
			, @orderby		= @orderby			
			, @companyGuid	= @companyGuid			
			
		SET @count = @@ROWCOUNT
		
		;with CTE
		AS (
			SELECT L.[guid]
					,COUNT(G.[guid]) [totalCount]
					, SUM(CASE WHEN [isProvisioned] = 1 THEN 1 ELSE 0 END) [totalConnected] 
					, SUM(CASE WHEN [isProvisioned] = 0 THEN 1 ELSE 0 END) [totalDisConnected] 
			FROM [dbo].[Device] G (NOLOCK)
			INNER JOIN #temp_Entity L ON G.[entityGuid] = L.[guid]
			WHERE G.[isDeleted] = 0
			GROUP BY L.[guid]
		)
		, CTE_Alerts
		AS (	SELECT L.[guid], COUNT(I.[guid]) AS [totalAlert]
				FROM [dbo].[IOTConnectAlert] I (NOLOCK)
				INNER JOIN #temp_Entity L ON I.[entityGuid] = L.[guid]
				WHERE I.[companyGuid] = @companyGuid
				GROUP BY L.[guid]
		)
		, CTE_Maintenance
		AS (	SELECT L.[guid]
					, CASE WHEN @currentDate >= DM.[startDate] AND @currentDate <= DM.[endDate]
						THEN 'Under Maintenance'
						ELSE CASE WHEN DM.[startDate] < @currentDate AND DM.[endDate] < @currentDate 
						THEN 'Completed'
						ELSE 'Scheduled'
						END
						END AS [status]
				FROM dbo.[DeviceMaintenance] DM (NOLOCK) 
				INNER JOIN #temp_Entity L ON DM.[entityGuid] = L.[guid]
				WHERE DM.[companyGuid] = @companyGuid AND DM.[isDeleted] = 0
			)

		UPDATE L
		SET [totalDevices]				= ISNULL(C.[totalCount],0) 
			, [totalConnected]			= ISNULL(C.[totalConnected],0)
			, [totalDisconnected]		= ISNULL(C.[totalDisconnected],0)
			, [totalAlert]				= ISNULL(alert.[totalAlert],0)
			, [totalUnderMaintenance]	= ISNULL(CM.[underMaintenanceCount],0)
		FROM #temp_Entity L
		LEFT JOIN CTE C ON L.[guid] = C.[guid]
		LEFT JOIN CTE_Alerts AS alert ON L.[guid] = alert.[guid] 
		LEFT JOIN (SELECT M.[guid], COUNT(1) AS [underMaintenanceCount]
					FROM CTE_Maintenance M 
					WHERE M.[status] IN ('Under Maintenance','Scheduled')
					GROUP BY M.[guid]) CM ON L.[guid] = CM.[guid] 
		
		IF(@pageSize <> -1 AND @pageNumber <> -1)
			BEGIN
				SELECT 
					L.[guid]
					, L.[name]
					, L.[type]
					, L.[description]
					, L.[address] 
					, L.[address2] AS address2
					, L.[city]
					, L.[zipCode]
					, L.[stateGuid]
					, L.[countryGuid]
					, L.[image]
					, L.[latitude]
					, L.[longitude]
					, L.[isActive]
					, L.[totalDevices]	
					, L.[totalConnected]
					, L.[totalDisconnected]
					, L.[totalAlert]
					, L.[totalUnderMaintenance]
				FROM #temp_Entity L
				WHERE rowNum BETWEEN ((@pageNumber - 1) * @pageSize) + 1 AND (@pageSize * @pageNumber)			
			END
		ELSE
			BEGIN
				SELECT 
				L.[guid]
					, L.[name]
					, L.[type]
					, L.[description]
					, L.[address] 
					, L.[address2] AS address2
					, L.[city]
					, L.[zipCode]
					, L.[stateGuid]
					, L.[countryGuid]
					, L.[image]
					, L.[latitude]
					, L.[longitude]
					, L.[isActive]
					, L.[totalDevices]	
					, L.[totalConnected]
					, L.[totalDisconnected]
					, L.[totalAlert]
					, L.[totalUnderMaintenance]
				FROM #temp_Entity L
			END
	   
        SET @output = 1
		SET @fieldName = 'Success'
	END TRY
	BEGIN CATCH	
		DECLARE @errorReturnMessage VARCHAR(MAX)

		SET @output = 0

		SELECT @errorReturnMessage = 
			ISNULL(@errorReturnMessage, '') +  SPACE(1)   + 
			'ErrorNumber:'  + ISNULL(CAST(ERROR_NUMBER() as VARCHAR), '')  + 
			'ErrorSeverity:'  + ISNULL(CAST(ERROR_SEVERITY() as VARCHAR), '') + 
			'ErrorState:'  + ISNULL(CAST(ERROR_STATE() as VARCHAR), '') + 
			'ErrorLine:'  + ISNULL(CAST(ERROR_LINE () as VARCHAR), '') + 
			'ErrorProcedure:'  + ISNULL(CAST(ERROR_PROCEDURE() as VARCHAR), '') + 
			'ErrorMessage:'  + ISNULL(CAST(ERROR_MESSAGE() as VARCHAR(max)), '')
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