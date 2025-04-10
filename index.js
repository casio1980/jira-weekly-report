#!/usr/bin/env node

// const { Gitlab } = require("@gitbeaker/node");
const base64 = require("base-64");
const Handlebars = require("handlebars");
const helpers = require("./helpers");
const jiraClient = require("jira-client");
const nconf = require("nconf");
require("dotenv").config();

// Init config
nconf.file("config.json").env();

if (nconf.get("JIRA_HOST")) nconf.set("jira:host", nconf.get("JIRA_HOST"));
if (nconf.get("JIRA_USER")) nconf.set("jira:username", nconf.get("JIRA_USER"));
if (nconf.get("JIRA_PASSWORD"))
  nconf.set("jira:password", nconf.get("JIRA_PASSWORD"));

// Init Jira client
const config = nconf.get("jira");
const jira = new jiraClient(config);

// Init GitLab client
// const git = new Gitlab({
//   host: nconf.get("GITLAB_HOST"),
//   token: nconf.get("GITLAB_TOKEN"),
// });

// REPORTING DATE
const lastReportDate = "2025-03-07";

// Search for issues
(async function () {
  try {
    console.log("Searching Jira...");
    const { issues, startAt, maxResults, total } = await jira.searchJira(
      // `assignee = currentUser() and status changed by currentUser() AFTER ${lastReportDate} order by issuetype`
      `assignee = currentUser() and status changed AFTER ${lastReportDate} order by updatedDate ASC`
    );
    console.log(`Found ${total} records`);

    const stories = [];
    const tasks = [];
    const bugs = [];
    const other = [];

    const templateStory = Handlebars.compile(
      "{{{reportStory issue.key issue.fields}}};"
    );
    const templateBug = Handlebars.compile(
      "{{{reportBug issue.key issue.fields}}};"
    );
    const templatePullRequest = Handlebars.compile(
      "{{{reportPullRequest pullRequest}}};"
    );

    // Iterate through the issues and create an output for each one
    issues.forEach((issue, index) => {
      const context = { issue, index };

      if (issue.fields.issuetype.name === "Story") {
        stories.push(templateStory(context)); // TODO Delete?
      } else if (
        issue.fields.issuetype.name === "Task" ||
        issue.fields.issuetype.name === "Sub-task"
      ) {
        tasks.push(templateStory(context));
      } else if (issue.fields.issuetype.name === "Bug") {
        bugs.push(templateBug(context));
      } else {
        console.error(
          `ERROR: Unknown issue type: ${issue.fields.issuetype.name}`
        );
      }
    });

    console.log("Searching Bitbucket...");
    const organizr_url = `${nconf.get(
      "ORGANIZR_HOST"
    )}/rest/organizr/latest/pull-requests?q=author%3DcurrentUser()&page=0&size=30`;
    const pullRequests = await fetch(organizr_url, {
      method: "get",
      headers: {
        Authorization:
          "Basic " +
          base64.encode(
            nconf.get("ORGANIZR_USER") + ":" + nconf.get("ORGANIZR_PASSWORD")
          ),
      },
    }).then((res) => res.json());

    pullRequests.forEach(({ pullRequest }) => {
      const { updatedDate } = pullRequest;

      if (new Date(updatedDate) >= new Date(lastReportDate)) {
        // remove pull requests that are already counted in Jira section
        const counted = issues.some((issue) => pullRequest.fromRef.displayId.includes(issue.key));
        if (counted) return;

        other.push(templatePullRequest({ pullRequest }));
      }
    });
    console.log(`Found ${other.length} records`);

    /*
    console.log("Searching GitLab...");
    // const mergeRequests = await git.MergeRequests.all({ authorId: gitUserId, projectId: gitBuildProjectId, createdAfter: lastReportDate, state: 'merged' });
    const mergeRequests = await git.MergeRequests.all({
      authorId: gitUserId,
      createdAfter: lastReportDate,
    });

    const other = [];

    const templateMergeRequest = Handlebars.compile(
      "• {{{reportMergeRequest mergeRequest}}}"
    );
    const templatePromotion = Handlebars.compile(
      "• {{{reportPromotion mergeRequest}}}"
    );

    mergeRequests.forEach((mergeRequest) => {
      if (mergeRequest.project_id === gitProjectId) {
        other.push(templateMergeRequest({ mergeRequest }));
      } else if (mergeRequest.project_id === gitBuildProjectId) {
        other.push(templatePromotion({ mergeRequest }));
      } else {
        console.error(`ERROR: Unknown project_id: ${mergeRequest.project_id}`);
      }
    });
    */

    // Print the output
    console.log("\nDevelopment:");
    // console.log(stories.join("\n"));
    console.log(tasks.join("\n"));
    console.log("\nBugfix:");
    console.log(bugs.join("\n"));
    console.log("\nOther:");
    console.log(other.join("\n"));
  } catch (err) {
    console.error("ERROR:", err.message.substring(0, 200));
  }
})();
