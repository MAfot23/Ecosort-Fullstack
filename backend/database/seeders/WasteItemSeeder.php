<?php

namespace Database\Seeders;

use App\Models\WasteItem;
use Illuminate\Database\Seeder;

class WasteItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            // ── ORGANIC WASTE (Nabubulok) ──────────────────────────────────────
            ['name' => 'Banana peel',         'icon' => '🍌', 'bin' => 'organic', 'tip' => 'Fruit and veg scraps break down quickly — into the organic bin.', 'coco_class' => 'banana'],
            ['name' => 'Apple core',          'icon' => '🍎', 'bin' => 'organic', 'tip' => 'Compostable fruit waste belongs in the organic bin.', 'coco_class' => 'apple'],
            ['name' => 'Orange peel',         'icon' => '🍊', 'bin' => 'organic', 'tip' => 'Citrus peels are compostable food waste — organic bin.', 'coco_class' => 'orange'],
            ['name' => 'Leftover rice / food','icon' => '🍚', 'bin' => 'organic', 'tip' => 'Cooked food scraps, rice, and table leftovers belong in the organic bin.', 'coco_class' => null],
            ['name' => 'Eggshells',           'icon' => '🥚', 'bin' => 'organic', 'tip' => 'Eggshells are rich in minerals and make excellent compost.', 'coco_class' => null],
            ['name' => 'Coffee grounds',      'icon' => '☕', 'bin' => 'organic', 'tip' => 'Used grounds and tea leaves are great compost material.', 'coco_class' => null],
            ['name' => 'Tea bag',             'icon' => '🫖', 'bin' => 'organic', 'tip' => 'Natural paper tea bags and loose leaves decompose quickly.', 'coco_class' => null],
            ['name' => 'Pizza slice / crust', 'icon' => '🍕', 'bin' => 'organic', 'tip' => 'Leftover food scraps go to organic compost.', 'coco_class' => 'pizza'],
            ['name' => 'Bread & bakery',      'icon' => '🍞', 'bin' => 'organic', 'tip' => 'Stale bread, pastries, and crusts are organic waste.', 'coco_class' => null],
            ['name' => 'Broccoli & greens',   'icon' => '🥦', 'bin' => 'organic', 'tip' => 'Vegetable trimmings are compostable organic waste.', 'coco_class' => 'broccoli'],
            ['name' => 'Carrot & peelings',   'icon' => '🥕', 'bin' => 'organic', 'tip' => 'Root vegetable scraps belong in the organic bin.', 'coco_class' => 'carrot'],
            ['name' => 'Sandwich / burger',   'icon' => '🥪', 'bin' => 'organic', 'tip' => 'Leftover sandwiches and food waste go to organic.', 'coco_class' => 'sandwich'],
            ['name' => 'Donut / pastries',    'icon' => '🍩', 'bin' => 'organic', 'tip' => 'Leftover sweet food belongs in the organic bin.', 'coco_class' => 'donut'],
            ['name' => 'Cake & desserts',     'icon' => '🍰', 'bin' => 'organic', 'tip' => 'Food leftovers decompose naturally in the organic bin.', 'coco_class' => 'cake'],
            ['name' => 'Hot dog / meat scraps','icon' => '🌭', 'bin' => 'organic', 'tip' => 'Meat trimmings and cooked scraps belong with food waste.', 'coco_class' => 'hot dog'],
            ['name' => 'Dry leaves & twigs',  'icon' => '🍂', 'bin' => 'organic', 'tip' => 'Yard clippings, fallen leaves, and plant trimmings are organic waste.', 'coco_class' => 'potted plant'],

            // ── RECYCLABLE WASTE (Narerecycle) ──────────────────────────────────
            ['name' => 'Plastic bottle',      'icon' => '🧴', 'bin' => 'recyclable', 'tip' => 'Empty, rinse, and crush it — clean plastic bottles are highly recyclable.', 'coco_class' => 'bottle'],
            ['name' => 'Thermos / Tumbler',   'icon' => '🍶', 'bin' => 'recyclable', 'tip' => 'Clean metal or hard reusable plastic tumblers can be recycled at scrap centers.', 'coco_class' => null],
            ['name' => 'Soda / Beverage can', 'icon' => '🥤', 'bin' => 'recyclable', 'tip' => 'Aluminum cans are infinitely recyclable — rinse before throwing.', 'coco_class' => null],
            ['name' => 'Tuna / Tin food can', 'icon' => '🥫', 'bin' => 'recyclable', 'tip' => 'Rinse clean of food residue — tin and steel cans are recyclable.', 'coco_class' => null],
            ['name' => 'Glass bottle & jar',  'icon' => '🫙', 'bin' => 'recyclable', 'tip' => 'Clean, unbroken glass jars and bottles belong in the recyclable bin.', 'coco_class' => 'wine glass'],
            ['name' => 'Drinking cup (Clean)','icon' => '🥛', 'bin' => 'recyclable', 'tip' => 'Clean plastic or paper drinking cups without wax coating are recyclable.', 'coco_class' => 'cup'],
            ['name' => 'Clean bowl',          'icon' => '🥣', 'bin' => 'recyclable', 'tip' => 'Clean plastic or glass bowls are recyclable.', 'coco_class' => 'bowl'],
            ['name' => 'Milk / Juice carton', 'icon' => '🧃', 'bin' => 'recyclable', 'tip' => 'Rinse and flatten clean beverage cartons for paper recycling.', 'coco_class' => null],
            ['name' => 'Cardboard box',       'icon' => '📦', 'bin' => 'recyclable', 'tip' => 'Flatten corrugated cardboard boxes — keep them dry and clean.', 'coco_class' => null],
            ['name' => 'Newspaper & flyer',   'icon' => '📰', 'bin' => 'recyclable', 'tip' => 'Dry paper, clean newsprint, and flyers belong in recyclables.', 'coco_class' => null],
            ['name' => 'Book & notebook',     'icon' => '📖', 'bin' => 'recyclable', 'tip' => 'Paper books, scratch paper, and notebooks can usually be recycled.', 'coco_class' => 'book'],

            // ── RESIDUAL WASTE (Di-nabubulok / Basura) ─────────────────────────
            ['name' => 'Used Tissue / Napkin','icon' => '🧻', 'bin' => 'residual', 'tip' => 'Used tissues, paper towels, and napkins cannot be recycled due to short contaminated fibers — residual bin.', 'coco_class' => null],
            ['name' => 'Wet wipes',           'icon' => '🧼', 'bin' => 'residual', 'tip' => 'Wet wipes contain synthetic plastic fibers and do not dissolve — residual bin.', 'coco_class' => null],
            ['name' => 'Shampoo sachet',      'icon' => '🧴', 'bin' => 'residual', 'tip' => 'Multi-layer foil-plastic sachets cannot be separated for recycling — residual bin.', 'coco_class' => null],
            ['name' => 'Chip / Snack bag',    'icon' => '🥔', 'bin' => 'residual', 'tip' => 'Metallic foil snack wrappers are non-recyclable multi-laminates.', 'coco_class' => null],
            ['name' => 'Candy wrapper',       'icon' => '🍬', 'bin' => 'residual', 'tip' => 'Small plastic and foil wrappers belong in residual trash.', 'coco_class' => null],
            ['name' => 'Plastic sando bag',   'icon' => '🛍️', 'bin' => 'residual', 'tip' => 'Thin single-use grocery bags clog recycling machinery — residual bin.', 'coco_class' => null],
            ['name' => 'Styrofoam container', 'icon' => '🥡', 'bin' => 'residual', 'tip' => 'Polystyrene food takeout boxes are not accepted in curbside recycling.', 'coco_class' => null],
            ['name' => 'Face mask',           'icon' => '😷', 'bin' => 'residual', 'tip' => 'Used surgical and fabric masks are sanitary residual waste.', 'coco_class' => null],
            ['name' => 'Receipt paper',       'icon' => '🧾', 'bin' => 'residual', 'tip' => 'Thermal receipt paper contains BPA coating and ruins paper recycling.', 'coco_class' => null],
            ['name' => 'Toothbrush',          'icon' => '🪥', 'bin' => 'residual', 'tip' => 'Mixed-material composite plastic goes to residual waste.', 'coco_class' => 'toothbrush'],
            ['name' => 'Plastic straw & fork','icon' => '🍴', 'bin' => 'residual', 'tip' => 'Disposable plastic cutlery and straws are too small to recycle.', 'coco_class' => 'fork'],
            ['name' => 'Broken mug & ceramic','icon' => '🍵', 'bin' => 'residual', 'tip' => 'Ceramics have a higher melting point than glass — residual bin.', 'coco_class' => null],
            ['name' => 'Scissors',            'icon' => '✂️', 'bin' => 'residual', 'tip' => 'Mixed metal-and-plastic tools go to residual waste.', 'coco_class' => 'scissors'],
            ['name' => 'Old toy',             'icon' => '🧸', 'bin' => 'residual', 'tip' => 'Mixed-plastic composite toys belong in residual waste.', 'coco_class' => 'teddy bear'],
            ['name' => 'Decorative vase',     'icon' => '🏺', 'bin' => 'residual', 'tip' => 'Ceramics and non-container glass go to residual waste.', 'coco_class' => 'vase'],
            ['name' => 'Old backpack / bag',  'icon' => '🎒', 'bin' => 'residual', 'tip' => 'Worn-out fabric and synthetic bags go to residual waste.', 'coco_class' => 'backpack'],
            ['name' => 'Phone & electronics', 'icon' => '📱', 'bin' => 'residual', 'tip' => 'Small electronics need e-waste drop-off — never mix with regular trash.', 'coco_class' => 'cell phone'],
            ['name' => 'Laptop',              'icon' => '💻', 'bin' => 'residual', 'tip' => 'Electronics contain heavy metals — take to an official e-waste facility.', 'coco_class' => 'laptop'],
            ['name' => 'Keyboard',            'icon' => '⌨️', 'bin' => 'residual', 'tip' => 'Electronic accessories need specialized e-waste recycling.', 'coco_class' => 'keyboard'],
            ['name' => 'Computer mouse',      'icon' => '🖱️', 'bin' => 'residual', 'tip' => 'Small electronics belong with e-waste.', 'coco_class' => 'mouse'],
            ['name' => 'Remote control',      'icon' => '🎮', 'bin' => 'residual', 'tip' => 'Remove batteries first, then send remote to e-waste recycling.', 'coco_class' => 'remote'],
            ['name' => 'Battery (Hazardous)', 'icon' => '🔋', 'bin' => 'residual', 'tip' => 'Batteries contain acid/heavy metals — bring to special hazardous waste drop-off.', 'coco_class' => null],
        ];

        foreach ($items as $item) {
            if (! empty($item['coco_class'])) {
                WasteItem::updateOrCreate(
                    ['coco_class' => $item['coco_class']],
                    $item
                );
            } else {
                WasteItem::updateOrCreate(
                    ['name' => $item['name']],
                    $item
                );
            }
        }
    }
}
