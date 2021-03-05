
/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName	NVARCHAR(255)	
	,@syncDate	DATETIME
EXEC [dbo].[Chart_HistoricalQualityParameter]	
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
CReAte PROCEDURE [dbo].[Chart_HistoricalQualityParameter]
(	@uniqueId			NVARCHAR(100)
	,@entityGuid		UNIQUEIDENTIFIER	= NULL
	,@attribute			NVARCHAR(100)
	
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
            SELECT 'Chart_HistoricalQualityParameterByBuilding' AS '@procName' 
            , CONVERT(nvarchar(MAX),@uniqueId) AS '@uniqueId' 
			, CONVERT(nvarchar(MAX),@entityGuid) AS '@entityGuid' 
			
			, CONVERT(nvarchar(MAX),@version) AS '@version' 
            , CONVERT(nvarchar(MAX),@invokinguser) AS '@invokinguser' 
            FOR XML PATH('Params')
	    ) 
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(nvarchar(MAX), @Param), GETUTCDATE())
    END                    
    
    BEGIN TRY  
		
		DECLARE @startDate DATETIME, @endDate DATETIME
		DECLARE @dt DATETIME = GETUTCDATE(), @guid UNIQUEIDENTIFIER

		SELECT Top 1 @guid = [guid]
		FROM dbo.[Device] (NOLOCK) WHERE [uniqueId] = @uniqueId AND [isDeleted] = 0
		
		IF OBJECT_ID ('tempdb..#ids') IS NOT NULL DROP TABLE #ids
				
		SELECT E.[uniqueId] as [uniqueId], E.[guid] as [guid]
		INTO #ids
		FROM [dbo].[Entity] PN (NOLOCK) 
		INNER JOIN [dbo].[Device] E (NOLOCK) ON E.[entityGuid] = PN.[guid] 
		WHERE (E.[guid] = @guid OR PN.[guid] = @entityGuid)
		AND PN.isActive = 1 AND PN.isDeleted = 0 AND E.isDeleted = 0 AND E.isActive = 1

		

			IF OBJECT_ID ('tempdb..#wresult') IS NOT NULL BEGIN DROP TABLE #result END
			CREATE TABLE [#wresult] ([Date] DATETIME, [Historical] DECIMAL(18,2))

			SET @startDate = @dt - 30 
			SET @endDate = @dt
									
			INSERT INTO [#wresult]
			SELECT T.[sdkUpdatedDate], ROUND(CONVERT(DECIMAL(18,7),[attributeValue]),2) AS [Historical] 
			FROM #ids I 
			INNER JOIN IoTConnect.AttributeValue T (NOLOCK) ON T.[uniqueId] = I.[uniqueId]
			WHERE [localName] = @attribute AND CONVERT(Date,T.[sdkUpdatedDate]) BETWEEN CONVERT(DATE,@startDate) AND CONVERT(DATE,@endDate)
			
			
			SELECT * FROM [#wresult]
			
	
				
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