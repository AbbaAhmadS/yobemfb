import colaSolar2000Image from "@/assets/cola-solar-2000.jpg";
import colaSolar1000Image from "@/assets/cola-solar-1000.jpg";

export type SolarProductId = "cola_1000" | "cola_2000";

export type SolarProductInfo = {
  id: SolarProductId;
  title: string;
  subtitle: string;
  price: number;
  imageSrc: string;
  warranty: {
    durationLabel: string;
    summary: string;
  };
  keyFeatures: string[];
  includedComponents: string[];
  whatItPowers: string[];
  highlight?: string;
};

export const solarProducts: SolarProductInfo[] = [
  {
    id: "cola_1000",
    title: "Cola Solar 1000 Pro",
    subtitle: "All-in-One Solar Power System (1 kWh)",
    price: 630000,
    imageSrc: colaSolar1000Image,
    warranty: {
      durationLabel: "5-year warranty",
      summary:
        "Lithium (LiFePO₄) battery warranty included. Warranty coverage is subject to vendor terms.",
    },
    keyFeatures: [
      "All-in-one solar system with integrated inverter, controller, and lithium battery (5-year warranty).",
      "1 kWh battery capacity for steady energy storage.",
      "300 W pure sine-wave output for safe, clean power (sensitive electronics friendly).",
      "Dual charging options: solar panels and grid (AC).",
      "Compact and portable (approx. 8.26 kg).",
    ],
    includedComponents: [
      "All-in-one solar unit (inverter + controller + lithium battery).",
      "2 solar panels for sustainable energy harvesting.",
      "15 mm heavy-duty cable for safe connections.",
    ],
    whatItPowers: [
      "Fridge (only AC/DC fridge supported)",
      "TV × 2",
      "Bulbs × 6",
      "Fan",
    ],
    highlight: "Ideal for everyday home essentials.",
  },
  {
    id: "cola_2000",
    title: "Cola Solar 2000",
    subtitle: "All-in-One Solar Power System (2 kWh)",
    price: 1232000,
    imageSrc: colaSolar2000Image,
    warranty: {
      durationLabel: "5-year warranty",
      summary:
        "LiFePO₄ solar battery warranty included. Warranty coverage is subject to vendor terms.",
    },
    keyFeatures: [
      "All-in-one solar system: integrated inverter, controller, and LiFePO₄ solar battery (5-year warranty).",
      "2000 Wh (2 kWh) battery capacity for lights, appliances, and more.",
      "Pure sine-wave output: reliable 1000 W AC output for safe appliance operation.",
      "Dual charging options: solar panels and grid.",
      "Automatic grid power switching for seamless outages transition.",
    ],
    includedComponents: [
      "High-capacity 2000 Wh solar generator with built-in inverter.",
      "4 solar panels for efficient energy harvesting.",
      "Heavy-duty 15 mm cable for reliable and safe connections.",
    ],
    whatItPowers: [
      "Fridge",
      "All house light bulbs",
      "TVs (up to 3 units)",
      "Pressing iron",
      "Electric heater / electric kettle heater",
    ],
    highlight: "Designed for full household power needs during outages.",
  },
];
