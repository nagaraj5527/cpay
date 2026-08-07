import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import calculatorRoutes from './routes/calculator.routes.js';
import documentRoutes from './routes/document.routes.js';
import adminRoutes from './routes/admin.routes.js';
import valuatorRoutes from './routes/valuator.routes.js';
import aquacultureRoutes from './routes/aquaculture.routes.js';
import sellerAssetRoutes from './routes/seller_asset.routes.js';
import walletRoutes from './routes/wallet.routes.js';

const app = express();

/*
====================================================
Security Middleware
====================================================
*/

app.use(helmet());

/*
====================================================
CORS Configuration
====================================================
*/

app.use(cors({

    origin: 'http://localhost:4200',

    credentials: true

}));

/*
====================================================
Body Parser Middleware
====================================================
*/

app.use(express.json());

app.use(express.urlencoded({

    extended: true

}));

/*
====================================================
HTTP Request Logger
====================================================
*/

app.use(morgan('dev'));

/*
====================================================
Health Check API
====================================================
*/

app.get('/api/health', (req, res) => {

    res.status(200).json({

        success: true,

        message: 'C-PAY Backend Running Successfully',

        timestamp: new Date().toISOString()

    });

});

/*
====================================================
Authentication APIs
====================================================
*/

app.use('/api/auth', authRoutes);

/*
====================================================
Registration APIs
====================================================
*/

app.use('/api/registration', registrationRoutes);

/*
====================================================
Carbon Calculator APIs
====================================================
*/

app.use('/api/calculator', calculatorRoutes);

/*
====================================================
Document & File Upload APIs
====================================================
*/

app.use('/api/documents', documentRoutes);

/*
====================================================
Super Admin APIs
====================================================
*/
app.use('/api/admin', adminRoutes);

/*
====================================================
Valuator/Auditor APIs
====================================================
*/
app.use('/api/valuator', valuatorRoutes);

/*
====================================================
Aquaculture Enterprise APIs
====================================================
*/
app.use('/api/aquaculture', aquacultureRoutes);

/*
====================================================
Seller Dashboard Asset Management APIs
====================================================
*/
app.use('/api/seller', sellerAssetRoutes);

/*
====================================================
Wallet & Carbon Credit Trading APIs
====================================================
*/
app.use('/api/wallet', walletRoutes);


/*
====================================================
404 Handler
====================================================
*/

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: 'API Route Not Found'

    });

});

/*
====================================================
Global Error Handler
====================================================
*/

app.use((err, req, res, next) => {

    console.error(err);

    res.status(err.status || 500).json({

        success: false,

        message: err.message || 'Internal Server Error'

    });

});

export default app;