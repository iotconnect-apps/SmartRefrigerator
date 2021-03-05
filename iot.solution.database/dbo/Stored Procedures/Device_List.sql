
/*******************************************************************
DECLARE @count INT
     	,@output INT = 0
		,@fieldName	VARCHAR(255)

EXEC [dbo].[Device_List]
	 @companyGuid	= '6246F7B9-3A01-4786-A01C-5CA289F1B26C'
--	,@entityGuid	= '3C31A2B2-96EB-4A87-9F92-2058144A9A3A'
	,@pageSize		= 10
	,@pageNumber	= 1
	,@orderby		= NULL
	,@count			= @count OUTPUT
	,@invokingUser  = 'C1596B8C-7065-4D63-BFD0-4B835B93DFF2'
	,@version		= 'v1'
	,@output		= @output	OUTPUT
	,@fieldName		= @fieldName	OUTPUT

SELECT @count count, @output status, @fieldName fieldName

001	SR-4 29-04-2020 [Nishit Khakhi]	Added Initial Version to List Device
*******************************************************************/
CREATE  PROCEDURE [dbo].[Device_List]
(	@companyGuid		UNIQUEIDENTIFIER
	,@entityGuid		UNIQUEIDENTIFIER	= NULL
	,@search			VARCHAR(100)		= NULL
	,@pageSize			INT
	,@pageNumber		INT
	,@orderby			VARCHAR(100)		= NULL
	,@invokingUser		UNIQUEIDENTIFIER
	,@version			VARCHAR(10)
	,@culture			VARCHAR(10)			= 'en-Us'
	,@output			SMALLINT			OUTPUT
	,@fieldName			VARCHAR(255)		OUTPUT
	,@count				INT OUTPUT
	,@enableDebugInfo		CHAR(1)			= '0'
)
AS
BEGIN
   SET NOCOUNT ON

    IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML
        SELECT @Param =
        (
            SELECT 'Device_List' AS '@procName'
            	, CONVERT(VARCHAR(MAX),@companyGuid) AS '@companyGuid'
				, CONVERT(VARCHAR(MAX),@entityGuid) AS '@entityGuid'
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

		SELECT
		 @output = 1
		,@count = -1

		IF OBJECT_ID('tempdb..#temp_Device') IS NOT NULL DROP TABLE #temp_Device

		CREATE TABLE #temp_Device
		(	[guid]				UNIQUEIDENTIFIER
			,[companyGuid]		UNIQUEIDENTIFIER
			,[entityGuid]		UNIQUEIDENTIFIER
			,[entityName]			NVARCHAR(500)
			,[templateGuid]		UNIQUEIDENTIFIER
			,[parentDeviceGuid]	UNIQUEIDENTIFIER
			,[typeGuid]			UNIQUEIDENTIFIER
			,[typeName]			NVARCHAR(100)
			,[uniqueId]			NVARCHAR(500)
			,[name]				NVARCHAR(500)
			,[note]				NVARCHAR(1000)
			,[tag]				NVARCHAR(50)
			,[image]			NVARCHAR(200)
			,[model]			NVARCHAR (200)	
			,[power]			NVARCHAR (20)	
			,[voltage]		    NVARCHAR (20)	
			,[capacity]		    NVARCHAR (20)	
			,[netWeight]		NVARCHAR (20)	
			,[isProvisioned]	BIT
			,[isActive]			BIT
			,[totalEnergy]		BIGINT
			,[totalAlert]		BIGINT
			,[rowNum]			INT
		)

		IF LEN(ISNULL(@orderby, '')) = 0
		SET @orderby = 'name asc'

		DECLARE @Sql nvarchar(MAX) = ''

		SET @Sql = '
		SELECT
			*
			,ROW_NUMBER() OVER (ORDER BY '+@orderby+') AS rowNum
		FROM
		( SELECT
			D.[guid]
			, D.[companyGuid]
			, D.[entityGuid]
			, G.[name] AS [entityName]
			
			, D.[templateGuid]
			, D.[parentDeviceGuid]
			, D.[typeGuid]
			, T.[name] As [typeName]
			, D.[uniqueId]
			, D.[name]
			, D.[note]
			, D.[tag]
			, D.[image]
			, D.[model]			
			, D.[power]			
			, D.[voltage]		    
			, D.[capacity]		    
			, D.[netWeight]		
			, D.[isProvisioned]
			, D.[isActive]		
			, 0 AS [totalEnergy]
			, 0 AS [totalAlert]	
			FROM [dbo].[Device] D WITH (NOLOCK) 
			INNER JOIN [dbo].[Entity] G WITH (NOLOCK) ON D.[entityGuid] = G.[guid] AND G.[isDeleted] = 0 
			Left Join [dbo].[DeviceType] T With (NOLOCK) On D.[typeGuid] = T.[guid] and T.[isDeleted]=0 
			WHERE D.[companyGuid]=@companyGuid AND D.[isDeleted]=0 '
			+ CASE WHEN @entityGuid IS NULL THEN '' ELSE ' AND [entityGuid] = @entityGuid ' END +
			+ CASE WHEN @search IS NULL THEN '' ELSE ' AND (D.name LIKE ''%' + @search + '%''
			  OR D.[uniqueId] LIKE ''%' + @search + '%'' 
			  OR G.[name] LIKE ''%' + @search + '%'' 			 
			   OR T.[name] LIKE ''%' + @search + '%'' 
			)'
			 END +
		' )  data '
		
		INSERT INTO #temp_Device
		EXEC sp_executesql 
			  @Sql
			, N'@orderby VARCHAR(100), @companyGuid UNIQUEIDENTIFIER, @entityGuid UNIQUEIDENTIFIER '
			, @orderby		= @orderby			
			, @companyGuid	= @companyGuid	
			, @entityGuid	= @entityGuid
			
		SET @count = @@ROWCOUNT

		;WITH CTE_Alerts
		AS (	SELECT I.[deviceGuid], COUNT(I.[guid]) AS [totalAlert]
				FROM [dbo].[IOTConnectAlert] I (NOLOCK)
				INNER JOIN #temp_Device D ON I.[deviceGuid] = D.[guid]
				GROUP BY [deviceGuid]
		)
		, CTE_EnergyCount
		AS (	SELECT T.[deviceGuid]
						, SUM([sum]) [energyCount]
				FROM [dbo].[TelemetrySummary_HourWise] T (NOLOCK) 
				INNER JOIN #temp_Device E (NOLOCK) ON T.[deviceGuid] = E.[guid]
				WHERE [attribute] = 'currentin'
				GROUP BY T.[deviceGuid]
		)
		UPDATE t
		SET [totalAlert] = c.[totalAlert]
			, [totalEnergy] = E.[energyCount]
		FROM #temp_Device t 
		LEFT JOIN CTE_Alerts c ON T.[guid] = c.[deviceGuid]
		LEFT JOIN CTE_EnergyCount E ON T.[guid] = E.[deviceGuid]

		IF(@pageSize <> -1 AND @pageNumber <> -1)
			BEGIN
				SELECT 
					D.[guid]
					, D.[companyGuid]
					, D.[entityGuid]
					, D.[entityName]
					, D.[templateGuid]
					, D.[parentDeviceGuid]
					, D.[typeGuid]
					,D.[typeName]
					, D.[uniqueId]
					, D.[name]
					, D.[note]
					, D.[tag]
					, D.[image]
					, D.[model]			
					, D.[power]			
					, D.[voltage]		    
					, D.[capacity]		    
					, D.[netWeight]	
					, D.[isProvisioned]
					, D.[isActive]	
					, D.[totalEnergy]
					, D.[totalAlert]
				FROM #temp_Device D
				WHERE rowNum BETWEEN ((@pageNumber - 1) * @pageSize) + 1 AND (@pageSize * @pageNumber)			
			END
		ELSE
			BEGIN
				SELECT 
					D.[guid]
					, D.[companyGuid]
					, D.[entityGuid]
					, D.[entityName]
					, D.[templateGuid]
					, D.[parentDeviceGuid]
					, D.[typeGuid]
					,D.[typeName]
					, D.[uniqueId]
					, D.[name]
					, D.[note]
					, D.[tag]
					, D.[image]
					, D.[model]			
					, D.[power]			
					, D.[voltage]		    
					, D.[capacity]		    
					, D.[netWeight]
					, D.[isProvisioned]
					, D.[isActive]	
					, D.[totalEnergy]
					, D.[totalAlert]
				FROM #temp_Device D
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