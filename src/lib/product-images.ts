
const productImages: Array<[string, string]> = [
  // Rice
  ["সুবর্ণচিরি", "chal.png"],
  ["মিনিকেট", "chal.png"],
  ["নাজিরশাইল", "chal.png"],
  ["বাসমতি", "chal.png"],
  ["চাল", "chal.png"],

  // Lentils
  ["মসুর", "dal.png"],
  ["মুগ", "dal.png"],
  ["ছোলা", "dal.png"],
  ["ডাল", "dal.png"],

  // Cooking oil
  ["সয়াবিন", "oil.png"],
  ["সোয়াবিন", "oil.png"],
  ["সয়াবিন", "oil.png"],
  ["সরিষার তেল", "tel.png"],
  ["পাম তেল", "palm oil.png"],
  ["তেল", "tel.png"],

  // Vegetables
  ["পেঁয়াজ", "Peyaj.png"],
  ["পেঁয়াজ", "Peyaj.png"],
  ["পেয়াজ", "Peyaj.png"],
  ["রসুন", "rosun.png"],
  ["আদা", "Ada.png"],
  ["আলু", "alu.png"],
  ["বেগুন", "Begun.png"],
  ["কাঁচামরিচ", "morich.png"],
  ["কাঁচা মরিচ", "morich.png"],
  ["মরিচ", "morich.png"],
  ["টমেটো", "vegetable.png"],
  ["ধনেপাতা", "dhonepata gura.png"],
  ["ঢেঁড়স", "dheros.png"],
  ["ঢেঁড়স", "dheros.png"],

  // Fish
  ["রুই মাছ", "Rui Mach.png"],
  ["রুই", "Rui Mach.png"],
  ["তেলাপিয়া", "fish.png"],
  ["তেলাপিয়া", "fish.png"],
  ["ইলিশ", "mach.png"],
  ["পাঙ্গাস", "fish.png"],
  ["চিংড়ি", "chingri.png"],
  ["চিংড়ি", "chingri.png"],
  ["কাতলা", "mach.png"],
  ["মাছ", "fish.png"],

  // Meat
  ["মুরগির মাংস", "murgir mangso.png"],
  ["মুরগি", "murgir mangso.png"],
  ["গরুর মাংস", "gorur mangso.png"],
  ["খাসির মাংস", "mangso.png"],
  ["হাঁসের মাংস", "hash.png"],
  ["মাংস", "meat.png"],

  // Dairy and eggs
  ["ডিম", "dim.png"],
  ["দুধ", "dudh.png"],
  ["দই", "doi.png"],
  ["মাখন", "makhon.png"],

  // Other groceries
  ["লবণ", "lobon.png"],
  ["চিনি", "chini.png"],
  ["আটা", "atta.png"],
  ["ময়দা", "atta.png"],
  ["ময়দা", "atta.png"],
  ["মসলা", "spice.png"],
];

export function getProductImage(
  name: string
): string | null {
  const normalizedName = name
    .trim()
    .normalize("NFC")
    .replace(/য়/g, "য়");

  const match = productImages.find(([keyword]) =>
    normalizedName.includes(
      keyword.normalize("NFC").replace(/য়/g, "য়")
    )
  );

  if (!match) {
    return null;
  }

  return `/images/${encodeURIComponent(match[1])}`;
}
