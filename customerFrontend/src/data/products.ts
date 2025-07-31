
// src/data/products.ts or wherever your file is
import bakery from "@/data/CategoryImages/bakery.jpg";
import dairy from "@/data/CategoryImages/dairy.jpg";
import drinks from "@/data/CategoryImages/drinks.jpg";
import fruits from "@/data/CategoryImages/fruits.jpg";
import redMeat from "@/data/CategoryImages/redMeat.jpg";
import vegetables from "@/data/CategoryImages/vegetable.jpg";
import witeMeat from "@/data/CategoryImages/witeMeat.jpg"




import aubergine from './ProductData/Aubergine.jpeg';
import avocado from './ProductData/avocado.jpeg';
import beacon from './ProductData/beacon.jpeg';
import beefSteak from './ProductData/beef-steak.jpeg';
import bread from './ProductData/bread.jpeg';
import broccoli from './ProductData/Broccoli.jpeg';
import buter from './ProductData/buter.jpg';
import butter from './ProductData/butter.jpg';
import cabbage from './ProductData/Cabbage_and_cross_section_on_white.jpg';
import cake from './ProductData/cake.jpeg';
import cheese from './ProductData/cheese.jpg';
import chikenReg from './ProductData/chiken-reg.jpg';
import cocala from './ProductData/cocala.jpeg';
import coconat from './ProductData/coconat.jpg';
import crab from './ProductData/crab.jpeg';
import donuts from './ProductData/donuts.jpeg';
import eatVegetables from './ProductData/Eat-Vegetables.jpg';
import fish from './ProductData/fish.jpeg';
import groundBeef from './ProductData/ground-beef.jpg';
import lambChopes from './ProductData/Lamb-Chopes.jpeg';
import lemon from './ProductData/lemon.jpg';
import lettuce from './ProductData/lettuce.png';
import muffins from './ProductData/maffins.jpeg';
import mango from './ProductData/mango.jpg';
import milinder from './ProductData/milinder.jpeg';
import onions from './ProductData/onions.jpeg';
import orange from './ProductData/orange.jpg';
import patato from './ProductData/patato.jpg';
import pinaple from './ProductData/pinaple.jpeg';
import pumpkin from './ProductData/Pumpkin.jpeg';
import redRadish from './ProductData/red radish.webp';
import ripePapaya from './ProductData/RipePapaya.jpg';
import sinamonRolls from './ProductData/sinamonRolles.jpeg';
import sunkit from './ProductData/sunkit.jpeg';
import tomato from './ProductData/tomato.jpg';
import tungurusum from './ProductData/tungurusum.jpg';
import watermelon from './ProductData/water-melon.jpg';
import whole from './ProductData/whole.jpg';
import wholeChiken from './ProductData/whole-chiken.jpg';
import yourgut from './ProductData/yourgut.jpeg';


export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  featured?: boolean;
  discount?: number;
  unit: string;
};

export type Category = {
  id: number;
  name: string;
  image: string;
};

export const categories: Category[] = [
  {
    id: 1,
    name: "Fruits",
    image: fruits
  },
  {
    id: 2,
    name: "Dairy",
    image: dairy
  },
  {
    id: 3,
    name: "Bakery",
    image: bakery
  },
  {
    id: 4,
    name: "Red Meats",
    image: redMeat
  },
  {
    id: 5,
    name: "Drinks & Beverages",
    image: drinks
  },
  {
    id: 6,
    name: "Vegetables",
    image: vegetables
  },
  {
    id: 7,
    name: "White Meats",
    image: witeMeat
  }
];



//products Data

export const products: Product[] = [
  {
    id: 1,
    name: "Aubergine",
    price: 2.49,
    image: aubergine,
    category: "Vegetables",
    unit: "each",
    featured: true,
    discount: 10
  },
  {
    id: 2,
    name: "Avocado",
    price: 1.99,
    image: avocado,
    category: "Fruits",
    unit: "each",
    featured: true
  },
  {
    id: 3,
    name: "Beacon",
    price: 4.99,
    image: beacon,
    category: "Meat & Seafood",
    unit: "pack"
  },
  {
    id: 4,
    name: "Beef Steak",
    price: 9.99,
    image: beefSteak,
    category: "Red Meats",
    unit: "lb",
    featured: true,
    discount: 15
  },
  {
    id: 5,
    name: "Bread",
    price: 2.49,
    image: bread,
    category: "Bakery",
    unit: "loaf"
  },
  {
    id: 6,
    name: "Broccoli",
    price: 1.79,
    image: broccoli,
    category: "Vegetables",
    unit: "bunch"
  },
  {
    id: 7,
    name: "Buter",
    price: 3.29,
    image: buter,
    category: "Dairy",
    unit: "pack"
  },
  {
    id: 8,
    name: "Butter",
    price: 3.49,
    image: butter,
    category: "Dairy",
    unit: "stick",
    featured: true
  },
  {
    id: 9,
    name: "Cabbage",
    price: 1.99,
    image: cabbage,
    category: "Vegetables",
    unit: "head"
  },
  {
    id: 10,
    name: "Cake",
    price: 6.99,
    image: cake,
    category: "Bakery",
    unit: "piece",
    featured: true,
    discount: 20
  },
  {
    id: 11,
    name: "Cheese",
    price: 5.49,
    image: cheese,
    category: "Dairy",
    unit: "block"
  },
  {
    id: 12,
    name: "Chicken Regular",
    price: 6.99,
    image: chikenReg,
    category: "White Meats",
    unit: "lb",
    featured: true
  },
  {
    id: 13,
    name: "Cocala",
    price: 1.29,
    image: cocala,
    category: "Drinks & Beverages",
    unit: "bottle"
  },
  {
    id: 14,
    name: "Coconut",
    price: 2.79,
    image: coconat,
    category: "Fruits",
    unit: "each"
  },
  {
    id: 15,
    name: "Crab",
    price: 13.99,
    image: crab,
    category: "Meat & Seafood",
    unit: "lb",
    featured: true,
    discount: 10
  },
  {
    id: 16,
    name: "Donuts",
    price: 1.99,
    image: donuts,
    category: "Snacks & Treats",
    unit: "piece"
  },
  {
    id: 17,
    name: "Eat Vegetables Pack",
    price: 6.49,
    image: eatVegetables,
    category: "Vegetables",
    unit: "pack",
    featured: true
  },
  {
    id: 18,
    name: "Fish",
    price: 8.99,
    image: fish,
    category: "Meat & Seafood",
    unit: "lb"
  },
  {
    id: 19,
    name: "Ground Beef",
    price: 7.49,
    image: groundBeef,
    category: "Red Meats",
    unit: "lb"
  },
  {
    id: 20,
    name: "Lamb Chops",
    price: 12.49,
    image: lambChopes,
    category: "Red Meats",
    unit: "lb"
  },
  {
    id: 21,
    name: "Lemon",
    price: 0.99,
    image: lemon,
    category: "Fruits",
    unit: "each"
  },
  {
    id: 22,
    name: "Lettuce",
    price: 1.49,
    image: lettuce,
    category: "Vegetables",
    unit: "head"
  },
  {
    id: 23,
    name: "Muffins",
    price: 2.99,
    image: muffins,
    category: "Bakery",
    unit: "pack",
    featured: true
  },
  {
    id: 24,
    name: "Mango",
    price: 1.89,
    image: mango,
    category: "Fruits",
    unit: "each",
    featured: true,
    discount: 5
  },
  {
    id: 25,
    name: "Milinder Soda",
    price: 1.29,
    image: milinder,
    category: "Drinks & Beverages",
    unit: "bottle"
  },
  {
    id: 26,
    name: "Onions",
    price: 0.79,
    image: onions,
    category: "Vegetables",
    unit: "lb"
  },
  {
    id: 27,
    name: "Orange",
    price: 1.09,
    image: orange,
    category: "Fruits",
    unit: "each"
  },
  {
    id: 28,
    name: "Potato",
    price: 0.99,
    image: patato,
    category: "Vegetables",
    unit: "lb"
  },
  {
    id: 29,
    name: "Pineapple",
    price: 3.49,
    image: pinaple,
    category: "Fruits",
    unit: "each"
  },
  {
    id: 30,
    name: "Pumpkin",
    price: 4.99,
    image: pumpkin,
    category: "Vegetables",
    unit: "each"
  },
  {
    id: 31,
    name: "Red Radish",
    price: 2.99,
    image: redRadish,
    category: "Vegetables",
    unit: "bunch"
  },
  {
    id: 32,
    name: "Ripe Papaya",
    price: 2.89,
    image: ripePapaya,
    category: "Fruits",
    unit: "each"
  },
  {
    id: 33,
    name: "Sinamon Rolls",
    price: 5.49,
    image: sinamonRolls,
    category: "Bakery",
    unit: "pack"
  },
  {
    id: 34,
    name: "Sunkti",
    price: 1.49,
    image: sunkit,
    category: "Drinks & Beverages",
    unit: "bottle"
  },
  {
    id: 35,
    name: "Tomato",
    price: 1.29,
    image: tomato,
    category: "Vegetables",
    unit: "lb"
  },
  {
    id: 36,
    name: "Tungurusum",
    price: 3.99,
    image: tungurusum,
    category: "Snacks & Treats",
    unit: "bag"
  },
  {
    id: 37,
    name: "Watermelon",
    price: 6.49,
    image: watermelon,
    category: "Fruits",
    unit: "each"
  },
  {
    id: 38,
    name: "Whole Milk",
    price: 4.29,
    image: whole,
    category: "Dairy",
    unit: "gallon"
  },
  {
    id: 39,
    name: "Whole Chicken",
    price: 9.99,
    image: wholeChiken,
    category: "White Meats",
    unit: "each"
  },
  {
    id: 40,
    name: "Yogurt",
    price: 2.29,
    image: yourgut,
    category: "Dairy",
    unit: "cup"
  }
];