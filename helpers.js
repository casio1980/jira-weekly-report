const Handlebars = require("handlebars");
const nconf = require("nconf");

Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

Handlebars.registerHelper("reportStory", function (key, fields) {
  const prefix = {
    "In Progress": "Working on",
    Done: "Implemented",
    10104: "Started a code review for",
  };
  const suffix = {
    2: "Won't fix",
    5: "Not reproducible",
  };

  let ret = prefix[fields.status.name] || fields.status.name;
  ret += ` ${nconf.get("JIRA_BROWSE_LINK")}${key}: "${fields.summary}"`;

  if (fields.resolution && suffix[fields.resolution.id]) {
    return (ret += ` as ${suffix[fields.resolution.id]}`);
  }

  return ret;
});

Handlebars.registerHelper("reportBug", function (key, fields) {
  const prefix = {
    "In Progress": "Working on",
    Done: "Fixed",
    10104: "Started a code review for",
  };
  const prio = {};
  const suffix = {
    2: "Won't fix",
    5: "Not reproducible",
  };

  let ret = prefix[fields.status.name] || fields.status.name;
  ret += ` ${prio[fields.priority.id] || fields.priority.name} severity`;
  ret += ` ${fields.issuetype.name.toLowerCase()} ${nconf.get(
    "JIRA_BROWSE_LINK"
  )}${key}: "${fields.summary}"`;

  if (fields.resolution && suffix[fields.resolution.id]) {
    return (ret += ` as ${suffix[fields.resolution.id]}`);
  }

  return ret;
});

Handlebars.registerHelper("reportPullRequest", function (pullRequest) {
  const { title, state } = pullRequest;
  return `${state} ${title}`;
});

Handlebars.registerHelper("reportPromotion", function (mergeRequest) {
  const { title } = mergeRequest;
  return `Promoted ${title} to PhaseII`;
});
