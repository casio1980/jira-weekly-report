#!/usr/bin/env node

const jiraClient = require('jira-client');
const nconf = require('nconf');
const Handlebars = require('handlebars');
const _ = require('lodash');
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

// Search for issues
client.searchJira('status changed by currentUser() during (startOfWeek(-1w), endOfWeek(-1w)) order by issuetype') // TODO { maxResults: 50 }
  .then(function(result) {
    var startAt    = result.startAt,
      maxResults = result.maxResults,
      total      = result.total,
      output     = [];

  var templateSubTask = Handlebars.compile("{{inc index}}. {{{reportSubTask issue.key issue.fields}}};"),
      templateBug     = Handlebars.compile("{{inc index}}. {{{reportBug issue.key issue.fields}}};");

  // Iterate through the issues and create an output for each one
    _.each(result.issues, function(issue, i) {
      var context = {
        index: i,
        issue: issue
      };

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
  })
  .catch(function(err) {
    console.error("ERROR:", err);
  });
