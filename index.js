#!/usr/bin/env node

const jiraClient = require('jira-client');
const { Gitlab } = require('@gitbeaker/node');
const nconf = require('nconf');
const Handlebars = require('handlebars');
const helpers = require('./helpers');
require("dotenv").config();

// Init config
nconf
  .file('config.json')
  .env()

if (nconf.get('JIRA_HOST')) nconf.set('jira:host', nconf.get('JIRA_HOST'));
if (nconf.get('JIRA_USER')) nconf.set('jira:username', nconf.get('JIRA_USER'));
if (nconf.get('JIRA_PASSWORD')) nconf.set('jira:password', nconf.get('JIRA_PASSWORD'));

// Init Jira client
const config = nconf.get('jira');
const jira = new jiraClient(config);

// Init GitLab client
const git = new Gitlab({
  host: nconf.get('GITLAB_HOST'),
  token: nconf.get('GITLAB_TOKEN')
});

// Const
const rapidView = 11040;
const sprintId = 109066; // Sprint 115

const gitUserId = 17795;
const gitProjectId = 29679;
const gitBuildProjectId = 52161;

const lastReportDate = '2020-12-08';

// Search for issues
(async function () {
  try {
    // const sprints = await jira.getAllSprints(rapidView)
    // const { id: sprintId } = sprints.values.find(s => s.name === 'Sprint 115')

    console.log('Searching Jira...');
    const { issues, startAt, maxResults, total } = await jira.searchJira(`assignee = currentUser() and status changed by currentUser() AFTER ${lastReportDate} order by issuetype`);

    const stories = [];
    const bugs = [];

    const templateStory = Handlebars.compile("• {{{reportStory issue.key issue.fields}}}");
    const templateBug = Handlebars.compile("• {{{reportBug issue.key issue.fields}}}");
  
    // Iterate through the issues and create an output for each one
    issues.forEach((issue, index) => {
      const context = { issue, index };

      if (issue.fields.issuetype.name === 'Story') {
        stories.push(templateStory(context));
      } else if (issue.fields.issuetype.name === 'Bug') {
        bugs.push(templateBug(context));
      } else {
        console.error(`ERROR: Unknown issue type: ${issue.fields.issuetype.name}`);
      }
    });

    console.log('Searching GitLab...');
    // const mergeRequests = await git.MergeRequests.all({ authorId: gitUserId, projectId: gitBuildProjectId, createdAfter: lastReportDate, state: 'merged' });
    const mergeRequests = await git.MergeRequests.all({ authorId: gitUserId, createdAfter: lastReportDate });

    const other = [];

    const templateMergeRequest = Handlebars.compile("• {{{reportMergeRequest mergeRequest}}}");
    const templatePromotion = Handlebars.compile("• {{{reportPromotion mergeRequest}}}");

    mergeRequests.forEach((mergeRequest) => {
      if (mergeRequest.project_id === gitProjectId) {
        other.push(templateMergeRequest({ mergeRequest }));
      } else if (mergeRequest.project_id === gitBuildProjectId) {
        other.push(templatePromotion({ mergeRequest }));
      } else {
        console.error(`ERROR: Unknown project_id: ${mergeRequest.project_id}`);
      }
    });

    // Print the output
    console.log("\nDevelopment:");
    console.log(stories.join("\n"));
    console.log("\nBugfix:");
    console.log(bugs.join("\n"));
    console.log("\nOther:");
    console.log(other.join("\n"));
  } catch (err) {
    console.error("ERROR:", err);
  }
})();
