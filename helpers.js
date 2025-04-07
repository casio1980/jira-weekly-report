const Handlebars = require("handlebars");
const nconf = require("nconf");

const prefix = {
  "In Progress": "Working on",
  Done: "Implemented",
  Acceptance: "In Acceptance",
};
const prio = {};
const suffix = {
  2: "Won't fix",
  5: "Not reproducible",
};


Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

Handlebars.registerHelper("reportStory", function (key, fields) {
  const status = fields.status.name;
  const type = fields.issuetype.name;
  const priority = fields.priority.name;
  const updated = new Date(fields.updated).toLocaleDateString('en-GB');
  const link = `[${key}](${nconf.get("JIRA_BROWSE_LINK")}${key})`;

  let ret = `${prefix[status] || status} `;
  ret += `${priority} priority ${type} ${link}: "${fields.summary.trim()}" `;
  ret += `(updated ${updated}`;

  if (fields.parent) {
    const parent = `[${fields.parent.key}](${nconf.get("JIRA_BROWSE_LINK")}${fields.parent.key})`;
    ret += `, parent ${fields.parent.fields.priority.name} priority ${fields.parent.fields.issuetype.name} ${parent}: "${fields.parent.fields.summary}"`;
  }
  ret += `)`;

  return ret;
});

Handlebars.registerHelper("reportBug", function (key, fields) {
  const status = fields.status.name;
  const priority = fields.priority.name;
  const updated = new Date(fields.updated).toLocaleDateString('en-GB');
  const link = `[${key}](${nconf.get("JIRA_BROWSE_LINK")}${key})`;

  let ret = `${prefix[status] || status} `;
  ret += `${priority} severity bug ${link}: "${fields.summary.trim()}" `;
  ret += `(updated ${updated})`;

  return ret;
});

Handlebars.registerHelper("reportPullRequest", function (pullRequest) {
  const { id, title, state, fromRef, updatedDate } = pullRequest;
  const { repository } = fromRef;
  const { slug, project } = repository;
  const link = `${nconf.get("ORGANIZR_HOST")}/projects/${project.key}/repos/${slug}/pull-requests/${id}`;

  return `${state} [PR${id}](${link}): ${title} (updated ${new Date(updatedDate).toLocaleDateString('en-GB')})`;
});

Handlebars.registerHelper("reportPromotion", function (mergeRequest) {
  const { title } = mergeRequest;
  return `Promoted ${title} to PhaseII`;
});
