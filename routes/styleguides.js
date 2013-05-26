var styleguides = {
  'fc_soar': {
    'name':'Flight Centre SOAR',
    'machineName':'fc_soar'
  },
  'fc_sfau': {
    'name':'Student Flights Australia',
    'machineName':'fc_sfau'
  }
};

exports.findAll = function(request, response) {
  response.send(styleguides);
}

exports.findByName = function(request, response) {
  var styleguide = styleguides[request.params.name];
  response.send(styleguide);
}
