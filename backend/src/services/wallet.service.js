import pool from '../config/postgres.js';

/*
========================================================
1. GET /api/wallet - Load User Wallet Balances & Recent Transactions
========================================================
*/
export const getWalletData = async (user) => {
    const userId = user.userId;

    // Ensure wallet_balances record exists
    let walletRes = await pool.query(
        `SELECT * FROM cpay.wallet_balances WHERE user_id = $1;`,
        [userId]
    );

    if (walletRes.rows.length === 0) {
        // Create initial wallet balance (Default 0 Credits, ₹0.00 Cash)
        const initRes = await pool.query(
            `INSERT INTO cpay.wallet_balances (user_id, credit_wallet_balance, cash_wallet_balance, currency, created_at, updated_at)
             VALUES ($1, 0, 0.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *;`,
            [userId]
        );
        walletRes = initRes;
    }

    // Fetch transactions
    const txRes = await pool.query(
        `SELECT transaction_id AS id, transaction_type AS type, details, 
                credit_amount, cash_amount, status, created_at AS date
         FROM cpay.wallet_transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 50;`,
        [userId]
    );

    // Fetch trade history
    const tradeRes = await pool.query(
        `SELECT trade_id AS id, trade_type AS type, quantity, price_per_credit AS price, 
                total_amount AS total, status, created_at AS date
         FROM cpay.carbon_trades
         WHERE seller_user_id = $1 OR buyer_user_id = $1
         ORDER BY created_at DESC
         LIMIT 50;`,
        [userId]
    );

    const wallet = walletRes.rows[0];

    return {
        success: true,
        data: {
            creditBalance: Number(wallet.credit_wallet_balance || 0),
            cashBalance: Number(wallet.cash_wallet_balance || 0),
            currency: wallet.currency || 'INR',
            transactions: txRes.rows,
            trades: tradeRes.rows
        }
    };
};

/*
========================================================
2. POST /api/wallet/trade - Execute Carbon Credit Trade in Single DB Transaction
========================================================
*/
export const executeTrade = async (user, tradePayload) => {
    const { quantity, tradeType, project, pricePerCredit } = tradePayload;
    const qty = Number(quantity);
    const price = Number(pricePerCredit || 120);
    const totalAmount = qty * price;
    const type = (tradeType || 'BUY').toUpperCase();

    if (!qty || qty <= 0 || isNaN(qty)) {
        throw new Error('Please specify a valid credit quantity');
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch user wallet
        let wRes = await client.query(
            `SELECT * FROM cpay.wallet_balances WHERE user_id = $1 FOR UPDATE;`,
            [user.userId]
        );

        if (wRes.rows.length === 0) {
            const newW = await client.query(
                `INSERT INTO cpay.wallet_balances (user_id, credit_wallet_balance, cash_wallet_balance)
                 VALUES ($1, 0, 0.00) RETURNING *;`,
                [user.userId]
            );
            wRes = newW;
        }

        const wallet = wRes.rows[0];
        let currentCredit = Number(wallet.credit_wallet_balance || 0);
        let currentCash = Number(wallet.cash_wallet_balance || 0);

        if (type === 'BUY') {
            if (totalAmount > currentCash) {
                throw new Error(`Insufficient cash balance. Required: ₹${totalAmount.toLocaleString('en-IN')}, Available: ₹${currentCash.toLocaleString('en-IN')}`);
            }
            currentCash -= totalAmount;
            currentCredit += qty;
        } else if (type === 'SELL') {
            if (qty > currentCredit) {
                throw new Error(`Insufficient carbon credits in wallet. Available: ${currentCredit} credits`);
            }
            currentCredit -= qty;
            currentCash += totalAmount;
        }

        // Update balance
        await client.query(
            `UPDATE cpay.wallet_balances
             SET credit_wallet_balance = $1,
                 cash_wallet_balance = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $3;`,
            [currentCredit, currentCash, user.userId]
        );

        // Record trade
        const tradeRes = await client.query(
            `INSERT INTO cpay.carbon_trades
             (seller_user_id, buyer_user_id, quantity, price_per_credit, total_amount, trade_type, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED', CURRENT_TIMESTAMP)
             RETURNING *;`,
            [type === 'SELL' ? user.userId : null, type === 'BUY' ? user.userId : null, qty, price, totalAmount, type]
        );

        // Record wallet transaction
        const txType = type === 'BUY' ? 'Credit Purchase' : 'Credit Sale';
        await client.query(
            `INSERT INTO cpay.wallet_transactions
             (user_id, transaction_type, details, credit_amount, cash_amount, status, created_at)
             VALUES ($1, $2, $3, $4, $5, 'COMPLETED', CURRENT_TIMESTAMP);`,
            [
                user.userId,
                txType,
                `${type === 'BUY' ? 'Bought' : 'Sold'} ${qty.toLocaleString('en-IN')} carbon credits for ${project || 'Ecosystem Carbon Project'}`,
                type === 'BUY' ? qty : -qty,
                type === 'BUY' ? -totalAmount : totalAmount
            ]
        );

        await client.query('COMMIT');

        return {
            success: true,
            message: `Trade executed successfully! ${type === 'BUY' ? 'Purchased' : 'Sold'} ${qty} carbon credits for ₹${totalAmount.toLocaleString('en-IN')}.`,
            data: {
                tradeId: tradeRes.rows[0].trade_id,
                creditBalance: currentCredit,
                cashBalance: currentCash,
                totalAmount
            }
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
