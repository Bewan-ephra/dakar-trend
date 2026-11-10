<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_payment_rules', function (Blueprint $table) {
            $table->id();
            $table->string('phone');
            $table->string('phone_key')->unique();
            $table->boolean('requires_deposit')->default(true);
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_payment_rules');
    }
};
