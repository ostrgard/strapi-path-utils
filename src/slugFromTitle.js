function slugFromTitle(title, index) {
  // Lowercase, replace spaces with dashes, replace all but letters and dashes.
  const slug = title
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/\s/g, "-")
    .replace(/[^a-z0-9-]/, "");

  return index === 0 ? slug : `${slug}-${index + 1}`;
}

module.exports = {
  default: slugFromTitle,
};
