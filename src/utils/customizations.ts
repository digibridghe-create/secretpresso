import { Product, CustomizationGroup } from '../types';

/**
 * Returns comprehensive, realistic, and category-tailored customization groups
 * for any product across the SECRETpresso catalogue (Coffee, Iced Coffee,
 * Desserts/Tiramisu, Sweets, Brownies, Donuts, Burgers, Sandwiches, Garlic Bread,
 * French Fries, and future products added from the admin panel).
 *
 * If the product already has admin-defined customization groups, those are preserved.
 */
export function getProductCustomizationGroups(product: Product | null | undefined): CustomizationGroup[] {
  if (!product) return [];

  // If the product has custom groups explicitly configured by the admin, use them
  if (product.customizationGroups && product.customizationGroups.length > 0) {
    return product.customizationGroups;
  }

  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const sec = (product.sectionId || '').toLowerCase();
  const cat = (product.categoryId || '').toLowerCase();
  const type = (product.productType || '').toLowerCase();

  // 1. Iced Coffee / Cold Brew / Frappe / Chilled Drinks
  if (
    name.includes('iced') ||
    name.includes('cold') ||
    name.includes('frappe') ||
    cat === 'cat-iced' ||
    desc.includes('steeped') ||
    desc.includes('chilled')
  ) {
    return [
      {
        id: 'size',
        name: 'Cup Size',
        type: 'single',
        required: true,
        options: [
          { id: 'size-reg', name: 'Regular', detail: '350 ml', priceAdjustment: 0, isDefault: true },
          { id: 'size-lrg', name: 'Large', detail: '450 ml', priceAdjustment: 40 },
          { id: 'size-grd', name: 'Grande', detail: '550 ml', priceAdjustment: 70 },
        ],
      },
      {
        id: 'ice',
        name: 'Ice Level',
        type: 'single',
        required: true,
        options: [
          { id: 'ice-norm', name: 'Regular Ice', priceAdjustment: 0, isDefault: true },
          { id: 'ice-less', name: 'Less Ice', priceAdjustment: 0 },
          { id: 'ice-extra', name: 'Extra Ice', priceAdjustment: 0 },
          { id: 'ice-none', name: 'No Ice', priceAdjustment: 0 },
        ],
      },
      {
        id: 'sweetness',
        name: 'Sweetness',
        type: 'single',
        required: true,
        options: [
          { id: 'sw-std', name: 'Standard Sweetness', priceAdjustment: 0, isDefault: true },
          { id: 'sw-less', name: 'Less Sweet (50%)', priceAdjustment: 0 },
          { id: 'sw-none', name: 'Unsweetened', priceAdjustment: 0 },
          { id: 'sw-extra', name: 'Extra Sweet', priceAdjustment: 0 },
        ],
      },
      {
        id: 'milk',
        name: 'Milk Choice',
        type: 'single',
        required: true,
        options: [
          { id: 'milk-whole', name: 'Whole Milk', priceAdjustment: 0, isDefault: true },
          { id: 'milk-oat', name: 'Oat Milk', detail: 'Creamy Vegan', priceAdjustment: 35 },
          { id: 'milk-almond', name: 'Almond Milk', detail: 'Nutty & Light', priceAdjustment: 35 },
          { id: 'milk-none', name: 'Black (No Milk)', priceAdjustment: 0 },
        ],
      },
      {
        id: 'addons',
        name: 'Cold Enhancements',
        type: 'multiple',
        required: false,
        options: [
          { id: 'add-shot', name: 'Extra Espresso Shot', priceAdjustment: 40 },
          { id: 'add-foam', name: 'Vanilla Sweet Cold Foam', priceAdjustment: 35 },
          { id: 'add-caramel', name: 'Caramel Ribbon Drizzle', priceAdjustment: 25 },
          { id: 'add-hazelnut', name: 'Roasted Hazelnut Syrup', priceAdjustment: 25 },
        ],
      },
    ];
  }

  // 2. Hot Coffee / Espresso / Latte / Americano / Cappuccino / Mocha
  if (
    type === 'coffee' ||
    sec === 'sec-coffee-flavours' ||
    cat === 'cat-espresso' ||
    name.includes('coffee') ||
    name.includes('latte') ||
    name.includes('americano') ||
    name.includes('cappuccino') ||
    name.includes('mocha') ||
    name.includes('espresso')
  ) {
    return [
      {
        id: 'size',
        name: 'Cup Size',
        type: 'single',
        required: true,
        options: [
          { id: 'size-reg', name: 'Regular', detail: '250 ml', priceAdjustment: 0, isDefault: true },
          { id: 'size-lrg', name: 'Large', detail: '350 ml', priceAdjustment: 40 },
          { id: 'size-grd', name: 'Grande', detail: '450 ml', priceAdjustment: 70 },
        ],
      },
      {
        id: 'milk',
        name: 'Milk Selection',
        type: 'single',
        required: true,
        options: [
          { id: 'milk-whole', name: 'Whole Milk', priceAdjustment: 0, isDefault: true },
          { id: 'milk-oat', name: 'Oat Milk', detail: 'Velvety Vegan', priceAdjustment: 35 },
          { id: 'milk-almond', name: 'Almond Milk', detail: 'Nutty Aroma', priceAdjustment: 35 },
          { id: 'milk-skim', name: 'Skim / Low Fat Milk', priceAdjustment: 0 },
          { id: 'milk-none', name: 'Black (No Milk)', priceAdjustment: 0 },
        ],
      },
      {
        id: 'sweetness',
        name: 'Sweetness',
        type: 'single',
        required: true,
        options: [
          { id: 'sw-std', name: 'Standard Sweetness', priceAdjustment: 0, isDefault: true },
          { id: 'sw-less', name: 'Less Sweet (50%)', priceAdjustment: 0 },
          { id: 'sw-none', name: 'Sugar Free', priceAdjustment: 0 },
          { id: 'sw-extra', name: 'Extra Sweet', priceAdjustment: 0 },
        ],
      },
      {
        id: 'temp',
        name: 'Temperature',
        type: 'single',
        required: false,
        options: [
          { id: 'temp-steaming', name: 'Steaming Hot', priceAdjustment: 0, isDefault: true },
          { id: 'temp-extra', name: 'Extra Hot', priceAdjustment: 0 },
          { id: 'temp-warm', name: 'Warm / Mild', priceAdjustment: 0 },
        ],
      },
      {
        id: 'addons',
        name: 'Coffee Add-Ons',
        type: 'multiple',
        required: false,
        options: [
          { id: 'add-shot', name: 'Extra Ristretto Shot', priceAdjustment: 40 },
          { id: 'add-vanilla', name: 'Madagascar Vanilla Syrup', priceAdjustment: 25 },
          { id: 'add-caramel', name: 'Salted Caramel Drizzle', priceAdjustment: 25 },
          { id: 'add-whip', name: 'Whipped Cream Topping', priceAdjustment: 30 },
          { id: 'add-chocolate', name: 'Belgian Chocolate Swirl', priceAdjustment: 30 },
        ],
      },
    ];
  }

  // 3. Tiramisu, Sweets, Chocolate Mousse, Brownies, Cakes
  if (
    name.includes('tiramisu') ||
    name.includes('mousse') ||
    name.includes('brownie') ||
    name.includes('sweet') ||
    name.includes('cake') ||
    name.includes('chocolate') ||
    sec === 'sec-velvet-sweets' ||
    sec === 'sec-chocolate-atelier'
  ) {
    return [
      {
        id: 'portion',
        name: 'Portion Size',
        type: 'single',
        required: true,
        options: [
          { id: 'port-single', name: 'Single Slice / Piece', priceAdjustment: 0, isDefault: true },
          { id: 'port-share', name: 'Shareable Duo', detail: '2 Servings', priceAdjustment: 90 },
        ],
      },
      {
        id: 'serving',
        name: 'Serving Preference',
        type: 'single',
        required: true,
        options: [
          { id: 'srv-chilled', name: 'Chilled & Fresh', priceAdjustment: 0, isDefault: true },
          { id: 'srv-warm', name: 'Lightly Warmed', priceAdjustment: 0 },
        ],
      },
      {
        id: 'sweet-toppings',
        name: 'Dessert Toppings',
        type: 'multiple',
        required: false,
        options: [
          { id: 'top-icecream', name: 'Vanilla Bean Gelato Scoop', priceAdjustment: 50 },
          { id: 'top-ganache', name: 'Warm Dark Chocolate Ganache', priceAdjustment: 35 },
          { id: 'top-nuts', name: 'Roasted Almond & Hazelnut Flakes', priceAdjustment: 25 },
          { id: 'top-cocoa', name: 'Extra Cocoa & Mascarpone Cream', priceAdjustment: 30 },
        ],
      },
    ];
  }

  // 4. Donuts & Glazed Moments
  if (name.includes('donut') || name.includes('doughnut') || sec === 'sec-glazed-moments') {
    return [
      {
        id: 'donut-serving',
        name: 'Serving Temperature',
        type: 'single',
        required: true,
        options: [
          { id: 'srv-fresh', name: 'Room Temperature', priceAdjustment: 0, isDefault: true },
          { id: 'srv-warm', name: 'Gently Warmed (Melt-in-mouth)', priceAdjustment: 0 },
        ],
      },
      {
        id: 'glaze',
        name: 'Glaze & Drizzle',
        type: 'single',
        required: true,
        options: [
          { id: 'glz-sig', name: 'Signature Glaze', priceAdjustment: 0, isDefault: true },
          { id: 'glz-mocha', name: 'Espresso Mocha Drizzle', priceAdjustment: 20 },
          { id: 'glz-caramel', name: 'Salted Butterscotch Drizzle', priceAdjustment: 25 },
        ],
      },
      {
        id: 'donut-addons',
        name: 'Accompaniments',
        type: 'multiple',
        required: false,
        options: [
          { id: 'top-pistachio', name: 'Crushed Roasted Pistachios', priceAdjustment: 25 },
          { id: 'top-gelato', name: 'Vanilla Gelato Dip Cup', priceAdjustment: 45 },
          { id: 'top-chocdip', name: 'Warm Chocolate Fondue Dip', priceAdjustment: 35 },
        ],
      },
    ];
  }

  // 5. Burgers & Gourmet Sliders
  if (name.includes('burger') || name.includes('slider')) {
    return [
      {
        id: 'patty',
        name: 'Patty & Protein',
        type: 'single',
        required: true,
        options: [
          { id: 'pty-classic', name: 'Chef Classic Recipe', priceAdjustment: 0, isDefault: true },
          { id: 'pty-spicy', name: 'Spicy Crispy Crunch', priceAdjustment: 25 },
          { id: 'pty-double', name: 'Double Patty', priceAdjustment: 80 },
        ],
      },
      {
        id: 'cheese',
        name: 'Cheese Selection',
        type: 'single',
        required: true,
        options: [
          { id: 'chs-cheddar', name: 'Melted Aged Cheddar', priceAdjustment: 0, isDefault: true },
          { id: 'chs-double', name: 'Double Cheese Slice', priceAdjustment: 30 },
          { id: 'chs-none', name: 'No Cheese', priceAdjustment: 0 },
        ],
      },
      {
        id: 'burger-addons',
        name: 'Gourmet Add-ons',
        type: 'multiple',
        required: false,
        options: [
          { id: 'add-jalapeno', name: 'Spicy Jalapeños & Crisp Onions', priceAdjustment: 25 },
          { id: 'add-truffle', name: 'Truffle Garlic Mayo', priceAdjustment: 30 },
          { id: 'add-mushrooms', name: 'Sautéed Garlic Herb Mushrooms', priceAdjustment: 35 },
          { id: 'add-pickles', name: 'Extra Gherkin Pickles', priceAdjustment: 15 },
        ],
      },
    ];
  }

  // 6. Sandwiches, Garlic Bread & Toasted Breads
  if (
    name.includes('sandwich') ||
    name.includes('garlic bread') ||
    name.includes('bread') ||
    name.includes('toast') ||
    sec === 'sec-from-the-kitchen'
  ) {
    return [
      {
        id: 'toasting',
        name: 'Toasting Level',
        type: 'single',
        required: true,
        options: [
          { id: 'tst-golden', name: 'Golden Crisp Toasted', priceAdjustment: 0, isDefault: true },
          { id: 'tst-extra', name: 'Extra Crunchy & Dark', priceAdjustment: 0 },
          { id: 'tst-soft', name: 'Lightly Warmed & Soft', priceAdjustment: 0 },
        ],
      },
      {
        id: 'spread',
        name: 'Cheese & Spread',
        type: 'single',
        required: true,
        options: [
          { id: 'sprd-herb', name: 'Classic Garlic Herb Butter', priceAdjustment: 0, isDefault: true },
          { id: 'sprd-mozz', name: 'Loaded Mozzarella Melt', priceAdjustment: 40 },
          { id: 'sprd-peri', name: 'Spicy Peri-Peri Butter', priceAdjustment: 20 },
        ],
      },
      {
        id: 'sandwich-dips',
        name: 'Side Dips & Enhancements',
        type: 'multiple',
        required: false,
        options: [
          { id: 'dip-aioli', name: 'House Roasted Garlic Aioli', priceAdjustment: 25 },
          { id: 'dip-jalapeno', name: 'Creamy Jalapeño Cheese Dip', priceAdjustment: 35 },
          { id: 'dip-marinara', name: 'Herb Marinara Dip', priceAdjustment: 25 },
        ],
      },
    ];
  }

  // 7. French Fries & Crisp Sides
  if (
    name.includes('fries') ||
    name.includes('french fry') ||
    name.includes('potato') ||
    sec === 'sec-crisp-and-golden'
  ) {
    return [
      {
        id: 'fries-portion',
        name: 'Portion Size',
        type: 'single',
        required: true,
        options: [
          { id: 'fr-reg', name: 'Regular Basket', priceAdjustment: 0, isDefault: true },
          { id: 'fr-large', name: 'Large / Jumbo Basket', priceAdjustment: 40 },
        ],
      },
      {
        id: 'seasoning',
        name: 'Seasoning Style',
        type: 'single',
        required: true,
        options: [
          { id: 'sea-peri', name: 'Peri-Peri Spice Blend', priceAdjustment: 0, isDefault: true },
          { id: 'sea-salt', name: 'Classic Himalayan Salt', priceAdjustment: 0 },
          { id: 'sea-paprika', name: 'Smoked Paprika & Herbs', priceAdjustment: 15 },
          { id: 'sea-truffle', name: 'Truffle & Parmesan Dust', priceAdjustment: 35 },
        ],
      },
      {
        id: 'fries-dips',
        name: 'Choice of Dips',
        type: 'multiple',
        required: false,
        options: [
          { id: 'fdip-cheese', name: 'Warm Melted Cheese Sauce', priceAdjustment: 35 },
          { id: 'fdip-bbq', name: 'Smoky BBQ Dip', priceAdjustment: 25 },
          { id: 'fdip-aioli', name: 'Garlic Aioli Dip', priceAdjustment: 25 },
          { id: 'fdip-mayo', name: 'Sweet Chilli Mayo', priceAdjustment: 25 },
        ],
      },
    ];
  }

  // 8. General / Fallback for any future product created in Admin Panel
  return [
    {
      id: 'portion',
      name: 'Portion / Serving',
      type: 'single',
      required: true,
      options: [
        { id: 'std-size', name: 'Standard Serving', priceAdjustment: 0, isDefault: true },
        { id: 'lrg-size', name: 'Large Portion', priceAdjustment: 40 },
      ],
    },
    {
      id: 'prep',
      name: 'Preparation Style',
      type: 'single',
      required: false,
      options: [
        { id: 'prep-chef', name: "Chef's Classic Recipe", priceAdjustment: 0, isDefault: true },
        { id: 'prep-extra', name: 'Extra Well Done / Crisp', priceAdjustment: 0 },
      ],
    },
    {
      id: 'extras',
      name: 'Add-Ons & Dips',
      type: 'multiple',
      required: false,
      options: [
        { id: 'ext-dip', name: 'Signature House Dip', priceAdjustment: 25 },
        { id: 'ext-garnish', name: 'Secret Spices & Garnish', priceAdjustment: 20 },
      ],
    },
  ];
}
