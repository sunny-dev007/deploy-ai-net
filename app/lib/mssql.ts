import sql from 'mssql';

let pool: sql.ConnectionPool | null = null;
let migrationRun = false; // Flag to ensure migration runs only once

const config: sql.config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER!,
  database: process.env.SQL_DATABASE!,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

export async function getConnection() {
  if (!pool) {
    console.log('🔌 Creating new database connection...');
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Connected to SQL Server');
    
    // Run auto-migration once when connection is established
    if (!migrationRun) {
      migrationRun = true;
      console.log('🚀 Starting auto-migration process...');
      try {
        const { autoMigrate } = await import('./database-migration');
        const migrationResult = await autoMigrate();
        if (migrationResult.success) {
          console.log('✅ Auto-migration completed successfully');
        } else {
          console.warn('⚠️ Auto-migration failed:', migrationResult.error);
        }
      } catch (error) {
        console.warn('❌ Auto-migration import/execution failed:', error);
      }
    }
  }
  return pool;
}

export async function insertUploadedFile({
  id,
  user,
  email,
  fileId,
  fileName,
  fileType,
  fileSize,
  uploadStatus,
  uploadDate,
  driveLink,
  iconLink
}: {
  id: string;
  user: string;
  email: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadStatus: string;
  uploadDate: string;
  driveLink?: string;
  iconLink?: string;
}) {
  console.log('=== INSERT UPLOADED FILE FUNCTION CALLED ===');
  console.log('Function parameters received:', {
    id,
    user,
    email,
    fileId,
    fileName,
    fileType,
    fileSize,
    uploadStatus,
    uploadDate,
    driveLink,
    iconLink
  });

  try {
    console.log('Step 1: Validating UUID format...');
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error('Invalid UUID format:', id);
      throw new Error(`Invalid UUID format: ${id}`);
    }
    console.log('UUID validation passed');

    console.log('Step 2: Getting database connection...');
    const pool = await getConnection();
    console.log('Database connection obtained successfully');
    
    // Convert ISO string to Date object for proper DateTimeOffset handling
    console.log('Step 3: Converting date string to Date object...');
    const dateObj = new Date(uploadDate);
    console.log('Date conversion completed. Original:', uploadDate, 'Converted:', dateObj);
    
    console.log('Step 4: Preparing SQL parameters...');
    const sqlParams = {
      id,
      user_id: user,
      email_id: email,
      file_id: fileId,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      upload_status: uploadStatus,
      upload_date: dateObj,
      created_at: dateObj,
      updated_at: dateObj,
      error_message: null,
      drive_link: driveLink || null,
      icon_link: iconLink || null
    };
    console.log('SQL parameters prepared:', sqlParams);

    console.log('Step 5: Executing SQL INSERT query...');
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('user_id', sql.NVarChar, user)
      .input('email_id', sql.NVarChar, email)
      .input('file_id', sql.NVarChar, fileId)
      .input('file_name', sql.NVarChar, fileName)
      .input('file_type', sql.NVarChar, fileType)
      .input('file_size', sql.BigInt, fileSize)
      .input('upload_status', sql.NVarChar, uploadStatus)
      .input('upload_date', sql.DateTimeOffset, dateObj)
      .input('created_at', sql.DateTimeOffset, dateObj)
      .input('updated_at', sql.DateTimeOffset, dateObj)
      .input('error_message', sql.NVarChar, null)
      .input('drive_link', sql.NVarChar, driveLink || null)
      .input('icon_link', sql.NVarChar, iconLink || null)
      .query(`INSERT INTO [dbo].[UploadedFiles] (id, user_id, email_id, file_id, file_name, file_type, file_size, upload_status, upload_date, created_at, updated_at, error_message, drive_link, icon_link)
              VALUES (@id, @user_id, @email_id, @file_id, @file_name, @file_type, @file_size, @upload_status, @upload_date, @created_at, @updated_at, @error_message, @drive_link, @icon_link)`);
    
    console.log('SQL INSERT executed successfully!');
    console.log('Insert result:', result);
    console.log('Rows affected:', result.rowsAffected);
    return result;
  } catch (error: any) {
    console.error('=== INSERT UPLOADED FILE ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    throw error; // Re-throw the error so it can be caught by the calling function
  }
}

export async function testDatabaseConnection() {
  console.log('=== TESTING DATABASE CONNECTION ===');
  try {
    const pool = await getConnection();
    console.log('Connection established successfully');
    
    // Test basic query
    const testResult = await pool.request().query('SELECT 1 AS test_value');
    console.log('Basic query test result:', testResult);
    
    // Test table existence and structure
    const tableCheck = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'UploadedFiles' 
      ORDER BY ORDINAL_POSITION
    `);
    console.log('UploadedFiles table structure:', tableCheck.recordset);
    
    return {
      success: true,
      testResult: testResult.recordset,
      tableStructure: tableCheck.recordset
    };
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 