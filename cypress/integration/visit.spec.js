/// <reference types="Cypress" />

const host = Cypress.env("HOST");

let links = {};

Cypress.on("uncaught:exception", () => {
  return false;
});
Object.defineProperty(top, "onerror", {
  value: window.onerror
});

context("Navigation", () => {
  before(() => {
    cy.task("readFileMaybe", "hostlinks").then(old => {
      if (old) {
        links = JSON.parse(old);
      }
    });
  });
  it("all site!", () => {
    visit(cy, `${host}/`);
  });
});

function visit(cy, url) {
  cy.visit(url);

  if (Cypress.env("SWITCH") !== "false") {
    cy.get("[data-switcher-id=0] .wgcurrent", { timeout: 5000 }).click();
    cy.get(".weglot-container ul li").each(item => {
      cy.get(item)
        .invoke("text")
        .then(t => {
          console.log(t);
          cy.get(item).click({ force: true });
          cy.wait(200);
          cy.get(".wg-progress-bar", { timeout: 60000 }).should("not.exist");
        });
    });
  }

  const visited = Object.keys(links).filter(url => links[url]).length;
  const total = Object.keys(links).length;
  console.log(`${visited}/${total}`);
  links[url] = true;
  cy.get("a[href]")
    .each(a => {
      let link = a.attr("href");
      if (
        link.startsWith("#") ||
        link.startsWith("javascript:") ||
        link.startsWith("callto:") ||
        link.startsWith("tel:") ||
        link.startsWith("E-commerce:") ||
        link.startsWith("mailto:")
      ) {
        return;
      }
      if (!link.includes("//")) {
        const slash = link.startsWith("/") ? "" : "/";
        link = `${host}${slash}${link}`;
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
      cy.writeFile("hostlinks", links).then(() => {
        if (!toVisit) {
          return true;
        }
        visit(cy, toVisit);
      });
    });
}
