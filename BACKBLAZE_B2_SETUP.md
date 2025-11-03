# Backblaze B2 Integration Setup

## Backblaze B2 Configuration

### Bucket Details
- **Bucket Name:** `VeinModdingHosting`
- **Bucket ID:** `ebf94d8a2cf64b7b95a60516`
- **Endpoint:** `s3.us-east-005.backblazeb2.com`
- **Type:** Public (required for public file access)

### Application Key (Server-Side Only)
**SECURITY WARNING: Never expose these credentials in frontend code!**

- **Key ID:** `005b9dac6bb56560000000001`
- **Application Key:** `K005SJXLa/B0xLPB3loqhRrcxySxxRw`
- **Key Name:** `VeinModding`

## Backend Integration

### Required Environment Variables

Store these in your backend environment (e.g., `.env` file or secure secret management):

```bash
BACKBLAZE_B2_KEY_ID=005b9dac6bb56560000000001
BACKBLAZE_B2_APPLICATION_KEY=K005SJXLa/B0xLPB3loqhRrcxySxxRw
BACKBLAZE_B2_BUCKET_NAME=VeinModdingHosting
BACKBLAZE_B2_BUCKET_ID=ebf94d8a2cf64b7b95a60516
BACKBLAZE_B2_ENDPOINT=s3.us-east-005.backblazeb2.com

DATABASE_URL=mysql://user:password@localhost:3306/veinmodding
```

### Node.js/Express Backend Example

Install Backblaze B2 SDK:
```bash
npm install backblaze-b2
```

#### Example Backend Route (`/api/submit-mod`)

```javascript
const express = require('express');
const multer = require('multer');
const B2 = require('backblaze-b2');
const router = express.Router();

const upload = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: 100 * 1024 * 1024,
  }
});

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_B2_KEY_ID,
  applicationKey: process.env.BACKBLAZE_B2_APPLICATION_KEY,
});

router.post('/submit-mod', upload.fields([
  { name: 'modFile', maxCount: 1 },
  { name: 'screenshots', maxCount: 5 }
]), async (req, res) => {
  try {
    await b2.authorize();
    
    const uploadUrl = await b2.getUploadUrl({
      bucketId: process.env.BACKBLAZE_B2_BUCKET_ID
    });
    
    const modFile = req.files.modFile[0];
    const screenshots = req.files.screenshots || [];
    
    const modFileName = `mods/${Date.now()}-${modFile.originalname}`;
    const modFileUpload = await b2.uploadFile({
      uploadUrl: uploadUrl.data.uploadUrl,
      uploadAuthToken: uploadUrl.data.authorizationToken,
      fileName: modFileName,
      data: require('fs').readFileSync(modFile.path),
      contentLength: modFile.size
    });
    
    const modFileUrl = `https://f${process.env.BACKBLAZE_B2_BUCKET_ID}.backblazeb2.com/file/${process.env.BACKBLAZE_B2_BUCKET_NAME}/${modFileName}`;
    
    const screenshotUrls = [];
    for (const screenshot of screenshots) {
      const screenshotName = `screenshots/${Date.now()}-${screenshot.originalname}`;
      const screenshotUpload = await b2.uploadFile({
        uploadUrl: uploadUrl.data.uploadUrl,
        uploadAuthToken: uploadUrl.data.authorizationToken,
        fileName: screenshotName,
        data: require('fs').readFileSync(screenshot.path),
        contentLength: screenshot.size
      });
      
      screenshotUrls.push(`https://f${process.env.BACKBLAZE_B2_BUCKET_ID}.backblazeb2.com/file/${process.env.BACKBLAZE_B2_BUCKET_NAME}/${screenshotName}`);
    }
    
    const modData = {
      modName: req.body.modName,
      modDescription: req.body.modDescription,
      modVersion: req.body.modVersion,
      authorName: req.body.authorName,
      authorEmail: req.body.authorEmail,
      authorWebsite: req.body.authorWebsite || null,
      modCategory: req.body.modCategory,
      modTags: req.body.modTags ? req.body.modTags.split(',').map(tag => tag.trim()) : [],
      modFileUrl: modFileUrl,
      modFileName: modFileName,
      screenshotUrls: screenshotUrls,
      installationInstructions: req.body.installationInstructions || null,
      requirements: req.body.requirements || null,
      status: 'pending_review',
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null
    };
    
    const db = require('./database');
    const [result] = await db.execute(
      `INSERT INTO mods (
        mod_name, mod_description, mod_version, author_name, author_email,
        author_website, mod_category, mod_tags, mod_file_url, mod_file_name,
        screenshot_urls, installation_instructions, requirements, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        modData.modName, modData.modDescription, modData.modVersion,
        modData.authorName, modData.authorEmail, modData.authorWebsite,
        modData.modCategory, JSON.stringify(modData.modTags),
        modData.modFileUrl, modData.modFileName,
        JSON.stringify(modData.screenshotUrls),
        modData.installationInstructions, modData.requirements,
        modData.status, modData.submittedAt
      ]
    );
    
    const modId = result.insertId;
    
    require('fs').unlinkSync(modFile.path);
    screenshots.forEach(s => require('fs').unlinkSync(s.path));
    
    res.json({
      success: true,
      message: 'Mod submitted successfully! It will now be reviewed.',
      fileUrl: modFileUrl,
      screenshotUrls: screenshotUrls
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload mod. Please try again.',
      error: error.message
    });
  }
});

module.exports = router;
```

### CORS Configuration

Make sure your Backblaze B2 bucket has CORS rules configured to allow uploads from your domain:

**CORS Rules in Backblaze B2:**
- **Allowed Origins:** `https://yourdomain.com`, `https://www.yourdomain.com`
- **Allowed Methods:** `GET`, `POST`, `PUT`, `HEAD`
- **Allowed Headers:** `*`
- **Expose Headers:** `x-bz-file-id`, `x-bz-file-name`, `Content-Type`
- **Max Age:** `3600`

### Security Checklist

- Application Key stored only on backend (environment variables)
- Never expose credentials in frontend code
- Validate file types and sizes server-side
- Sanitize file names to prevent path traversal
- Use HTTPS for all API calls
- Implement rate limiting on upload endpoint
- Scan uploaded files for malware (recommended)

## Backend Development Tasks

### Infrastructure and Environment Setup

#### INFRA: Provision Server with Ubuntu 22.04 LTS
**Priority:** High

**Action Required:** Provision server with Ubuntu 22.04 LTS (Jammy Jellyfish) to ensure cPanel/WHM stability and general compatibility.

#### INFRA: Install and Configure PM2
**Priority:** Medium

Install PM2 globally to run the Node.js API process. Configure PM2 to start the application automatically on server boot and restart on crashes.

#### INFRA: Setup Nginx Reverse Proxy for API
**Priority:** High, Security

Configure Nginx to listen on HTTPS (Port 443). Create a reverse proxy rule to route requests from the public endpoint (e.g., `https://api.yourdomain.com/api/submit-mod`) to the internal Node.js port (e.g., `http://localhost:3000`).

#### INFRA: Configure Firewall (UFW/cPanel)
**Priority:** Security

Ensure ports 80, 443, and the internal Node.js port (e.g., 3000) are correctly managed, blocking all unnecessary external access.

#### INFRA: Set Up Database Instance (MySQL/PostgreSQL)
**Priority:** Medium

Install and secure a database (e.g., MariaDB/PostgreSQL) and create the database and user credentials for the Node.js API to connect.

#### INFRA: Create Database Schema and Tables
**Priority:** Medium

Create the `mods` table schema in the database with the following fields:
- `id` (Primary Key, Auto Increment)
- `mod_name` (VARCHAR)
- `mod_description` (TEXT)
- `mod_version` (VARCHAR)
- `author_name` (VARCHAR)
- `author_email` (VARCHAR)
- `author_website` (VARCHAR, NULL)
- `mod_category` (VARCHAR)
- `mod_tags` (JSON or TEXT)
- `mod_file_url` (VARCHAR)
- `mod_file_name` (VARCHAR)
- `screenshot_urls` (JSON or TEXT)
- `installation_instructions` (TEXT, NULL)
- `requirements` (TEXT, NULL)
- `status` (VARCHAR, default: 'pending_review')
- `submitted_at` (DATETIME)
- `reviewed_at` (DATETIME, NULL)
- `reviewed_by` (VARCHAR, NULL)

### Secure Third-Party Integration

#### SECURITY: Store B2 Keys in Environment Variables
**Priority:** High, Security

Store the Backblaze B2 Application Key (`BACKBLAZE_B2_APPLICATION_KEY`) and Key ID (`BACKBLAZE_B2_KEY_ID`) securely as environment variables on the production server. These must not be checked into the repository.

#### SECURITY: Configure Backblaze B2 CORS Rules
**Priority:** Security

Set up CORS rules in the Backblaze B2 bucket settings to allow POST requests from the production domain of the static frontend (e.g., `https://www.vein-hosting.com`).

#### SECURITY: Implement Server-Side Validation
**Priority:** Security, Backend

Ensure the Node.js API validates file type, file size, and form data after the client-side check to prevent malicious submissions.

### Backend Development Tasks (Node.js API)

#### BACKEND: Setup Database Connection Module
**Priority:** High, Backend

Create a database connection module (e.g., `database.js` or `db.js`) that exports a connection pool or client configured with the database credentials from environment variables. This module should handle connection errors and provide a reusable connection interface for the API routes.

Example structure:
- Install database driver (mysql2, pg, etc.)
- Create connection pool with environment variable configuration
- Export connection pool/client for use in API routes
- Implement connection error handling and reconnection logic

#### BACKEND: Create POST /api/submit-mod Endpoint
**Priority:** High, Backend

Implement the core Express route using Multer middleware to receive the multipart form data and temporarily save the files (modFile and screenshots).

#### BACKEND: Integrate Backblaze B2 Upload Logic
**Priority:** High, Backend

Use the backblaze-b2 SDK to upload the temporary files to the VeinModdingHosting bucket and generate the public B2 URLs.

#### BACKEND: Implement Database Insertion Logic
**Priority:** High, Backend

Connect the API to the database and write the logic to insert the mod metadata (Mod Name, Author, Version, Status, and the B2 File URL) into the mods table.

#### BACKEND: Clean Up Temporary Files
**Priority:** Backend

Add logic to delete the temporary files created by Multer from the server's disk immediately after successful upload to B2.

#### BACKEND: Email Notification for Review
**Priority:** Backend, Low

Implement a service (e.g., using Nodemailer) to send an email alert to the site admin (admin@yourdomain.com) whenever a new mod submission is recorded in the database.

### Frontend Polish and Finalization

#### FRONTEND: Set Production API Endpoint
**Priority:** High, Frontend

Final Deployment Step: Update the `PRODUCTION_API_URL` constant in `upload-mod.js` to the live, secured URL (e.g., `https://api.yourdomain.com/api/submit-mod`).

#### TEST: End-to-End Submission Test
**Priority:** High, Testing

Perform a full test from form submission to B2 file appearance and database record creation.

## Frontend Configuration

The frontend JavaScript (`js/upload-mod.js`) is already configured to work with your Backblaze B2 bucket. The configuration object `BACKBLAZE_B2_CONFIG` contains:

- Bucket name: `VeinModdingHosting`
- Upload endpoint: `/api/submit-mod` (your backend API)

The frontend sends form data to your backend, which handles the actual Backblaze B2 upload securely.

## Testing

1. **Test File Upload:**
   ```bash
   curl -X POST http://localhost:3000/api/submit-mod \
     -F "modFile=@test-mod.pak" \
     -F "modName=Test Mod" \
     -F "authorName=Test Author" \
     -F "authorEmail=test@example.com"
   ```

2. **Verify Upload in Backblaze B2:**
   - Log into Backblaze B2 dashboard
   - Navigate to "VeinModdingHosting" bucket
   - Verify files appear in `mods/` and `screenshots/` folders

## Additional Resources

### Download Links

- **Backend Integration Guide:** [Google Drive](https://drive.google.com/file/d/1V--pT6lnhp6Xx7D6Xvh8NSiwc1tqndav/view?usp=sharing)
- **Tool Configuration Reference:** [VEIN Modding - Tool Configuration](https://veinmodding.com/#Pages/Introduction/3_ToolConfiguration.html)

## Support

For Backblaze B2 documentation, visit: https://www.backblaze.com/b2/docs/
