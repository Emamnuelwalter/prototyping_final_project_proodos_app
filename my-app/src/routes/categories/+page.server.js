import { sports } from "$lib/data/sports.js";

export async function load() {
  return {
    sports,
  };
}
