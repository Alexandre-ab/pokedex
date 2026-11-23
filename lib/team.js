// Logique pure de la sacoche de dresseur : pas de React, pas d'API
// navigateur. La limite de 6 Pokémon vit ici, pas dans l'interface.
export const MAX_TEAM_SIZE = 6;

// Ajoute un id à l'équipe, sans jamais muter le tableau reçu.
// Renvoie { team, ok, reason } : si ok est false, team est inchangée et
// reason explique pourquoi (déjà présent, ou sacoche pleine).
export function addToTeam(team, id) {
  if (team.includes(id)) {
    return { team, ok: false, reason: "Ce Pokémon est déjà dans la sacoche" };
  }

  if (team.length >= MAX_TEAM_SIZE) {
    return {
      team,
      ok: false,
      reason: "La sacoche est pleine (6 Pokémon maximum)",
    };
  }

  return { team: [...team, id], ok: true, reason: null };
}

// Retire un id de l'équipe, sans jamais muter le tableau reçu.
export function removeFromTeam(team, id) {
  return team.filter((teamId) => teamId !== id);
}
