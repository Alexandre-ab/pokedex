// Ajoute ou retire un id d'une liste de favoris, sans jamais modifier le
// tableau reçu (on renvoie toujours un nouveau tableau).
export function toggleFavorite(ids, id) {
  if (ids.includes(id)) {
    return ids.filter((favoriteId) => favoriteId !== id);
  }
  return [...ids, id];
}
