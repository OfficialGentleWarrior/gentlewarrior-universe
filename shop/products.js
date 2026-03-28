const products = [

{
  name: "Young Pork Tocino",
  image: "images/tocino.jpg",
  description: "Sweet and salty",
  category: "Frozen Meat",
  variants: [
    { label: "150g", price: 64 },
    { label: "225g", price: 76 },
    { label: "450g", price: 149 },
    { label: "1kg", price: 324 },
    { label: "5kg", price: 1600 }
  ]
},

{
  name: "Young Pork Tocino FATLESS",
  image: "images/fatless.jpg",
  description: "Sweet and salty without the fat!",
  category: "Frozen Meat",
  variants: [
    { label: "225g", price: 85 }
  ]
},

{
  name: "Young Pork Tocino CHILI",
  image: "images/chili.jpg",
  description: "Sweet, salty and a dash of chili",
  category: "Frozen Meat",
  variants: [
    { label: "225g", price: 85 }
  ]
},

{
  name: "Young Pork Barbecue",
  image: "images/bbq.jpg",
  description: "Sweet and savory barbecue flavor",
  category: "Frozen Meat",
  variants: [
    { label: "225g", price: 85 },
    { label: "450g", price: 167 },
    { label: "1kg", price: 361 }
  ]
},

{
  name: "Pork Longganisa",
  image: "images/longganisa.jpg",
  description: "Deliciously tender, seasoned with special spices",
  category: "Frozen Meat",
  variants: [
    { label: "250g", price: 81 },
  ]
},

{
  name: "CDO Idol Cheesedog (JUMBO)",
  image: "images/jumbo.jpg",
  description: "Creamy cheese bits in every bite",
  category: "Frozen Meat",
  variants: [
    { label: "500g", price: 106 },
    { label: "1kg", price: 175 }
  ]
},

{
  name: "CDO Idol Cheesedog (Go Balls)",
  image: "images/balls.jpg",
  description: "Cheese-filled goodness in bite-sized pieces",
  category: "Frozen Meat",
  variants: [
    { label: "1kg", price: 178 }
  ]
},

{
  name: "CDO Idol Hotdog (Regular)",
  image: "images/hotdog.jpg",
  description: "Savory and meaty flavors",
  category: "Frozen Meat",
  variants: [
    { label: "250g", price: 59 },
    { label: "1kg", price: 187 }
  ]
},

{
  name: "CDO Ulam Burger (Classic)",
  image: "images/classic.jpg",
  description: "Mini breakfast burgers with more pieces per pack",
  category: "Frozen Meat",
  variants: [
    { label: "225g", price: 63 }
  ]
},

{
  name: "CDO Ulam Burger (Cheesy)",
  image: "images/cheesy.jpg",
  description: "With real cheese bits in every bite",
  category: "Frozen Meat",
  variants: [
    { label: "228g", price: 59 }
  ]
},

{
  name: "Holiday Cheesedog Footlong (regular 14 pcs)",
  image: "images/footlong.jpg",
  description: "Mahaba, makeso at masarap",
  category: "Frozen Meat",
  variants: [
    { label: "1kg", price: 168 }
  ]
},

{
  name: "Holiday Cheesedog Regular",
  image: "images/cheesedog.jpg",
  description: "Cheesy and juicy goodness",
  category: "Frozen Meat",
  variants: [
    { label: "250g", price: 55 },
    { label: "1kg", price: 174 }
  ]
},

{
  name: "Holiday Bacon",
  image: "images/bacon.jpg",
  description: "Smoky and crispy-sarap",
  category: "Frozen Meat",
  variants: [
    { label: "200g", price: 100 }
  ]
},

{
  name: "Holiday Siomai",
  image: "images/siomai.jpg",
  description: "Enjoyable and affordable",
  category: "Frozen Meat",
  variants: [
    { label: "240g", price: 52 }
  ]
},

{
  name: "Holiday Chicken Siomai",
  image: "images/chic-siomai.jpg",
  description: "Delicious chicken meat in yellow wrapper",
  category: "Frozen Meat",
  variants: [
    { label: "240g", price: 52 }
  ]
},

{
  name: "Holiday Squidballs",
  image: "images/squidballs.jpg",
  description: "Juicy and flavorful Pinoy snack",
  category: "Frozen Meat",
  variants: [
    { label: "220g", price: 45 }
  ]
},

{
  name: "Holiday Quekiam",
  image: "images/quekiam.jpg",
  description: "Juicy and flavorful snack",
  category: "Frozen Meat",
  variants: [
    { label: "220g", price: 45 }
  ]
},

{
  name: "CDO Crispy Burger",
  image: "images/crispy-burger.jpg",
  description: "Beefy patty with crispy coating",
  category: "Frozen Meat",
  variants: [
    { label: "228g", price: 64 }
  ]
},

{
  name: "CDO Crispy Chicken Burger",
  image: "images/crispy-chicken-burger.jpg",
  description: "Crispy coated chicken burger patty",
  category: "Frozen Meat",
  variants: [
    { label: "228g", price: 65 }
  ]
},

{
  name: "CDO Chicken Nuggets with Cheese Powder",
  image: "images/chicken-nuggets.jpg",
  description: "Bite-sized chicken with cheese flavor",
  category: "Frozen Meat",
  variants: [
    { label: "200g", price: 96 }
  ]
},

{
  name: "Holiday Siopao Asado Regular",
  image: "images/asado.jpg",
  description: "Soft buns with savory pork asado filling",
  category: "Bakery",
  variants: [
    { label: "520g", price: 93 }
  ]
},

{
  name: "Holiday Siopao Asado Mini",
  image: "images/asado-mini.jpg",
  description: "Mini asado buns",
  category: "Bakery",
  variants: [
    { label: "1kg", price: 187 }
  ]
},

{
  name: "Holiday Siopao Bola-Bola Mini",
  image: "images/bola-bola.jpg",
  description: "Garlicky bola-bola filling",
  category: "Bakery",
  variants: [
    { label: "1.32kg", price: 195 }
  ]
},

{
  name: "Holiday Siopao Ube Cheese Mini",
  image: "images/ube.jpg",
  description: "Sweet ube with creamy cheese",
  category: "Bakery",
  variants: [
    { label: "660g", price: 106 },
    { label: "1.32kg", price: 236 }
  ]
},

{
  name: "Holiday Siopao Chocolate Mini",
  image: "images/choco.jpg",
  description: "Chocolate-filled soft buns",
  category: "Bakery",
  variants: [
    { label: "600g", price: 135 }
  ]
}

];
