import { getConnection } from './mssql';
import sql from 'mssql';

export async function addIsActiveColumn() {
  try {
    console.log('🔍 Checking if is_active column exists...');
    const pool = await getConnection();
    
    // Check if is_active column exists in UploadedFiles table
    const columnCheck = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'UploadedFiles' AND COLUMN_NAME = 'is_active'
    `);

    if (columnCheck.recordset.length === 0) {
      console.log('📝 Adding is_active column to UploadedFiles table...');
      // Add is_active column with default value of 1 (active)
      await pool.request().query(`
        ALTER TABLE UploadedFiles 
        ADD is_active BIT NOT NULL DEFAULT 1
      `);
      
      console.log('✅ Successfully added is_active column to UploadedFiles table');
    } else {
      console.log('ℹ️ is_active column already exists in UploadedFiles table');
    }

    // Check if we need to update any existing records to have is_active = 1
    console.log('🔄 Updating existing records to be active...');
    const updateResult = await pool.request().query(`
      UPDATE UploadedFiles 
      SET is_active = 1 
      WHERE is_active IS NULL
    `);

    if (updateResult.rowsAffected && updateResult.rowsAffected[0] > 0) {
      console.log(`✅ Updated ${updateResult.rowsAffected[0]} existing records to be active`);
    } else {
      console.log('ℹ️ No records needed updating (all already have is_active values)');
    }

    return {
      success: true,
      message: 'Database migration completed successfully'
    };

  } catch (error: any) {
    console.error('❌ Database migration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      state: error.state,
      severity: error.severity
    });
    return {
      success: false,
      error: error.message
    };
  }
}

// Auto-migration function that runs safely without authentication
export async function autoMigrate() {
  try {
    console.log('Running auto-migration for soft delete functionality...');
    const result = await addIsActiveColumn();
    
    if (result.success) {
      console.log('✅ Auto-migration completed successfully');
    } else {
      console.warn('⚠️ Auto-migration failed:', result.error);
    }
    
    return result;
  } catch (error: any) {
    console.warn('⚠️ Auto-migration error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function checkDatabaseSchema() {
  try {
    const pool = await getConnection();
    
    // Check UploadedFiles table structure
    const uploadedFilesSchema = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'UploadedFiles' 
      ORDER BY ORDINAL_POSITION
    `);

    // Check FileMetadata table structure
    const fileMetadataSchema = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'FileMetadata' 
      ORDER BY ORDINAL_POSITION
    `);

    return {
      success: true,
      uploadedFilesSchema: uploadedFilesSchema.recordset,
      fileMetadataSchema: fileMetadataSchema.recordset
    };

  } catch (error: any) {
    console.error('Schema check error:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 