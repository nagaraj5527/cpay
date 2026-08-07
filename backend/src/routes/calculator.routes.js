import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleCalculation, getCalculatorDefaults } from '../controllers/calculator.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post('/calculate', handleCalculation);
router.get('/defaults', getCalculatorDefaults);

router.get('/download-pdf', (req, res) => {
  const pdfPath = path.join(__dirname, '../documents/Aquaculture_Pond_Carbon_Credit_Calculator.pdf');
  return res.download(pdfPath, 'Aquaculture_Pond_Carbon_Credit_Calculator.pdf', (err) => {
    if (err) {
      console.error('Error downloading PDF:', err);
      res.status(500).json({ success: false, message: 'Could not download the PDF document' });
    }
  });
});

export default router;
