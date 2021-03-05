
CREATE TABLE [dbo].[ForcastAttributeValue](
	[guid] [uniqueidentifier] NOT NULL,
	[companyGuid] [uniqueidentifier] NULL,
	[localName] [nvarchar](100) NULL,
	[deviceGuid]  [uniqueidentifier] NULL,
	[uniqueId] [nvarchar](200) NULL,	
	[attributeValue] [nvarchar](1000) NULL,
	[createdDate] [datetime] NULL	
PRIMARY KEY CLUSTERED 
(
	[guid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

