// Fonction helper pour capitaliser la première lettre
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format pour les articles de blog : "20 Janvier 2026"
export function formatBlogDate(date: string): string {
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }

  const targetDate = new Date(date);

  const formattedDate = targetDate.toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return capitalizeFirstLetter(formattedDate);
}

// Format pour les projets : "Juillet 2024"
export function formatProjectDate(date: string): string {
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }

  const targetDate = new Date(date);

  const formattedDate = targetDate.toLocaleString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return capitalizeFirstLetter(formattedDate);
}

// Ancienne fonction conservée pour compatibilité (utilisée pour le tri)
export function formatDate(date: string, includeRelative = false) {
  const currentDate = new Date();

  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }

  const targetDate = new Date(date);
  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  const daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = "";

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  const fullDate = targetDate.toLocaleString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  if (!includeRelative) {
    return fullDate;
  }

  return `${fullDate} (${formattedDate})`;
}
