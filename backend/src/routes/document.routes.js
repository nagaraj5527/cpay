import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  uploadDocument,
  getDocument,
  uploadProfilePhoto,
  getProfilePhoto,
  getDocumentStatusList
} from '../controllers/document.controller.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload a document (Aadhaar, PAN, Signature, etc.)
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  uploadDocument
);

// Upload user profile photo
router.post(
  '/profile-photo',
  authenticate,
  upload.single('file'),
  uploadProfilePhoto
);

// Get user profile photo
router.get(
  '/profile-photo/:mobile',
  getProfilePhoto
);

// Get status list of uploaded documents
router.get(
  '/status/:registrationId',
  getDocumentStatusList
);

// Get binary document content (wildcard route must be last)
router.get(
  '/:registrationId/:documentType',
  getDocument
);

export default router;
