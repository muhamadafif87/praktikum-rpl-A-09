<?php

namespace App\Services;

class PaymentService {
    public function createPaymentIntent(){
        // Prepares the transaction details and requests a secure payment token or intent from the gateway.
    }

    public function processTransaction(){
        // executes the capture or charge with the acquiring bank/processor.
    }

    public function updatePaymentStatus(){
        // Updates the database to record whether the payment succeeded or failed.
    }

    public function issueRefund(){
        // Processes a refund request via the payment gateway API
    }
}
