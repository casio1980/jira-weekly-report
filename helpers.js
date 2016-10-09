const Handlebars = require('handlebars');

Handlebars.registerHelper("inc", function(value, options)
{
  return parseInt(value) + 1;
});

Handlebars.registerHelper('reportSubTask', function(key, fields) {

  const prefix = {
  	'3':     'Working on',
  	'10104': 'Started a code review for'
  },
  suffix = {
  	'2': 'Won\'t fix',
  	'5': 'Not reproducible'
  };

  var ret = prefix[fields.status.id] || fields.status.name;
  ret += ' ' + fields.parent.key + ' /';
  ret += ' ' + key + ':';
  ret += ' "' + fields.summary + '"';

  if (fields.resolution && suffix[fields.resolution.id]) {
  	return ret += ' as ' + suffix[fields.resolution.id];
  }

  return ret;
});

Handlebars.registerHelper('reportBug', function(key, fields) {

  const prefix = {
  	'3':     'Working on',
  	'10104': 'Started a code review for'
  },
  suffix = {
  	'2': 'Won\'t fix',
  	'5': 'Not reproducible'
  };

  var ret = prefix[fields.status.id] || fields.status.name;
  ret += ' ' + fields.priority.name.toLowerCase() + ' bug';
  ret += ' ' + key + ':';
  ret += ' "' + fields.summary + '"';

  if (fields.resolution && suffix[fields.resolution.id]) {
  	return ret += ' as ' + suffix[fields.resolution.id];
  }

  return ret;
});