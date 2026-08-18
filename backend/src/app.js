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
import pondRoutes from './routes/pond.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import supportRoutes from './routes/support.routes.js';
import treeMangroveRoutes from './routes/tree_mangrove.routes.js';

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
app.use('/api/v1/auth', authRoutes);

/*
====================================================
Registration APIs
====================================================
*/

app.use('/api/registration', registrationRoutes);
app.use('/api/v1/registration', registrationRoutes);

/*
====================================================
Carbon Calculator APIs
====================================================
*/

app.use('/api/calculator', calculatorRoutes);
app.use('/api/v1/calculator', calculatorRoutes);
app.use('/api/carbon', treeMangroveRoutes);
app.use('/api/v1/carbon', treeMangroveRoutes);

/*
====================================================
Document & File Upload APIs
====================================================
*/

app.use('/api/documents', documentRoutes);
app.use('/api/v1/documents', documentRoutes);

/*
====================================================
Super Admin APIs
====================================================
*/
app.use('/api/admin', adminRoutes);
app.use('/api/v1/admin', adminRoutes);

/*
====================================================
Valuator/Auditor APIs
====================================================
*/
app.use('/api/valuator', valuatorRoutes);
app.use('/api/v1/valuator', valuatorRoutes);

/*
====================================================
Aquaculture Enterprise APIs
====================================================
*/
app.use('/api/aquaculture', aquacultureRoutes);
app.use('/api/v1/aquaculture', aquacultureRoutes);

/*
====================================================
Seller Dashboard Asset Management APIs
====================================================
*/
app.use('/api/seller', sellerAssetRoutes);
app.use('/api/v1/seller', sellerAssetRoutes);

/*
====================================================
Wallet & Carbon Credit Trading APIs
====================================================
*/
app.use('/api/wallet', walletRoutes);
app.use('/api/v1/wallet', walletRoutes);

/*
====================================================
Multi-Pond, Notification & Support Enterprise APIs
====================================================
*/
app.use('/api/ponds', pondRoutes);
app.use('/api/v1/ponds', pondRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/v1/support', supportRoutes);


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