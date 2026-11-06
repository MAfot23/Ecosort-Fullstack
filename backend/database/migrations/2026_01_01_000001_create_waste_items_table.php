<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waste_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon');
            $table->enum('bin', ['organic', 'recyclable', 'residual']);
            $table->text('tip');
            $table->string('coco_class')->nullable()->unique(); // links a COCO-SSD detection class to this item
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waste_items');
    }
};
