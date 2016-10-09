#!/usr/bin/env node

const jiraClient = require('jira-client'),
      nconf      = require('nconf'),
      Handlebars = require('handlebars'),
      _          = require('lodash'),
      helpers    = require('./helpers');

// Init config
nconf
  .argv({
    "u": {
      alias:    'username',
      describe: 'Jira user name'
    },
    "p": {
      alias:    'password',
      describe: 'Jira user password'
    }
  })
  .env()
  .file('config.json');

if (nconf.get('host')) nconf.set('jira:host', nconf.get('host'));
if (nconf.get('username')) nconf.set('jira:username', nconf.get('username'));
if (nconf.get('password')) nconf.set('jira:password', nconf.get('password'));

// Init Jira client
const config = nconf.get('jira'),
      client = new jiraClient(config);

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
