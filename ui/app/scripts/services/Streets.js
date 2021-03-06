'use strict';

/*
Street names and abbreviations, and approximate frequency (measured using QLD
data). The format of each entry is [frequency, full name, abbreviation]
source: http://www.ipaustralia.gov.au/about-us/corporate/address-standards/
and QLD cadastral data for frequencies and a few extra street types
*/
var STREET_TYPES = [
  [197, 'ACCESS', 'ACCS'],
  [2, 'ALLEY', 'ALLY'],
  [1, 'ALLEYWAY', 'ALWY'],
  [1, 'AMBLE', 'AMBL'],
  [1, 'ANCHORAGE', 'ANCG'],
  [1, 'APPROACH', 'APP'],
  [1, 'ARCADE', 'ARC'],
  [8, 'ARTERIAL', 'ARTL'],
  [1, 'ARTERY', 'ART'],
  [132776, 'AVENUE', 'AVE'],
  [1, 'BASIN', 'BASN'],
  [240, 'BAY', 'BAY'],
  [9, 'BEACH', 'BCH'],
  [237, 'BEND', 'BEND'],
  [1, 'BLOCK', 'BLK'],
  [14637, 'BOULEVARD', 'BVD'],
  [1, 'BRACE', 'BRCE'],
  [1, 'BRAE', 'BRAE'],
  [1, 'BREAK', 'BRK'],
  [1, 'BRIDGE', 'BDGE'],
  [79, 'BROADWAY', 'BDWY'],
  [1, 'BROW', 'BROW'],
  [1, 'BYPASS', 'BYPA'],
  [1, 'BYWAY', 'BYWY'],
  [1, 'CAUSEWAY', 'CAUS'],
  [1, 'CENTRE', 'CTR'],
  [1, 'CENTREWAY', 'CNWY'],
  [677, 'CHASE', 'CH'],
  [1010, 'CIRCLE', 'CIR'],
  [1, 'CIRCLET', 'CLT'],
  [25500, 'CIRCUIT', 'CRCT'],
  [1, 'CIRCUS', 'CRCS'],
  [41892, 'CLOSE', 'CL'],
  [1, 'COLONNADE', 'CLDE'],
  [1, 'COMMON', 'CMMN'],
  [1, 'CONCOURSE', 'CON'],
  [1, 'COPSE', 'CPS'],
  [53, 'CORNER', 'CNR'],
  [192, 'CORSO', 'CSO'],
  [154481, 'COURT', 'CT'],
  [1, 'COURTYARD', 'CTYD'],
  [83, 'COVE', 'COVE'],
  [80114, 'CRESCENT', 'CRES'],
  [59, 'CREST', 'CRST'],
  [1, 'CROSS', 'CRSS'],
  [66, 'CROSSING', 'CRSG'],
  [1, 'CROSSROAD', 'CRD'],
  [1, 'CROSSWAY', 'COWY'],
  [1, 'CRUISEWAY', 'CUWY'],
  [1, 'CUL-DE-SAC', 'CDS'],
  [1, 'CUTTING', 'CTTG'],
  [1, 'DALE', 'DALE'],
  [1, 'DELL', 'DELL'],
  [1, 'DEVIATION', 'DEVN'],
  [1, 'DIP', 'DIP'],
  [1, 'DISTRIBUTOR', 'DSTR'],
  [191366, 'DRIVE', 'DR'],
  [1, 'DRIVEWAY', 'DRWY'],
  [53, 'EASE', 'EASE'],
  [1, 'EDGE', 'EDGE'],
  [1, 'ELBOW', 'ELB'],
  [4, 'END', 'END'],
  [105, 'ENTRANCE', 'ENT'],
  [7186, 'ESPLANADE', 'ESP'],
  [1, 'ESTATE', 'EST'],
  [1, 'EXPRESSWAY', 'EXPWY'],
  [1, 'EXTENSION', 'EXTN'],
  [45, 'FAIRWAY', 'FAWY'],
  [1, 'FIRE TRACK', 'FTRK'],
  [1, 'FLAT', 'FLAT'],
  [1, 'FOLLOW', 'FOLW'],
  [1, 'FOOTWAY', 'FTWY'],
  [1, 'FORESHORE', 'FSHR'],
  [1, 'FORMATION', 'FORM'],
  [22, 'FREEWAY', 'FWY'],
  [1, 'FRONT', 'FRNT'],
  [1, 'FRONTAGE', 'FRTG'],
  [42, 'GAP', 'GAP'],
  [1, 'GARDEN', 'GDN'],
  [32, 'GARDENS', 'GDNS'],
  [1, 'GATE', 'GTE'],
  [1, 'GATES', 'GTES'],
  [52, 'GLADE', 'GLD'],
  [52, 'GLEN', 'GLEN'],
  [1, 'GRANGE', 'GRA'],
  [13, 'GREEN', 'GRN'],
  [1, 'GROUND', 'GRND'],
  [2219, 'GROVE', 'GR'],
  [1, 'GULLY', 'GLY'],
  [20, 'HARBOUR', 'HRBR'],
  [149, 'HAVEN', 'HVN'],
  [48, 'HEIGHTS', 'HTS'],
  [1, 'HIGHROAD', 'HRD'],
  [32282, 'HIGHWAY', 'HWY'],
  [46, 'HILL', 'HILL'],
  [1, 'INTERCHANGE', 'INTG'],
  [1, 'INTERSECTION', 'INTN'],
  [4, 'INLET', 'IN'],
  [1447, 'ISLAND', 'ISLD'],
  [1, 'JUNCTION', 'JNC'],
  [338, 'KEY', 'KEY'],
  [5, 'LANDING', 'LDG'],
  [18333, 'LANE', 'LA'],
  [1, 'LANEWAY', 'LNWY'],
  [1, 'LEES', 'LEES'],
  [1, 'LINE', 'LINE'],
  [95, 'LINK', 'LINK'],
  [1, 'LITTLE', 'LT'],
  [1, 'LOOKOUT', 'LKT'],
  [14, 'LOOP', 'LOOP'],
  [1, 'LOWER', 'LWR'],
  [15, 'LYNNE', 'LYNN'],
  [31, 'MALL', 'MALL'],
  [35, 'MEAD', 'MEAD'],
  [1, 'MEANDER', 'MNDR'],
  [1, 'MEW', 'MEW'],
  [91, 'MEWS', 'MEWS'],
  [97, 'MOTORWAY', 'MTRWY'],
  [1, 'MOUNT', 'MT'],
  [1, 'NOOK', 'NOOK'],
  [576, 'OUTLOOK', 'OTLK'],
  [37177, 'PARADE', 'PDE'],
  [27, 'PARK', 'PARK'],
  [1, 'PARKLANDS', 'PKLD'],
  [646, 'PARKWAY', 'PKWY'],
  [1, 'PART', 'PART'],
  [58, 'PASS', 'PASS'],
  [2, 'PASSAGE', 'PSGE'],
  [1, 'PATH', 'PATH'],
  [1, 'PATHWAY', 'PHWY'],
  [1, 'PIAZZA', 'PIAZ'],
  [68037, 'PLACE', 'PL'],
  [1, 'PLATEAU', 'PLAT'],
  [19, 'PLAZA', 'PLZA'],
  [148, 'POCKET', 'PKT'],
  [120, 'POINT', 'PNT'],
  [1, 'PORT', 'PORT'],
  [609, 'PROMENADE', 'PROM'],
  [1, 'QUAD', 'QUAD'],
  [1, 'QUADRANGLE', 'QDGL'],
  [1, 'QUADRANT', 'QDRT'],
  [556, 'QUAY', 'QY'],
  [1, 'QUAYS', 'QYS'],
  [1, 'RAMBLE', 'RMBL'],
  [1, 'RAMP', 'RAMP'],
  [1, 'RANGE', 'RNGE'],
  [1, 'REACH', 'RCH'],
  [1, 'RESERVE', 'RES'],
  [187, 'REST', 'REST'],
  [73, 'RETREAT', 'RTT'],
  [1, 'RIDE', 'RIDE'],
  [50, 'RIDGE', 'RDGE'],
  [1, 'RIDGEWAY', 'RGWY'],
  [1, 'RIGHT OF WAY', 'ROWY'],
  [1, 'RING', 'RING'],
  [1466, 'RISE', 'RISE'],
  [165, 'RIVER', 'RVR'],
  [1, 'RIVERWAY', 'RVWY'],
  [1, 'RIVIERA', 'RVRA'],
  [503964, 'ROAD', 'RD'],
  [1, 'ROADS', 'RDS'],
  [1, 'ROADSIDE', 'RDSD'],
  [1, 'ROADWAY', 'RDWY'],
  [1, 'RONDE', 'RNDE'],
  [1, 'ROSEBOWL', 'RSBL'],
  [1, 'ROTARY', 'RTY'],
  [1, 'ROUND', 'RND'],
  [1, 'ROUTE', 'RTE'],
  [260, 'ROW', 'ROW'],
  [1, 'RUE', 'RUE'],
  [1, 'RUN', 'RUN'],
  [1, 'SERVICE WAY', 'SWY'],
  [1, 'SIDING', 'SDNG'],
  [1, 'SLOPE', 'SLPE'],
  [1, 'SOUND', 'SND'],
  [1, 'SPUR', 'SPUR'],
  [300, 'SQUARE', 'SQ'],
  [1, 'STAIRS', 'STRS'],
  [1, 'STATE HIGHWAY', 'SHWY'],
  [1, 'STEPS', 'STPS'],
  [1, 'STRAND', 'STRA'],
  [938075, 'STREET', 'ST'],
  [6, 'STRIP', 'STRP'],
  [1, 'SUBWAY', 'SBWY'],
  [1, 'TARN', 'TARN'],
  [34413, 'TERRACE', 'TCE'],
  [1, 'THOROUGHFARE', 'THOR'],
  [1, 'TOLLWAY', 'TLWY'],
  [1, 'TOP', 'TOP'],
  [1, 'TOR', 'TOR'],
  [1, 'TOWERS', 'TWRS'],
  [199, 'TRACK', 'TRK'],
  [99, 'TRAIL', 'TRL'],
  [1, 'TRAILER', 'TRLR'],
  [1, 'TRIANGLE', 'TRI'],
  [1, 'TRUNKWAY', 'TKWY'],
  [1, 'TURN', 'TURN'],
  [1, 'UNDERPASS', 'UPAS'],
  [1, 'UPPER', 'UPR'],
  [51, 'VALE', 'VALE'],
  [1, 'VIADUCT', 'VDCT'],
  [75, 'VIEW', 'VIEW'],
  [1, 'VILLAS', 'VLLS'],
  [104, 'VISTA', 'VSTA'],
  [1, 'WADE', 'WADE'],
  [272, 'WALK', 'WALK'],
  [1, 'WALKWAY', 'WKWY'],
  [60, 'WATERS', 'WAT'],
  [24262, 'WAY', 'WAY'],
  [1, 'WHARF', 'WHRF'],
  [1, 'WYND', 'WYND'],
  [1, 'YARD', 'YARD']
].sort(function(x, y) { return y[0] - x[0]; });

var STREET_PARTS = [
  [131, 'CENTRAL', 'CN'],
  [4836, 'EAST', 'E'],
  [5, 'EXTENSION', 'EX'],
  [1, 'LOWER', 'LR'],
  [2027, 'NORTH', 'N'],
  [1, 'NORTH EAST', 'NE'],
  [1, 'NORTH WEST', 'NW'],
  [1823, 'SOUTH', 'S'],
  [1, 'SOUTH EAST', 'SE'],
  [1, 'SOUTH WEST', 'SW'],
  [42, 'UPPER', 'UP'],
  [3879, 'WEST', 'W']
].sort(function(x, y) { return y[0] - x[0]; });
 
var AEC_STREET_PARTS = [
  'AVE',
  'CIR',
  'CRCT',
  'CL',
  'CT',
  'CRES',
  'DR',
  'ESP',
  'EXPWY',
  'HWY',
  'LA',
  'MTRWY',
  'PDE',
  'PL',
  'RD',
  'SQ',
  'ST',
  'TCE',
  'WAY'
];

/*
// check all AEC street types are catered for
angular.forEach(AEC_STREET_PARTS, function(abbrev) {
  var count = 0;
  angular.forEach(STREET_TYPES, function(entry) {
    if (entry[2] == abbrev) {
      count = count + 1;
    }
  });
  if (count != 1) {
    alert('SYSTEM ERROR: bad street data: entry=' + abbrev);
  }
});
*/

angular.module('oevfApp')
.factory('Streets', function () {
  return {
    types: STREET_TYPES,
    parts: STREET_PARTS,
    aecCodes: AEC_STREET_PARTS,
    
    isAecStreetPart: function(part) {
      for (var i in AEC_STREET_PARTS) {
        if (part === AEC_STREET_PARTS[i]) {
          return true;
        }
      }
      return false;
    }
  };
});
