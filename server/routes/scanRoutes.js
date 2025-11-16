const express = require("express");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");
const { MultiFormatReader, BarcodeFormat, DecodeHintType, RGBLuminanceSource, BinaryBitmap, HybridBinarizer } = require("@zxing/library");
const Food = require("../models/food");
const auth = require("../middleware/authMiddleware");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP, BMP)!'));
    }
  }
});

// Decode barcode from image using ZXing
async function decodeBarcode(imagePath) {
  try {
    // Validate file exists
    if (!fs.existsSync(imagePath)) {
      return { success: false, error: 'Uploaded file not found' };
    }

    // Get image metadata first
    const metadata = await sharp(imagePath).metadata();
    console.log('Image metadata:', metadata);

    // Preprocess image for better barcode detection
    const { data, info } = await sharp(imagePath)
      .greyscale()
      .normalise()
      .linear(1.2, 0) // Increase contrast
      .sharpen()
      .raw()
      .toBuffer({ resolveWithObject: true });

    console.log('Processed image info:', info);

    // Create MultiFormatReader
    const reader = new MultiFormatReader();
    
    // Set hints for barcode formats
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    
    reader.setHints(hints);

    // Create luminance source
    const luminanceSource = new RGBLuminanceSource(data, info.width, info.height);
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

    try {
      const result = reader.decode(binaryBitmap);
      
      if (result) {
        console.log('Barcode decoded successfully:', result.getText());
        return {
          success: true,
          barcode: result.getText(),
          format: BarcodeFormat[result.getBarcodeFormat()]
        };
      }
    } catch (decodeError) {
      console.log("First decode attempt failed:", decodeError.message);
      
      // Try alternative approach with different image processing
      try {
        const altBuffer = await sharp(imagePath)
          .greyscale()
          .normalise()
          .raw()
          .toBuffer({ resolveWithObject: true });
        
        const altLuminanceSource = new RGBLuminanceSource(altBuffer.data, altBuffer.info.width, altBuffer.info.height);
        const altBinaryBitmap = new BinaryBitmap(new HybridBinarizer(altLuminanceSource));
        
        const altResult = reader.decode(altBinaryBitmap);
        
        if (altResult) {
          console.log('Barcode decoded successfully (alternative):', altResult.getText());
          return {
            success: true,
            barcode: altResult.getText(),
            format: BarcodeFormat[altResult.getBarcodeFormat()]
          };
        }
      } catch (altError) {
        console.log("Alternative decode failed:", altError.message);
      }
    }
    
    return { 
      success: false, 
      error: 'No barcode detected. Ensure the barcode is clear and properly framed.' 
    };
  } catch (error) {
    console.error('Error decoding barcode:', error);
    return { 
      success: false, 
      error: `Image processing error: ${error.message}` 
    };
  }
}

// Alternative simpler barcode decoding function using a different approach
async function decodeBarcodeSimple(imagePath) {
  try {
    const { createCanvas, loadImage } = require('canvas');
    const jsQR = require('jsqr');
    
    // Load and process image
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      return {
        success: true,
        barcode: code.data,
        format: 'QR_CODE'
      };
    }
    
    return { success: false, error: 'No QR code detected' };
  } catch (error) {
    console.error('Error in simple decode:', error);
    return { success: false, error: error.message };
  }
}

// Upload and decode barcode from image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No image file uploaded or file type not supported' 
      });
    }

    console.log('Processing uploaded image:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });

    // Validate file size
    if (req.file.size === 0) {
      // Clean up empty file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Uploaded file is empty'
      });
    }

    let result = await decodeBarcode(req.file.path);
    
    // If ZXing fails, try the simple QR code approach
    if (!result.success) {
      console.log('ZXing failed, trying alternative decoder...');
      result = await decodeBarcodeSimple(req.file.path);
    }
    
    // Clean up uploaded file
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (err) {
      console.error('Error deleting temp file:', err);
    }
    
    if (result.success) {
      console.log('Barcode decoded successfully:', result.barcode);
      res.json({
        success: true,
        barcode: result.barcode,
        format: result.format
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Could not decode barcode from image. Please ensure the barcode is clear and try again.'
      });
    }
  } catch (error) {
    console.error('Error processing image:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting temp file on error:', err);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Error processing image: ' + error.message
    });
  }
});

// Get product info from OpenFoodFacts API
router.get('/product/:barcode', async (req, res) => {
  const { barcode } = req.params;

  // Validate barcode format
  if (!barcode || !/^\d+$/.test(barcode)) {
    return res.status(400).json({ error: 'Invalid barcode format' });
  }

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching product info:', error);
    res.status(500).json({ error: 'Error fetching product information', details: error.message });
  }
});

// Calculate health score
router.post('/health-score', async (req, res) => {
  try {
    const { product, indianMatch } = req.body;
    
    if (!product) {
      return res.status(400).json({ error: 'Product data required' });
    }

    let score = 50;
    
    // Check if nutriscore is available
    if (product.nutriscore_grade) {
      const scoreMap = {
        'a': { score: 90, color: 'green', label: 'Very Healthy' },
        'b': { score: 75, color: 'green', label: 'Healthy' },
        'c': { score: 60, color: 'yellow', label: 'Moderate' },
        'd': { score: 40, color: 'yellow', label: 'Less Healthy' },
        'e': { score: 20, color: 'red', label: 'Unhealthy' }
      };
      const result = scoreMap[product.nutriscore_grade.toLowerCase()] || { score: 50, color: 'yellow', label: 'Moderate' };
      return res.json(result);
    }
    
    // Calculate based on nutriments
    if (product.nutriments) {
      const nut = product.nutriments;
      
      // Negative factors
      if (nut.sugars_100g > 22.5) score -= 20;
      else if (nut.sugars_100g > 5) score -= 10;
      
      if (nut.salt_100g > 1.5) score -= 15;
      else if (nut.salt_100g > 0.3) score -= 7;
      
      if (nut.fat_100g > 17.5) score -= 20;
      else if (nut.fat_100g > 3) score -= 10;
      
      // Positive factors
      if (nut.fiber_100g > 6) score += 15;
      else if (nut.fiber_100g > 3) score += 7;
      
      if (nut.proteins_100g > 12) score += 15;
      else if (nut.proteins_100g > 6) score += 7;
    }
    
    // Bonus for Indian match
    if (indianMatch) {
      if (indianMatch.source === 'IFCT') score += 10;
      if (indianMatch.source === 'INDB') score += 5;
    }
    
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    let color, label;
    if (score >= 70) {
      color = 'green';
      label = score >= 85 ? 'Very Healthy' : 'Healthy';
    } else if (score >= 40) {
      color = 'yellow';
      label = score >= 55 ? 'Moderate' : 'Less Healthy';
    } else {
      color = 'red';
      label = 'Unhealthy';
    }
    
    res.json({ score, color, label });
  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({ error: 'Error calculating health score', details: error.message });
  }
});

module.exports = router;