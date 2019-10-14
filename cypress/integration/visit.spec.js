/// <reference types="Cypress" />

const host = Cypress.env("HOST") || "https://weglot.com";

const links = {};

Cypress.on("uncaught:exception", () => {
  return false;
});

context("Navigation", () => {
  it("all site!", () => {
    visit(cy, `${host}/`);
  });
});

function visit(cy, url) {
  cy.visit(url);
  const visited = Object.keys(links).filter(url => links[url]).length;
  const total = Object.keys(links).length;
  console.log(`${visited}/${total}`);
  links[url] = true;
  cy.get("a[href]")
    .each(a => {
      let link = a.attr("href");
      if (link.startsWith("/") && !link.startsWith("//")) {
        link = `${host}${link}`;
      }
      if (!link.startsWith(host)) {
        return;
      }
      if (links[link] === undefined) {
        links[link] = false;
      }
    })
    .then(() => {
      const toVisit = Object.keys(links).find(url => !links[url]);
      if (!toVisit) {
        return true;
      }
      visit(cy, toVisit);
    });
}
