#!/usr/bin/env node

const jiraClient = require('jira-client');
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
const client = new jiraClient(config);

const rapidView = 11040;
const sprintId = 109066; // Sprint 115

// Search for issues
(async function () {
  try {
    // const sprints = await client.getAllSprints(rapidView)
    // const { id: sprintId } = sprints.values.find(s => s.name === 'Sprint 115')

    const result = await client.searchJira('status changed by currentUser() during (startOfWeek(-1w), endOfWeek(-1w)) order by issuetype');
    const { issues, startAt, maxResults, total } = result;
    const output = [];

    const templateSubTask = Handlebars.compile("{{inc index}}. {{{reportSubTask issue.key issue.fields}}};");
    const templateBug = Handlebars.compile("{{inc index}}. {{{reportBug issue.key issue.fields}}};");
  
    // Iterate through the issues and create an output for each one
    issues.forEach((issue, index) => {
      const context = { issue, index };

      if (issue.fields.issuetype.subtask) {
        // Sub-task
        output.push(templateSubTask(context));
      } else {
        // Bug
        output.push(templateBug(context));
      }
    });

    // Print the output
    console.log(output.join("\n"));
  } catch (err) {
    console.error("ERROR:", err);
  }
})();
