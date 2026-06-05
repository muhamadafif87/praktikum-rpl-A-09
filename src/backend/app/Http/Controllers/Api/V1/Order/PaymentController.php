<?php

namespace App\Http\Controllers\Api\V1\Order;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PaymentController extends Controller {
    public function processPayment(){
        //Receives the initial payload (e.g., amount, card token) and calls the service layer
    }

    //Qris payment method: generate qr, and connect payment

    public function getPaymentStatus(){
        //Exposes an endpoint to check if a payment is pending, completed, or failed.
    }

    public function handleWebHook(){
        //Listens for asynchronous updates from payment gateways (like Stripe or PayPal) and triggers the service to update order records.
    }
}
