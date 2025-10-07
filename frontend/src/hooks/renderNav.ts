// C:\Users\motoyoshi\Desktop\React\MyNote\src\helpers\UserNavService.ts
import { getDefaultStore } from "jotai";
import { categoriesByIdAtom, notesByCategoryIdAtom } from "../states/UserAtom";
import type { Category, Note } from "../types/base";
import { getNavById } from "../helpers/UserNavService";

export async function fetchAndStoreNav(userId: number): Promise<void> {
  const { categories, notes } = await getNavById(userId);

  const categoriesById = new Map<number, Category>(
    categories.map((c) => [c.id, c])
  );

  const notesByCategoryId = notes.reduce((acc, n) => {
    if (!acc.has(n.categoryId)) {
      acc.set(n.categoryId, []);
    }
    acc.get(n.categoryId)!.push(n);
    return acc;
  }, new Map<number, Note[]>());

  const store = getDefaultStore();
  store.set(categoriesByIdAtom, categoriesById);
  store.set(notesByCategoryIdAtom, notesByCategoryId);
}
