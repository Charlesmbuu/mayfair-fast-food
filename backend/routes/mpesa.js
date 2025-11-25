const express = require('express');
const mpesaService = require('../services/mpesaService');
const db = require('../config/database');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Initiate M-Pesa STK Push
// @route   POST /api/mpesa/stk-push
// @access  Private
router.post('/stk-push', protect, async (req, res) => {
  const client = await db.pool.connect();

  try {
    const { order_id, phone_number } = req.body;
    const user_id = req.user.id;
    const tenant_id = req.user.tenant_id;

    // Validation
    if (!order_id || !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and phone number are required',
      });
    }

    await client.query('BEGIN');

    // 1. Verify order exists and belongs to user
    const orderQuery = `
      SELECT o.id, o.order_number, o.total_amount, o.status, o.user_id
      FROM orders o
      WHERE o.id = $1 AND o.tenant_id = $2 AND o.user_id = $3
      FOR UPDATE
    `;
    const orderResult = await client.query(orderQuery, [order_id, tenant_id, user_id]);

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const order = orderResult.rows[0];

    // 2. Check if order is in pending status
    if (order.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Order already ${order.status}`,
      });
    }

    // 3. Check if payment already exists for this order
    const paymentCheckQuery = `
      SELECT id FROM payments 
      WHERE order_id = $1 AND status = 'completed'
    `;
    const paymentCheck = await client.query(paymentCheckQuery, [order_id]);

    if (paymentCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order',
      });
    }

    // 4. Initiate STK Push
    const stkResult = await mpesaService.initiateSTKPush(
      phone_number,
      order.total_amount,
      order.order_number,
      'Food Order Payment'
    );

    if (!stkResult.success) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: stkResult.error,
        errorCode: stkResult.errorCode,
      });
    }

    // 5. Save payment record
    const insertPaymentQuery = `
      INSERT INTO payments (
        tenant_id, order_id, user_id, amount, phone_number,
        checkout_request_id, merchant_request_id, payment_method, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const paymentResult = await client.query(insertPaymentQuery, [
      tenant_id,
      order_id,
      user_id,
      order.total_amount,
      mpesaService.formatPhoneNumber(phone_number),
      stkResult.checkoutRequestID,
      stkResult.data.MerchantRequestID,
      'mpesa',
      'pending'
    ]);

    // 6. Update order status to 'payment_pending'
    const updateOrderQuery = `
      UPDATE orders 
      SET status = 'payment_pending', updated_at = NOW()
      WHERE id = $1
    `;
    await client.query(updateOrderQuery, [order_id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'M-Pesa payment initiated successfully',
      data: {
        payment: paymentResult.rows[0],
        stk_push_response: stkResult.data,
        message: 'Enter your M-Pesa PIN to complete payment',
      },
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('STK Push Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate M-Pesa payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  } finally {
    client.release();
  }
});

// @desc    M-Pesa Callback Handler
// @route   POST /api/mpesa/callback
// @access  Public (called by Safaricom)
router.post('/callback', async (req, res) => {
  const client = await db.pool.connect();

  try {
    const callbackData = req.body;

    console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));

    // Safaricom expects a response immediately
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully',
    });

    // Process callback asynchronously
    processCallbackAsync(callbackData, client);

  } catch (error) {
    console.error('Callback Handler Error:', error);
    res.status(200).json({
      ResultCode: 1,
      ResultDesc: 'Callback processing failed',
    });
  } finally {
    client.release();
  }
});

/**
 * Process M-Pesa callback asynchronously
 */
async function processCallbackAsync(callbackData, client) {
  try {
    const resultCode = parseInt(callbackData.Body.stkCallback.ResultCode);
    const resultDesc = callbackData.Body.stkCallback.ResultDesc;
    const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata;
    const checkoutRequestID = callbackData.Body.stkCallback.CheckoutRequestID;

    await client.query('BEGIN');

    // 1. Find payment record
    const paymentQuery = `
      SELECT p.*, o.id as order_id, o.tenant_id, o.user_id
      FROM payments p
      INNER JOIN orders o ON p.order_id = o.id
      WHERE p.checkout_request_id = $1
      FOR UPDATE
    `;
    const paymentResult = await client.query(paymentQuery, [checkoutRequestID]);

    if (paymentResult.rows.length === 0) {
      console.error('Payment record not found for checkout request:', checkoutRequestID);
      await client.query('ROLLBACK');
      return;
    }

    const payment = paymentResult.rows[0];

    if (resultCode === 0) {
      // Payment successful
      const metadataItems = callbackMetadata.Item;
      const mpesaReceiptNumber = metadataItems.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = metadataItems.find(item => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = metadataItems.find(item => item.Name === 'PhoneNumber')?.Value;

      // Update payment record
      const updatePaymentQuery = `
        UPDATE payments 
        SET 
          status = 'completed',
          mpesa_receipt_number = $1,
          transaction_date = TO_TIMESTAMP($2::bigint),
          raw_callback_data = $3,
          completed_at = NOW()
        WHERE id = $4
      `;
      await client.query(updatePaymentQuery, [
        mpesaReceiptNumber,
        transactionDate,
        JSON.stringify(callbackData),
        payment.id
      ]);

      // Update order status
      const updateOrderQuery = `
        UPDATE orders 
        SET 
          status = 'confirmed',
          mpesa_receipt_number = $1,
          payment_method = 'mpesa',
          updated_at = NOW()
        WHERE id = $2
      `;
      await client.query(updateOrderQuery, [mpesaReceiptNumber, payment.order_id]);

      // Log order status change
      const insertStatusLogQuery = `
        INSERT INTO order_status_log (order_id, old_status, new_status, notes)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(insertStatusLogQuery, [
        payment.order_id,
        'payment_pending',
        'confirmed',
        `Payment confirmed via M-Pesa. Receipt: ${mpesaReceiptNumber}`
      ]);

      console.log(`Payment completed for order ${payment.order_id}. M-Pesa Receipt: ${mpesaReceiptNumber}`);

    } else {
      // Payment failed
      const updatePaymentQuery = `
        UPDATE payments 
        SET 
          status = 'failed',
          failure_reason = $1,
          raw_callback_data = $2,
          completed_at = NOW()
        WHERE id = $3
      `;
      await client.query(updatePaymentQuery, [
        resultDesc,
        JSON.stringify(callbackData),
        payment.id
      ]);

      // Revert order status to pending
      const updateOrderQuery = `
        UPDATE orders 
        SET status = 'pending', updated_at = NOW()
        WHERE id = $1
      `;
      await client.query(updateOrderQuery, [payment.order_id]);

      console.log(`Payment failed for order ${payment.order_id}. Reason: ${resultDesc}`);
    }

    await client.query('COMMIT');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Async Callback Processing Error:', error);
  }
}

// @desc    Query payment status
// @route   GET /api/mpesa/payment-status/:orderId
// @access  Private
router.get('/payment-status/:orderId', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const user_id = req.user.id;
    const tenant_id = req.user.tenant_id;

    const paymentQuery = `
      SELECT p.*, o.status as order_status, o.order_number
      FROM payments p
      INNER JOIN orders o ON p.order_id = o.id
      WHERE p.order_id = $1 AND o.tenant_id = $2 AND o.user_id = $3
      ORDER BY p.created_at DESC
      LIMIT 1
    `;

    const paymentResult = await db.query(paymentQuery, [orderId, tenant_id, user_id]);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    const payment = paymentResult.rows[0];

    // If payment is still pending, query M-Pesa for status
    if (payment.status === 'pending') {
      try {
        const queryResult = await mpesaService.queryTransactionStatus(payment.checkout_request_id);
        
        // Update payment status based on query result
        if (queryResult.ResultCode === 0) {
          // Payment completed via query
          // You would update the database here similar to the callback handler
        }
      } catch (queryError) {
        console.error('Payment status query failed:', queryError);
      }
    }

    res.json({
      success: true,
      data: payment,
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
    });
  }
});

module.exports = router;