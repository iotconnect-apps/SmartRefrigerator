
/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName				nvarchar(255)
EXEC [dbo].[Device_Get]
	 @guid				= 'E9F77DD4-78BC-4461-9D00-64D927998ABE'	
	,@companyGuid		= '895019CF-1D3E-420C-828F-8971253E5784'	
	,@invokingUser  	= '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT	
               
 SELECT @output status,  @fieldName AS fieldName    
 
 001	sgh-1 06-12-2019 [Nishit Khakhi]	Added Initial Version to Get Device Information
*******************************************************************/

CREATE PROCEDURE [dbo].[Device_Get]
(	 
	 @guid				UNIQUEIDENTIFIER	
	,@companyGuid		UNIQUEIDENTIFIER
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
            SELECT 'Device_Get' AS '@procName'
			, CONVERT(nvarchar(MAX),@guid) AS '@guid'			
			, CONVERT(nvarchar(MAX),@companyGuid) AS '@companyGuid'
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

    IF NOT EXISTS (SELECT TOP 1 1 FROM [dbo].[Device] (NOLOCK) WHERE [companyGuid]=@companyGuid AND [guid]=@guid AND [isDeleted]=0)
	BEGIN
		Set @output = -3
		SET @fieldName = 'DeviceNotFound'
		RETURN;
	END
  
    BEGIN TRY
		SELECT D.[guid]
				,D.[companyGuid]
				,D.[entityGuid]
				,D.[templateGuid]
				, KT.[kitCode] AS [kitCode]
				,D.[parentDeviceGuid]
				,D.[typeGuid]
				,D.[uniqueId]
				,D.[name]
				,D.[note]
				,D.[tag]
				,D.[image]
				,D.[model]
				,D.[voltage]
				,D.[capacity]
				,D.[power]
				,D.[netWeight]
				,D.[Specification]
				,D.[Description]
				,D.[isProvisioned]
				,D.[isActive]
				,D.[createdDate]
				,D.[createdBy]
				,D.[updatedDate]
				,D.[updatedBy]
				 
		FROM [dbo].[Device] D (NOLOCK)
		LEFT JOIN [dbo].[HardwareKit] KT (NOLOCK) ON D.[uniqueid] = KT.[uniqueid] ANd KT.[isDeleted] = 0
		WHERE D.[companyGuid]=@companyGuid AND D.[guid]=@guid AND D.[isDeleted]=0

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