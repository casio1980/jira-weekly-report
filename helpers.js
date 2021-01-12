const Handlebars = require('handlebars');

Handlebars.registerHelper("inc", function(value, options) {
  return parseInt(value) + 1;
});

Handlebars.registerHelper('reportStory', function(key, fields) {
  const prefix = {
    '3': 'Working on',
    '6': 'Implemented',
    '10104': 'Started a code review for'
  };
  const suffix = {
    '2': 'Won\'t fix',
    '5': 'Not reproducible'
  };

  let ret = prefix[fields.status.id] || fields.status.name;
  ret += ` ${key}: "${fields.summary}"`;

  if (fields.resolution && suffix[fields.resolution.id]) {
    return ret += ` as ${suffix[fields.resolution.id]}`;
  }

  return ret;
});

Handlebars.registerHelper('reportBug', function(key, fields) {
  const prefix = {
    '3': 'Working on',
    '6': 'Fixed',
    '10104': 'Started a code review for'
  };
  const prio = {
    '2': 'P1',
    '3': 'P2'
  };
  const suffix = {
    '2': 'Won\'t fix',
    '5': 'Not reproducible'
  };

  let ret = prefix[fields.status.id] || fields.status.name;
  ret += ` ${prio[fields.priority.id] || fields.priority.name}`;
  ret += ` ${fields.issuetype.name.toLowerCase()} ${key}: "${fields.summary}"`;

  if (fields.resolution && suffix[fields.resolution.id]) {
    return ret += ` as ${suffix[fields.resolution.id]}`;
  }

  return ret;
});

Handlebars.registerHelper('reportMergeRequest', function(mergeRequest) {
  const { title, reference, web_url } = mergeRequest
  return `${title} ${reference}`
});

Handlebars.registerHelper('reportPromotion', function(mergeRequest) {
  const { title } = mergeRequest
  return `Promoted ${title} to PhaseII`
});