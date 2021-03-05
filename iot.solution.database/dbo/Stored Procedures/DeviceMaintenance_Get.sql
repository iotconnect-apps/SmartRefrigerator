﻿/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName				nvarchar(255)
EXEC [dbo].[DeviceMaintenance_Get]
	 @guid			= 'E9F77DD4-78BC-4461-9D00-64D927998ABE'
	,@currentDate	= '2020-05-21 06:47:56.890'
	,@invokingUser  = '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version		= 'v1'
	,@output		= @output		OUTPUT
	,@fieldName		= @fieldName	OUTPUT	
               
 SELECT @output status,  @fieldName AS fieldName    
 
 001 SMAR-4 12-05-2020 [Nishit Khakhi]	Added Initial Version to Get Device Maintenance Information
*******************************************************************/
CREATE PROCEDURE [dbo].[DeviceMaintenance_Get]
(	 
	 @guid				UNIQUEIDENTIFIER	
	,@currentDate		DATETIME			= NULL
	,@invokingUser		UNIQUEIDENTIFIER
	,@version			NVARCHAR(10)
	,@output			SMALLINT		  OUTPUT
	,@fieldName			NVARCHAR(255)	  OUTPUT	
	,@culture			NVARCHAR(10)	  = 'en-Us'
	,@enableDebugInfo	CHAR(1)			  = '0'
)
AS
BEGIN
    SET NOCOUNT ON
	DECLARE @orderBy VARCHAR(10)
    IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML
        SELECT @Param =
        (
            SELECT 'DeviceMaintenance_Get' AS '@procName'
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
		SELECT DM.[guid]
			, DM.[companyGuid]
			, DM.[entityGuid]
			, DM.[DeviceGuid]
			, E.[name] AS [DeviceName]
			, G.[name] AS [entityName]
			, G.[name] AS [zone]
			, DM.[description]
			, CASE WHEN @currentDate >= [startDate] AND @currentDate <= [endDate]
				THEN 'Under Maintenance'
				ELSE CASE WHEN [startDate] < @currentDate AND [endDate] < @currentDate 
				THEN 'Completed'
				ELSE 'Scheduled'
				END
			END AS [status]
			, DM.[startDate] AS [startDate]
			, DM.[endDate] AS [endDate]
			, DM.[createdDate] 
			
		FROM [dbo].[DeviceMaintenance] DM (NOLOCK)
		INNER JOIN [dbo].[Device] E ON DM.[DeviceGuid] = E.[guid] AND E.[isDeleted] = 0
		INNER JOIN [dbo].[Entity] G WITH (NOLOCK) ON DM.[entityGuid] = G.[guid] AND G.[isDeleted] = 0
		LEFT JOIN [dbo].[Entity] EP WITH (NOLOCK) ON G.[parentEntityGuid] = EP.[guid] AND EP.[isDeleted] = 0 
		WHERE DM.[guid]=@guid AND DM.[isDeleted]=0

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