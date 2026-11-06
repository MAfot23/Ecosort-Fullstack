<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scan_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('coco_class');
            $table->float('confidence')->nullable();
            $table->boolean('matched');
            $table->foreignId('waste_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('method')->default('camera'); // 'camera' or 'manual'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scan_logs');
    }
};
