/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName	NVARCHAR(255)	
	,@syncDate	DATETIME
	,@attributeValues XML =N'<Items>
  <Item>
    <time>12/8/2020 12:11:42 PM</time>
    <cpid>6c63fff0573649339345de7bd00b38a5</cpid>
    <deviceId>6c63fff0573649339345de7bd00b38a5-SR2</deviceId>
    <co2>760.288355857489</co2>
    <currentin>11.5802634516099</currentin>
    <temp>12.1984784801621</temp>
    <vibration>1.00266202724884</vibration>
    <voltage>80.3957118457796</voltage>
    <weight>227.914417319267</weight>
    <origin>Forecasted</origin>
    <power_consumed>931.003523553846</power_consumed>
  </Item>
  <Item>
    <time>12/8/2020 12:11:57 PM</time>
    <cpid>6c63fff0573649339345de7bd00b38a5</cpid>
    <deviceId>6c63fff0573649339345de7bd00b38a5-SR2</deviceId>
    <co2>677.664344754949</co2>
    <currentin>10.2033348656278</currentin>
    <temp>11.5916319603852</temp>
    <vibration>0.704639178121011</vibration>
    <voltage>70.8150652325834</voltage>
    <weight>254.212903048852</weight>
    <origin>Forecasted</origin>
    <power_consumed>722.549824099329</power_consumed>
  </Item>
  <Item>
    <time>12/8/2020 12:12:12 PM</time>
    <cpid>6c63fff0573649339345de7bd00b38a5</cpid>
    <deviceId>6c63fff0573649339345de7bd00b38a5-SR2</deviceId>
    <co2>749.210678934474</co2>
    <currentin>11.0502379372019</currentin>
    <temp>10.9048206878608</temp>
    <vibration>0.908197663829902</vibration>
    <voltage>66.4292722916111</voltage>
    <weight>239.833765755542</weight>
    <origin>Forecasted</origin>
    <power_consumed>734.059264817479</power_consumed>
  </Item>
  <Item>
    <time>12/8/2020 12:12:27 PM</time>
    <cpid>6c63fff0573649339345de7bd00b38a5</cpid>
    <deviceId>6c63fff0573649339345de7bd00b38a5-SR2</deviceId>
    <co2>658.723721850587</co2>
    <currentin>8.97473514234403</currentin>
    <temp>10.1627942642999</temp>
    <vibration>0.961476631909997</vibration>
    <voltage>55.9515564543245</voltage>
    <weight>257.883082604309</weight>
    <origin>Forecasted</origin>
    <power_consumed>502.150399979472</power_consumed>
  </Item>
  <Item>
    <time>12/8/2020 12:12:42 PM</time>
    <cpid>6c63fff0573649339345de7bd00b38a5</cpid>
    <deviceId>6c63fff0573649339345de7bd00b38a5-SR2</deviceId>
    <co2>675.2453816076</co2>
    <currentin>9.12965387214329</currentin>
    <temp>10.0758986649238</temp>
    <vibration>0.940589961263426</vibration>
    <voltage>56.0816173906629</voltage>
    <weight>260.783343525146</weight>
    <origin>Forecasted</origin>
    <power_consumed>512.005755366724</power_consumed>
  </Item>
</Items>'
EXEC [dbo].[Chart_PowerBIQualityParameter]	
	@uniqueId	= 'SR2'
	,@attribute	= 'co2'
	,@companyGuid='43C2F06F-3C68-40D2-BD49-64DDA16A2750'
	
	,@invokinguser  = 'E05A4DA0-A8C5-4A4D-886D-F61EC802B5FD'              
	,@version		= 'v1'              
	,@output		= @output		OUTPUT
	,@fieldname		= @fieldName	OUTPUT
	,@syncDate		= @syncDate		OUTPUT

SELECT @output status, @fieldName fieldName, @syncDate syncDate


*******************************************************************/
CReATe PROCEDURE [dbo].[Chart_PowerBIQualityParameter]
(	@uniqueId			NVARCHAR(100)
	,@entityGuid		UNIQUEIDENTIFIER	= NULL
	,@companyGuid			UNIQUEIDENTIFIER	= NULL
	,@attribute			NVARCHAR(100)
	,@attributeValues		XML	=NULL
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
	IF @attributeValues IS NOT NULL
		BEGIN
				-- import forcast data from xml
				IF OBJECT_ID('tempdb..#tmpTelemetry') IS NOT NULL DROP TABLE #tmpTelemetry	
				CREATE TABLE #tmpTelemetry
				(		
					[guid] [uniqueidentifier] NOT NULL,
					[cpid] nvarchar(100) not null,
					[companyGuid] [uniqueidentifier] NULL,
					[deviceId]  [nvarchar](100) NULL,	
					[co2] [nvarchar](100) NULL,
					[currentin] [nvarchar](100) NULL,
					[temp] [nvarchar](100) NULL,
					[vibration] [nvarchar](100) NULL,
					[voltage] [nvarchar](100) NULL,
					[weight] [nvarchar](100) NULL,
					[origin] [nvarchar](100) NULL,
					[power_consumed] [nvarchar](100) NULL,
					[createdDate] [datetime] NULL,
					[deviceGuid]  [uniqueidentifier] NULL,		
				)
				INSERT INTO #tmpTelemetry
					SELECT  NEWID() guid
						 ,TRY_CONVERT(nvarchar(100),b.value('(cpid)[1]','nvarchar(100)')) cpid
						 ,@companyGuid as [companyGuid]
							
						,REPLACE(TRY_CONVERT(nvarchar(100),b.value('(deviceId)[1]','nvarchar(100)')),TRY_CONVERT(nvarchar(100),b.value('(cpid)[1]','nvarchar(100)'))+'-','') deviceId
				
							,TRY_CONVERT([nvarchar](100),b.value('(co2)[1]','nvarchar(100)')) co2
								,TRY_CONVERT([nvarchar](100),b.value('(currentin)[1]','nvarchar(100)')) [currentin]
								,TRY_CONVERT([nvarchar](100),b.value('(temp)[1]','nvarchar(100)')) [temp]
								,TRY_CONVERT([nvarchar](100),b.value('(vibration)[1]','nvarchar(100)')) [vibration]
								,TRY_CONVERT([nvarchar](100),b.value('(voltage)[1]','nvarchar(100)')) [voltage]
								,TRY_CONVERT([nvarchar](100),b.value('(weight)[1]','nvarchar(100)')) [weight]
								,TRY_CONVERT([nvarchar](100),b.value('(origin)[1]','nvarchar(100)')) [origin]
								,TRY_CONVERT([nvarchar](100),b.value('(power_consumed)[1]','nvarchar(100)')) [power_consumed]
						
						,TRY_CONVERT(DATETIME,b.value('(time)[1]','datetime'))  [createdDate]	
					,Null as [deviceGuid]
					FROM @attributeValues.nodes('/Items/Item') a(b) 
					--ORDER BY 6, 5, 7	

				BEGIN TRAN
						Update  t set t.[deviceGuid] = d.[guid] 
							from #tmpTelemetry t
						inner join  [dbo].[Device] (NOLOCK) d on d.[uniqueId]=t.[deviceId] AND d.[isDeleted]=0 
					
						DELETE t FROM #tmpTelemetry t INNER JOIN [dbo].[ForcastAttributeValue] (NOLOCK) e ON t.[deviceGuid]=e.[deviceGuid] AND t.[createdDate] = e.[createdDate] 
				
						INSERT INTO [dbo].[ForcastAttributeValue]([guid],	[companyGuid],	[localName],	[deviceGuid],	[uniqueId],	[createdDate],[attributeValue])
						select NEWID(),[companyGuid],[localName], [deviceGuid],[deviceId], 				  
						  [createdDate],[attributeValue]
						from #tmpTelemetry 
						unpivot
						(
						  attributeValue   for [localName] in ([co2], [currentin], [temp],[vibration],[voltage],[weight],[origin],[power_consumed])
						) unpiv;
				 
						--select * from [ForcastAttributeValue]
				COMMIT TRAN	
		END
		-- prepare combine response historical + forcasted
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
			CREATE TABLE [#wresult] ([Date] DATETIME, [Historical] DECIMAL(18,2), [Forcasted] DECIMAL(18,2))

			SET @startDate = @dt - 30 
			SET @endDate = @dt
									
			INSERT INTO [#wresult]
			SELECT T.[sdkUpdatedDate], ROUND(CONVERT(DECIMAL(18,7),[attributeValue]),2) AS [Historical] ,0 as [Forcasted]
			FROM #ids I 
			INNER JOIN IoTConnect.AttributeValue T (NOLOCK) ON T.[uniqueId] = I.[uniqueId]
			WHERE [localName] = @attribute AND CONVERT(Date,T.[sdkUpdatedDate]) BETWEEN CONVERT(DATE,@startDate) AND CONVERT(DATE,@endDate)
			UNION 
			SELECT T.[createdDate],0 as [Historical], ROUND(CONVERT(DECIMAL(18,7),[attributeValue]),2) AS [Forcasted] 
			FROM #ids I 
			INNER JOIN [dbo].[ForcastAttributeValue] T (NOLOCK) ON T.[uniqueId] = I.[uniqueId]
			WHERE [localName] = @attribute 
			
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