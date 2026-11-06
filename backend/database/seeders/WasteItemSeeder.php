<?php

namespace Database\Seeders;

use App\Models\WasteItem;
use Illuminate\Database\Seeder;

class WasteItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            // Organic
            ['name' => 'Banana peel', 'icon' => '🍌', 'bin' => 'organic', 'tip' => 'Fruit and veg scraps break down quickly — into the organic bin.', 'coco_class' => 'banana'],
            ['name' => 'Apple core', 'icon' => '🍎', 'bin' => 'organic', 'tip' => 'Compostable food waste belongs in the organic bin.', 'coco_class' => 'apple'],
            ['name' => 'Orange peel', 'icon' => '🍊', 'bin' => 'organic', 'tip' => 'Citrus peels are food waste — organic bin.', 'coco_class' => 'orange'],
            ['name' => 'Coffee grounds', 'icon' => '☕', 'bin' => 'organic', 'tip' => 'Used grounds are great compost material.', 'coco_class' => null],
            ['name' => 'Pizza slice', 'icon' => '🍕', 'bin' => 'organic', 'tip' => 'Leftover food goes to organic, not the trash.', 'coco_class' => 'pizza'],
            ['name' => 'Bread', 'icon' => '🍞', 'bin' => 'organic', 'tip' => 'Stale or leftover bread is organic waste.', 'coco_class' => null],
            ['name' => 'Broccoli', 'icon' => '🥦', 'bin' => 'organic', 'tip' => 'Vegetable trimmings are compostable organic waste.', 'coco_class' => 'broccoli'],
            ['name' => 'Carrot', 'icon' => '🥕', 'bin' => 'organic', 'tip' => 'Vegetable scraps belong in organic waste.', 'coco_class' => 'carrot'],
            ['name' => 'Sandwich', 'icon' => '🥪', 'bin' => 'organic', 'tip' => 'Leftover food is organic waste.', 'coco_class' => 'sandwich'],
            ['name' => 'Donut', 'icon' => '🍩', 'bin' => 'organic', 'tip' => 'Food waste belongs in the organic bin.', 'coco_class' => 'donut'],
            ['name' => 'Cake', 'icon' => '🍰', 'bin' => 'organic', 'tip' => 'Food waste belongs in the organic bin.', 'coco_class' => 'cake'],
            ['name' => 'Hot dog', 'icon' => '🌭', 'bin' => 'organic', 'tip' => 'Food waste belongs in the organic bin.', 'coco_class' => 'hot dog'],

            // Recyclable
            ['name' => 'Plastic bottle', 'icon' => '🧴', 'bin' => 'recyclable', 'tip' => 'Empty and rinse it — plastic bottles are recyclable.', 'coco_class' => 'bottle'],
            ['name' => 'Glass jar', 'icon' => '🫙', 'bin' => 'recyclable', 'tip' => 'Clean glass jars and bottles are recyclable.', 'coco_class' => null],
            ['name' => 'Soda can', 'icon' => '🥫', 'bin' => 'recyclable', 'tip' => 'Aluminum cans are highly recyclable — rinse first.', 'coco_class' => null],
            ['name' => 'Newspaper', 'icon' => '📰', 'bin' => 'recyclable', 'tip' => 'Dry paper and cardboard belong in recyclables.', 'coco_class' => null],
            ['name' => 'Cardboard box', 'icon' => '📦', 'bin' => 'recyclable', 'tip' => 'Flatten it — clean cardboard is recyclable.', 'coco_class' => null],
            ['name' => 'Wine glass', 'icon' => '🍷', 'bin' => 'recyclable', 'tip' => 'Glassware is recyclable when clean and unbroken.', 'coco_class' => 'wine glass'],
            ['name' => 'Book', 'icon' => '📖', 'bin' => 'recyclable', 'tip' => 'Paper-based books can usually be recycled.', 'coco_class' => 'book'],
            ['name' => 'Cup', 'icon' => '🥤', 'bin' => 'recyclable', 'tip' => 'Clean cups are typically recyclable.', 'coco_class' => 'cup'],
            ['name' => 'Bowl', 'icon' => '🥣', 'bin' => 'recyclable', 'tip' => 'Clean bowls are typically recyclable.', 'coco_class' => 'bowl'],

            // Residual
            ['name' => 'Broken mug', 'icon' => '🍵', 'bin' => 'residual', 'tip' => 'Broken ceramics aren’t recyclable glass — residual bin.', 'coco_class' => null],
            ['name' => 'Phone', 'icon' => '📱', 'bin' => 'residual', 'tip' => 'Electronics need special e-waste recycling — never a regular bin. Find a drop-off point.', 'coco_class' => 'cell phone'],
            ['name' => 'Battery', 'icon' => '🔋', 'bin' => 'residual', 'tip' => 'Batteries are hazardous waste — take them to a battery drop-off, don’t bin them if you can avoid it.', 'coco_class' => null],
            ['name' => 'Chip bag', 'icon' => '🥔', 'bin' => 'residual', 'tip' => 'Foil-lined snack bags usually can’t be recycled curbside.', 'coco_class' => null],
            ['name' => 'Toothbrush', 'icon' => '🪥', 'bin' => 'residual', 'tip' => 'Mixed-material plastics like this go to residual waste.', 'coco_class' => 'toothbrush'],
            ['name' => 'Remote control', 'icon' => '🎮', 'bin' => 'residual', 'tip' => 'Small electronics belong with e-waste, not recycling.', 'coco_class' => 'remote'],
            ['name' => 'Styrofoam cup', 'icon' => '🥤', 'bin' => 'residual', 'tip' => 'Most curbside programs don’t take polystyrene — residual bin.', 'coco_class' => null],
            ['name' => 'Laptop', 'icon' => '💻', 'bin' => 'residual', 'tip' => 'Electronics need e-waste recycling, not a regular bin.', 'coco_class' => 'laptop'],
            ['name' => 'Keyboard', 'icon' => '⌨️', 'bin' => 'residual', 'tip' => 'Electronics need e-waste recycling, not a regular bin.', 'coco_class' => 'keyboard'],
            ['name' => 'Computer mouse', 'icon' => '🖱️', 'bin' => 'residual', 'tip' => 'Electronics need e-waste recycling, not a regular bin.', 'coco_class' => 'mouse'],
            ['name' => 'TV / monitor', 'icon' => '📺', 'bin' => 'residual', 'tip' => 'Electronics need e-waste recycling, not a regular bin.', 'coco_class' => 'tv'],
            ['name' => 'Scissors', 'icon' => '✂️', 'bin' => 'residual', 'tip' => 'Mixed-material items go to residual waste.', 'coco_class' => 'scissors'],
            ['name' => 'Toy', 'icon' => '🧸', 'bin' => 'residual', 'tip' => 'Mixed-material toys go to residual waste.', 'coco_class' => 'teddy bear'],
            ['name' => 'Vase', 'icon' => '🏺', 'bin' => 'residual', 'tip' => 'Broken ceramics/decor go to residual waste.', 'coco_class' => 'vase'],
            ['name' => 'Bag', 'icon' => '🎒', 'bin' => 'residual', 'tip' => 'Mixed-material bags typically go to residual waste.', 'coco_class' => 'backpack'],
        ];

        foreach ($items as $item) {
            WasteItem::updateOrCreate(
                ['name' => $item['name']],
                $item
            );
        }
    }
}
