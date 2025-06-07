# Required Environment Variables for Azure Web App

## Critical Variables (Application will fail without these)

### Azure OpenAI Configuration
- `AZURE_OPENAI_API_KEY` - Your Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT` - Your Azure OpenAI endpoint URL
- `AZURE_OPENAI_EMBEDDING_ENDPOINT` - Your Azure OpenAI embedding endpoint URL
- `AZURE_OPENAI_API_VERSION` - API version (e.g., "2023-05-15")
- `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` - Embedding deployment name (e.g., "text-embedding-3-small")

### Database Configuration
- `SQL_USER` - SQL Server username
- `SQL_PASSWORD` - SQL Server password
- `SQL_SERVER` - SQL Server hostname
- `SQL_DATABASE` - SQL Server database name

### Authentication
- `NEXTAUTH_SECRET` - NextAuth secret key (generate with: openssl rand -base64 32)
- `NEXTAUTH_URL` - Your application URL (e.g., "https://workwithcopilot.azurewebsites.net")

### Google OAuth & Drive
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_DRIVE_CLIENT_ID` - Google Drive API client ID
- `GOOGLE_DRIVE_CLIENT_SECRET` - Google Drive API client secret
- `GOOGLE_OAUTH_REFRESH_TOKEN_URL` - Google OAuth refresh token URL

### Pinecone Vector Database
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_INDEX_NAME` - Pinecone index name (e.g., "ai-agent-docs")
- `PINECONE_CODEBASE_INDEX_NAME` - Pinecone codebase index name

## Optional Variables (Features may not work without these)

### OpenAI (Alternative to Azure OpenAI)
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_API_MODEL` - OpenAI model name (e.g., "gpt-4o-mini")
- `NEXT_PUBLIC_OPENAI_API_KEY` - Public OpenAI API key (client-side)

### Email Configuration
- `GMAIL_USER` - Gmail username for sending emails
- `GMAIL_APP_PASSWORD` - Gmail app password

### GitHub OAuth (if using GitHub login)
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret

### System Variables
- `NODE_ENV` - Should be "production"
- `PORT` - Port number (Azure sets this automatically)
- `NEXT_TELEMETRY_DISABLED` - Set to "1" to disable telemetry

## How to Set Environment Variables in Azure Web App

1. Go to Azure Portal
2. Navigate to your Web App
3. Go to Configuration > Application settings
4. Add each environment variable as a new application setting
5. Save the configuration
6. Restart the web app

## Troubleshooting

If you see 500 errors, check the application logs in Azure Portal:
1. Go to your Web App
2. Navigate to Monitoring > Log stream
3. Look for error messages related to missing environment variables

## Security Notes

- Never commit environment variables to your repository
- Use Azure Key Vault for sensitive values in production
- Rotate API keys regularly
- Use least privilege principle for database connections 