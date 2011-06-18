var GLOBALS = {
  years: ['2003', '1997', '1988', '1985', '1989', '1986', '1987', '1948',
          '1949', '1968', '1969', '1980', '1981', '1964', '1965', '1966',
          '1967', '1960', '1961', '1962', '1963', '1996', '2011', '2010',
          '2005', '1984', '1955', '1954', '1957', '1956', '1951', '1950',
          '1953', '1952', '1982', '1959', '1958', '1983', '1991', '1990',
          '1993', '1992', '1995', '1994', '1979', '1978', '1977', '1976',
          '1975', '1974', '1973', '1972', '1971', '1970', '2002', '1999',
          '2000', '2001', '2006', '2007', '2004', '1998', '2008', '2009'],
  stations: ['413182874', '406183874', '403184374', '386187124', '456193874',
             '406186124', '398183624', '416184374', '408187624', '448194374',
             '388185624', '408185624', '416183124', '406188124', '381189624',
             '398184874', '381189124', '413196874', '401185374', '393184624',
             '413186624', '383188124', '398185124', '411187124', '393189124',
             '398185374', '383187124', '383186874', '401188624', '388189374',
             '386189374', '396187124', '473197374', '406185124', '406188374',
             '458193624', '403186374', '383189374', '413184624', '398183374',
             '416184624', '393189624', '388185874', '396187624', '393187624',
             '398184624', '383187374', '403184624', '386189124', '413183124',
             '413184124', '393185874', '411184874', '406184624', '401184374',
             '408188374', '408185874', '391189124', '408183624', '381186374',
             '408187874', '386188874', '418184874', '408185124', '406189874',
             '391189624', '408194374', '403189124', '408184374', '456193624',
             '411184624', '386186874', '386189874', '411183374', '403184874',
             '388187374', '403188874', '388186874', '406187874', '401189624',
             '391188124', '416184124', '418184124', '448194124', '428197374',
             '408184124', '386187374', '403185124', '411190124', '398187624',
             '386189624', '403183874', '398184374', '396183624', '378189624',
             '391185874', '411186624', '406185874', '411188374', '403186624',
             '386186374', '411188874', '408188124', '406184374', '418183874',
             '406184124', '391185624', '403184124', '433182874', '403188624',
             '391188874', '406187624', '381188374', '381189874', '406188874',
             '381189374', '401184624', '396184624', '398187874', '396184374',
             '391188374', '396187874', '408188624', '388188874', '396185374',
             '408188874', '381188874', '401189374', '381186874', '398189874',
             '406184874', '406188624', '383188874', '398185624', '406183374',
             '393189874', '396184874', '383189624'],
}

function sum(ar) {
  for (var i=0, s=0;i<ar.length;i++) {
    s+=ar[i];
  }
  return s;
}

function parseDailyValue(dt, row_i, col_i, include_i) {
  var valsArr = [];
  var precipValues = dt.getValue(row_i, col_i);
  precipValues = precipValues.slice(1, precipValues.length-1).split(', ');
  for (var j=0;j<precipValues.length;j++) {
    if (include_i != undefined) {
      valsArr.push(Number(precipValues[j]));
    } else {
      valsArr.push([String(j), Number(precipValues[j])]);
    }
  }
  return valsArr;
}

var DailyParser = function() {
  this.dataTable_ = null;
  this.options_ = null;
}

DailyParser.prototype.draw = function(datatable, options, state) {
  this.dataTable_ = datatable;
  this.options_ = options;
  google.visualization.events.trigger(this, 'ready', null);
};

DailyParser.prototype.applyOperator = function() {
  // handle most recent year
  var row_i = 0;
  var valsArr = [['day', 'precipitation', 'Average Past 10 Years']];
  var precipValuesCurrentYear = parseDailyValue(this.dataTable_,
                                                row_i,
                                                INDEXES.precipitation_arr)
  // handle other years
  var precipValuesOtherYears = [];
  for (var i=1;i<this.dataTable_.getNumberOfRows()-1;i++) {
    var n = parseDailyValue(this.dataTable_,
                            i,
                            INDEXES.precipitation_arr,
                            true);
    precipValuesOtherYears = precipValuesOtherYears.concat(n);
  }
  var averageForOlderDates = sum(precipValuesOtherYears)/precipValuesOtherYears.length
  // handle merge
  valsArr = valsArr.concat(precipValuesCurrentYear);
  for (var i=1;i<valsArr.length; i++) {
    valsArr[i].push(averageForOlderDates);
  }
  var data = google.visualization.arrayToDataTable(valsArr);
  return data;
};



var QuadrantGrouper = function() {
  this.dataTable_ = null;
  this.options_ = null;
}

QuadrantGrouper.prototype.draw = function(datatable, options, state) {
  this.dataTable_ = datatable;
  this.options_ = options;
  google.visualization.events.trigger(this, 'ready', null);
};

QuadrantGrouper.prototype.applyOperator = function() {
  // handle most recent year
  var xs = []
  var ys = []
  for (var i=0;i<this.dataTable_.getNumberOfRows()-1;i++) {
    ys.push(this.dataTable_.getValue(i, 2));
    xs.push(this.dataTable_.getValue(i, 3))
  }
  var xmed = (7-1)/2+1
  var ymed = (.7-.3)/2+.3
  var buckets = {lowRainInfrequent:0, lowRainFrequent:0,highRainFrequent:0,highRainInfrequent:0}
  
  for (var i=0;i<xs.length;i++) {
    if (xs[i] >= xmed && ys[i] >= ymed) {
      buckets.highRainFrequent+=1;
    } else if (xs[i] >= xmed && ys[i] < ymed) {
      buckets.highRainInfrequent+=1;
    } else if (xs[i] < xmed && ys[i] < ymed) {
      buckets.lowRainInfrequent+=1;
    } else if (xs[i] < xmed && ys[i] >= ymed){
      buckets.lowRainFrequent+=1;
    }
  }
  var newr = [['quadrant', 'volume']];
  for (var i in buckets) {
    newr.push([i, buckets[i]]);
  }
  return google.visualization.arrayToDataTable(newr);
};
