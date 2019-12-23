//TODO: Take input from user
var args = [
  {
    "key": "input", 
    "default": "الاعمال بالنية", 
    "value": "الاعمال بالنية"
  },
  {
    "key": "numNarrators", 
    "default": "50",
    "value": "50"
  },
];

var input = 0;
var numNarrators = 1;

function query(data, index){
  // hadith contains the input
  //retunrs a list of chains
  var asaneed = [];
  var txt = simplifyArabic(getHadithTxt(data,index));
  if(txt.includes(simplifyArabic(args[input]["value"]))){
    asaneed = getHadithAsaneed(data, index);
  }
  return asaneed;
}

/****************** Library **********************/
// Source: Kaggle Hadith Data Set  
var URL = "https://raw.githubusercontent.com/OmarShafie/hadith/master/"
var hadithURL = URL+"data/tutorial/data%20-%20data.csv";
var narratorsURL = URL+"data/tutorial/narrators.csv";

//Parse Parameters
var inputType = "remote";
var stepped = 0, rowCount = 0, errorCount = 0, firstError;
var start, end;
var firstRun = true;
var maxUnparseLength = 10000;

var isParsingDone = false;
var parsedData;

var HadithArr = [];
var result_graph = [];

$(function()
  {
  $('#submit').click(
    function(){
    if ($(this).prop('disabled') == "true") { return; }

    stepped = 0;
    rowCount = 0;
    errorCount = 0;
    firstError = undefined;

    var config = buildConfig();

    // Allow only one parse at a time
    $(this).prop('disabled', true);

      document.getElementById("submit").innerHTML = '<span class="spinner-border spinner-border-sm"></span> Loading..';
      
      for (var p = 0; p < args.length;p++){
        args[p]["value"] = document.getElementById(args[p]["key"]).value;
        if (args[p]["value"] == ""){
          args[p]["value"] = args[p]["default"];
        }
      }
      
    if (!firstRun){
      console.log("--------------------------------------------------");
    }
    else {
      firstRun = false;
    }
    if (!isParsingDone) {
      var narratorsData;
      Papa.parse(narratorsURL,  {
        delimiter: $('#delimiter').val(),
        header: $('#header').prop('checked'),
        dynamicTyping: $('#dynamicTyping').prop('checked'),
        skipEmptyLines: $('#skipEmptyLines').prop('checked'),
        preview: parseInt($('#preview').val() || 0),
        step: $('#stream').prop('checked') ? stepFn : undefined,
        encoding: $('#encoding').val(),
        worker: $('#worker').prop('checked'),
        comments: $('#comments').val(),
        complete: saveNarrators,
        error: errorFn,
        download: inputType == "remote"
      });
      if (config.worker || config.download)
        document.getElementById("btnMessage").innerHTML = "Running...";
    } else {
      main(parsedData, narratorsData);
    }
  });
});
  
  function buildConfig()
  {
  return {
    delimiter: $('#delimiter').val(),
    header: $('#header').prop('checked'),
    dynamicTyping: $('#dynamicTyping').prop('checked'),
    skipEmptyLines: $('#skipEmptyLines').prop('checked'),
    preview: parseInt($('#preview').val() || 0),
    step: $('#stream').prop('checked') ? stepFn : undefined,
    encoding: $('#encoding').val(),
    worker: $('#worker').prop('checked'),
    comments: $('#comments').val(),
    complete: completeFn,
    error: errorFn,
    download: inputType == "remote"
  };
}

function saveNarrators(results)
{

  document.getElementById("btnMessage").innerHTML = "Parsed Narrators...";
  end = now();

  if (results && results.errors)
  {
    if (results.errors)
    {
      errorCount = results.errors.length;
      firstError = results.errors[0];
    }
    if (results.data && results.data.length > 0)
      rowCount = results.data.length;
  }
  narratorsData = results.data;
  Papa.parse(hadithURL, buildConfig());
}

function completeFn(results)
{ 
  document.getElementById("btnMessage").innerHTML = "Parsed Hadith Dataset!";
  end = now();

  if (results && results.errors)
  {
    if (results.errors)
    {
      errorCount = results.errors.length;
      firstError = results.errors[0];
    }
    if (results.data && results.data.length > 0)
      rowCount = results.data.length;
  }
  isParsingDone = true;
  parsedData = results.data;
  enableButton();
  //console.log(parsedData);
}

function errorFn(err, file)
{
  end = now();
  console.log("ERROR:", err, file);
  enableButton();
}

function enableButton()
{
  $('#submit').prop('disabled', false);
  document.getElementById("submit").innerHTML = "Submit";
}

function now()
{
  return typeof window.performance !== 'undefined'
    ? window.performance.now()
  : 0;
}

/*-------------- Graph bulild functions ------------*/
function updateCount(data, source, target, hadith){
  // updates the count for [source, target, count,[h1,h2...]] in data
  var found = false;
  var i = 0; 
  //TODO: Optimize this
  while(!found && i < data.length){
    if(data[i][0] == source && data[i][1] == target){
      // narrators index matches
      found = true;
      data[i][2]++; //increment count of the link
      data[i][3].push(hadith);
    }
    i++;
  }
  if (!found){
    // not found, so add a new link
    data.push([source, target, 1, [hadith]]);
    }
}
  function getIndex(key, graph){
    // returns the index of key in the graph
    // graph = [..., [[key, Sum(w[1],w[2] ...w[m])], [n1,w[1]], [n2,w[2]], ..., [nm,w[m]] ], ...]
    for(var i = 0; i < graph.length; i++){
      var vertix = graph[i][0][0];
      if (vertix == key) {
        return i;
      }
    }
    return -1;
  }

function isCyclicUtil(v, visited, recStack, graph){
  //mark as visited
  visited[v] = true;
  recStack[v] = true;
  var index = getIndex(v, graph);
  if (index >= 0) {
    var node = graph[index];
    for(var neighbour = 1; neighbour < node.length; neighbour++){
      if (!visited[node[neighbour][0]]) {
        if (isCyclicUtil(node[neighbour][0], visited, recStack, graph)){
          return true;
        }
      } else if (recStack[node[neighbour][0]] == true) {
        return true
      }
    }
  }
  recStack[v] = false;
  return false;
}

function isCyclic(graph){
  var visited = {}; // list of visited nodes
  var recStack = {};
  for (var n = 0; n < graph.length; n++){
    if(!visited[graph[n][0]]){
      if (isCyclicUtil(graph[n][0][0],visited,recStack, graph)){
        return true
      }
    }
  }
  return false;
}

function cycleFilter (edges){
  // edges = [..., [source, target, weight,[h1,h2...]], ...]
  var graph = []; // create an adjacency list of narrators indices graph
  var data = []; // to be returned as polished data
  for(var e = 0; e < edges.length; e++){
    // for each edge, add to graph, check if it creates a cycle
    var source = edges[e][0];
    var target = edges[e][1];
    var weight = edges[e][2];
    var hadiths = edges[e][3];
    var sourceIndex = getIndex(source, graph);
    var targetIndex = getIndex(target, graph);
    if (sourceIndex >= 0) {
      graph[sourceIndex].push([target, weight, hadiths]);
    }
    else {
      sourceIndex = graph.length;
      graph.push([[source,0],[target, weight, hadiths]]);
    }

    if (isCyclic(graph)) {
      console.log("removing link as it creates a cycle", [source, target])
      graph[sourceIndex].pop(); //remove point as it creates a cycle
    }
    else {
      if (targetIndex < 0) {
        targetIndex = graph.length;
        graph.push([[target,0]]);
      }
      graph[targetIndex][0][1] += weight;
      graph[sourceIndex][0][1] += weight;
    }
  }

  return graph;
}


/*-------------- Data functions -------------*/
function getHadithNum(data, index){
  return data[index][0];
}
function getTitle(data, index){
  return data[index][1];
}
function getHadithTxt(data, index){
  return data[index][2];
}
function getHadithXML(data, index){
  return data[index][3];
}
function getHadithAsaneed(data, index){
  var s = data[index][4].replace(/'/g, "").replace(/s/g, "").split(",");
  for (var chain = 0; chain < s.length; chain++){
    s[chain] = s[chain].split("%5C%5C");
  }
  return s
}

function lookupNarrator(index){
  //returns data of the narrator with index from the narratorsData
  var found = narratorsData.find(function(element) {
    return element[0] == index;
  });
  if (!found){
    // else create a narrator data
    found = [index,index]
    //console.log("narrator is missing", index);
  }
  return found
}

/* ---------- Utility functions --------*/
function now() {
  return new Date().getTime();
}

var arabicNormChar = {
    'ك': 'ک', 'ﻷ': 'لا', 'ؤ': 'و', 'ى': 'ی', 'ي': 'ی', 'ئ': 'ی', 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ٳ': 'ا', 'ة': 'ه', 'ء': '', 'ِ': '', 'ْ': '', 'ُ': '', 'َ': '', 'ّ': '', 'ٍ': '', 'ً': '', 'ٌ': '', 'ٓ': '', 'ٰ': '', 'ٔ': '', '�': ''
}

var simplifyArabic  = function (str) {
    return str.replace(/[^\u0000-\u007E]/g, function(a){ 
        var retval = arabicNormChar[a]
        if (retval == undefined) {retval = a}
        return retval; 
    }).normalize('NFKD').toLowerCase();
}

//now you can use simplifyArabic(str) on Arabic strings to remove the diacritics

/*-------------- Main Code -------------*/
function process(array, callback){
  document.getElementById("btnMessage").innerHTML = "Start Processing...";
  var startTime = now();
  var tempData = []; //to be passed to after process
  var chunk = 300;
  var i = 0;
  var counter = 0;
  
  function loop() {
    var cnt = chunk;
    while (cnt-- && i < array.length-1) {
      var hadithId = i;
      var chains = query(array,hadithId);
      for(var c = 0; c < chains.length; c++){
        var sanad = chains[c];
        for(var n = 0; n < sanad.length -1;n++) {
          updateCount(tempData, sanad[n+1], sanad[n], hadithId);
        }
      }
      ++i;
    }
    if ( i < array.length-1) {                      //the condition
      setTimeout(loop, 1); //rerun when condition is true
    } else { 
      document.getElementById("btnMessage").innerHTML = "Done Processing in ..."+ (now() - startTime);

      callback(tempData);
    }
  }
  loop();                                         //start with 0
}


function afterProcess(temp){

  // sort data in decending order of importance, i.e number of ahadith
  // this is used so that only least important cyclic edges are removed 
  console.log(temp);
  temp.sort(function(a, b) {
    return b[2] - a[2];
    });
  
  //filter cycles and add lables
  result_graph = cycleFilter(temp); // graph = [..., [[key, Sum(w[1],w[2] ...w[m])], [n1,w[1]], [n2,w[2]], ..., [nm,w[m]] [h1,h2...] ], ...]
  
  result_graph.sort(function(a, b) { //Sort by total sum of out weights
    return b[0][1] - a[0][1];
    });

  document.getElementById("btnMessage").innerHTML += "    Total of Narrators: " + result_graph.length;
  var ready_data = [];
  result_graph = result_graph.slice(0, parseInt(args[numNarrators]["value"]));


  var names = [];
  for (var i = 0; i < result_graph.length; i++){
    var node = result_graph[i];
    var narrator = lookupNarrator(node[0][0]);
  var name = narrator[1].split(" ").slice(0,3).join(' ');
  names.push(narrator[0]+".."+name+" ");
  }
  
  var first_layer_count = 0; // used as indication of height of sankey
  var first_layer_total = 0;
  for (var i = 0; i < result_graph.length; i++){
    var node = result_graph[i];
    var nodeInd = getIndex(node[0][0], result_graph);
    for (var j = 1; j < node.length; j++){ //Out neighbors
      var index = getIndex(node[j][0], result_graph);
      if (index >= 0) {
        var tooltip = '<div class="hadithTooltip" ><table><thead><tr>';
        tooltip += '<th>'+names[nodeInd]+"---("+node[j][2].length+")--->"+names[index]+'</th>';
        tooltip += '<th>Id</th>';
        tooltip += '<th>Chain</th>';
        tooltip += '<th>Book</th>';
        tooltip += '</tr></thead><tbody>';
        for(var h = 0; h < node[j][2].length; h++){
          var hadith = node[j][2][h];
          tooltip += "<tr><td>";
          tooltip += getHadithTxt(HadithArr, hadith);
          tooltip += "</td>";

          tooltip += "<td>";
          tooltip += getHadithNum(HadithArr, hadith);
          tooltip += "</td>";

          tooltip += "<td>";
          tooltip += getHadithAsaneed(HadithArr, hadith);
          tooltip += "</td>";

          tooltip += "<td>";
          tooltip += getTitle(HadithArr, hadith);
          tooltip += "</td></tr>";
        }
        tooltip += "</tbody></table></div>";
        ready_data.push([names[nodeInd], names[index], node[j][1],tooltip]);

        if (names[nodeInd].includes('5495..')) {
          first_layer_count += 1;
		  first_layer_total += node[j][1];
        }
      }
    }
  }

  var data = new google.visualization.DataTable();
  data.addColumn('string', 'From');
  data.addColumn('string', 'To');
  data.addColumn('number', 'Weight');
  data.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});
  data.addRows(ready_data);
  console.log(first_layer_count, first_layer_total);
  google.charts.setOnLoadCallback(drawChart(data, first_layer_count, first_layer_total));
  enableButton();
}
function main(hadithData){
  HadithArr = [];
  var num_books = 1;
  // TODO: Check book Indices
  var books = {
    0: [1    , 7371],
    1: [7371 , 14967],
    2: [14967, 20227],
    3: [20227, 24441],
    4: [24441, 30215],
    5: [30215, 34443],
  }
  
  for (var i = 0; i < num_books; i++) {
    if(document.getElementById(i).checked){
      HadithArr = HadithArr.concat(hadithData.slice(books[i][0], books[i][1]));
    }
  }
  process(HadithArr, afterProcess);
}

window.onload = function (){ document.getElementById("submit").click();}
