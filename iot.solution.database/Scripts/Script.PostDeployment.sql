DECLARE @dt DATETIME= GETUTCDATE()

IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.[configuration] WHERE [configKey] = 'db-version')
BEGIN
	INSERT [dbo].[Configuration] ([guid], [configKey], [value], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) 
	VALUES (N'cf45da4c-1b49-49f5-a5c3-8bc29c1999ea', N'db-version', N'0', 0, @dt, NULL, @dt, NULL)
END

IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.[configuration] WHERE [configKey] = 'telemetry-last-exectime')
BEGIN
	INSERT [dbo].[Configuration] ([guid], [configKey], [value], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) 
	VALUES (N'465970b2-8bc3-435f-af97-8ca26f2bf383', N'telemetry-last-exectime', N'2020-01-01 12:08:02.380', 0, @dt, NULL, @dt, NULL)
END

IF NOT EXISTS(SELECT 1 FROM dbo.[configuration] WHERE [configKey] = 'db-version') 
	OR ((SELECT CONVERT(FLOAT,[value]) FROM dbo.[configuration] WHERE [configKey] = 'db-version') < 1 )
BEGIN

INSERT [dbo].[KitType] ([guid], [companyGuid], [name], [code], [tag], [isActive], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', NULL, N'SRDefault', N'SRDefault', NULL, 1, 0, @dt, N'68aa338c-ebd7-4686-b350-de844c71db1f', NULL, NULL)

INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'8327A9D0-5B43-4BDB-A685-89321C1AA5E3', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'weight', N'weight', NULL, N'weight')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'131C24E0-7740-42F8-BA7D-C26DE5B69B8E', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'gas', N'gas', NULL, N'gas')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'AF29C889-1259-40F8-A8AF-3CD020A995FE', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'isdooropen', N'isdooropen', NULL, N'isdooropen')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'46F681A2-3168-4221-BB77-922F12DB9F2D', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'temp', N'temp', NULL, N'temperature')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'A8DECC0C-B7E8-4953-B4C8-D30B5A34F64C', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'currentin', N'currentin', NULL,  N'consumption')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'762033E0-64E6-4E24-AA2E-785748B4E277', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'voltage', N'voltage', NULL, N'voltage')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'D79BC559-1299-4CF0-8ECC-19DFA6B4F33D', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'humidity', N'humidity', NULL, N'humidity')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'7BBD5548-CACF-41DA-A49E-D92FC4960EA3', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'co2', N'co2', NULL,  N'co2')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'69186796-D799-4A84-B178-57A8E6F60CF9', NULL, N'e1b90a99-ee2b-4c77-8696-f6145c4bc23b', N'vibration', N'vibration', NULL, N'vibration')

INSERT INTO [dbo].[AdminUser] ([guid],[email],[companyGuid],[firstName],[lastName],[password],[isActive],[isDeleted],[createdDate]) VALUES (NEWID(),'admin@refrigeration.com','AB469212-2488-49AD-BC94-B3A3F45590D2','Refrigeration','admin','Softweb#123',1,0,@dt)

INSERT INTO [dbo].[DeviceType]([guid],[name],[isActive],[isDeleted],[createdDate],[createdBy],[updatedDate],[updatedBy]) VALUES ('AC9389D3-C832-4AEB-B061-9E372EDB7E48','Type1',1,0,@dt,NULL,@dt,NULL)
INSERT INTO [dbo].[DeviceType]([guid],[name],[isActive],[isDeleted],[createdDate],[createdBy],[updatedDate],[updatedBy]) VALUES ('0EC77B10-71D4-45E6-8793-06266732A0F3','Type2',1,0,@dt,NULL,@dt,NULL)
INSERT INTO [dbo].[DeviceType]([guid],[name],[isActive],[isDeleted],[createdDate],[createdBy],[updatedDate],[updatedBy]) VALUES ('8783388F-828E-428D-AB5A-7633FFC89470','Type3',1,0,@dt,NULL,@dt,NULL)

UPDATE [dbo].[Configuration]
SET [value]  = '1'
WHERE [configKey] = 'db-version'

END