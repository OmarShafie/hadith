// Source: Kaggle Hadith Data Set  
var URL = "https://raw.githubusercontent.com/OmarShafie/VizHadith/master/"
var hadithURL = URL+"all_hadiths_clean.csv";
var narratorsURL = URL+"all_rawis.csv";

//TODO: Take input from user
var input = "11013";
var numNarrators = 100;

//Parse Parameters
var inputType = "remote";
var stepped = 0, rowCount = 0, errorCount = 0, firstError;
var start, end;
var firstRun = true;
var maxUnparseLength = 10000;

$(function()
  {
  // Demo invoked
  $('#submit').click(
    function(){
    if ($(this).prop('disabled') == "true")
      return;

    stepped = 0;
    rowCount = 0;
    errorCount = 0;
    firstError = undefined;

    var config = buildConfig();

    // Allow only one parse at a time
    $(this).prop('disabled', true);
      document.getElementById("submit").innerHTML = '<span class="spinner-border spinner-border-sm"></span> Loading..';
      input = document.getElementById("rawi").value;
      numNarrators = document.getElementById("numNarrators").value;
      if (input == ""){
        input = "11013";
      }
      if (numNarrators < 1){
        numNarrators = 100;
      }
      else
        {
          numNarrators = parseInt(numNarrators)
        }
    if (!firstRun)
      console.log("--------------------------------------------------");
    else
      firstRun = false;

    if (inputType == "local")
    {
      if (!$('#files')[0].files.length)
      {
        alert("Please choose at least one file to parse.");
        return enableButton();
      }

      $('#files').parse({
        config: config,
        before: function(file, inputElem)
        {
          start = now();
        },
        error: function(err, file)
        {
          console.log("ERROR:", err, file);
          firstError = firstError || err;
          errorCount++;
        },
        complete: function()
        {
          end = now();
          printStats("Done with all files");
        }
      });
    }
    else if (inputType == "json")
    {
      if (!input)
      {
        alert("Please enter a valid JSON string to convert to CSV.");
        return enableButton();
      }

      start = now();
      var csv = Papa.unparse(input, config);
      end = now();

      console.log("Unparse complete");
      console.log("Time:", (end-start || "(Unknown; your browser does not support the Performance API)"), "ms");

      if (csv.length > maxUnparseLength)
      {
        csv = csv.substr(0, maxUnparseLength);
        console.log("(Results truncated for brevity)");
      }

      console.log(csv);

      setTimeout(enableButton, 100);  // hackity-hack
    }

    else
    {
      start = now();
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
  document.getElementById("btnMessage").innerHTML = "Parsed Hadiths...";
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

  process(results.data, narratorsData); //main function

  // icky hack
  setTimeout(enableButton, 100);
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
/*-------------- Main Code -------------*/
function lookupNarrator(index){
  //returns data of the narrator with index from the narratorsData
  return narratorsData.find(function(element) {
    return element[0] == index;
  });
}

function updateCount(data, source, target){
  var found = false;
  var i = 0; 
  //TODO: Optimize this
  while(!found && i < data.length -1){
    if(data[i][0][0] == source[0] && data[i][1][0] == target[0]){
      // narrators index matches
      found = true;
      data[i][2]++; //increment count of the link
    }
    i++;
  }
  if (!found){
    // not found, so add a new link
    data.push([source, target, 1]);
    }
}
  function getIndex(key, graph){
    for(var i = 0; i < graph.length-1; i++){
      var vertix = graph[i][0];
      if (vertix == key[0]) {
        return i;
      }
      return -1;
    }
  }

function isCyclicUtil(v, visited, recStack, graph){
  //mark as visited
  visited[v] = true;
  recStack[v] = true;
  
  var index = getIndex(v, graph);
  if (index >= 0) {
    for(var neighbour = 1; neighbour < graph[index].length -1; neighbour++)
    { 
      if (!visited[graph[index][neighbour]]) {
        if (isCyclicUtil(neighbour, visited, recStack, graph)){ 
          return true;
        } else if (recStack[v] == true) {
          return true
        }
      }
    }
  }
  recStack[v] = false;
  return false;
}

function isCyclic(graph){
  //console.log("checking for cycle", graph);
  var visited = {}; // list of visited nodes
  var recStack = {};
  for (var n = 0; n < graph.length -1;n++)
  {
    if(!visited[graph[n][0]]){
      if (isCyclicUtil(graph[n][0],visited,recStack, graph)){
        return true
      }
    }
  }
  return false
}
  function cycleFilter (edges){
    var graph = []; // create an adjacency list of narrators indices graph
    var data = []; // to be returned as polished data
    for(var e = 0; e < edges.length -1; e++){
      // for each edge, add to graph, check if it creates a cycle
      var source = edges[e][0];
      var target = edges[e][1];
      var weight = edges[e][2];
      var index = getIndex(source, graph);
      if (index >= 0) {
        graph[index].push(target[0]);
      }
      else {
        graph.push([source[0],target[0]]);
      }
      if (isCyclic(graph)) {
        graph[index].pop(); //remove point as it creates a cycle
      }
      else {
        data.push([source[0] + " " +source[1].slice(0,20),target[0] + " " + target[1].slice(0,20), weight]);
      }
    }
      return data;
  }
     
function process(hadithData, narratorsData){

  document.getElementById("btnMessage").innerHTML = "Start Processing...";
  //console.log("narrators:", narratorsData);
  
  var tempData = []; // get lables, sort and remove cycles at the end
  for(var i = 1; i < 500 ;i++)
  {
    var chain = hadithData[i][6].split(", "); // list of chain of narrators in the sanad(index 6)
    if(chain.includes(input)){ // hadith has the Rawi(input)
      for(var n = 0; n < chain.length -1;n++)
      {
        var student = lookupNarrator(chain[n]); //get student details
        // TODO: optimize perfomance
        var teacher = lookupNarrator(chain[n+1]); //get teacher details
        if(!student) {
          // student is missing from the dataset
          //console.log("narrator is missing", chain[n]);
        } else if (!teacher) {
          // teacher is missing from the dataset
          //console.log("narrator is missing", chain[n+1]);
        }
        else{
          //confirm the chain of narration
          // this solves the case of a narration that has multiple shifts
          // example: A -> B -> C, B -> D, C ->E, D ->E
          // issue rises when processing C,B as C -> B
          var teachers = student[10]; // get list of student teachers
          var students = teacher[11]; // get list of teacher students
          if (teachers.includes(chain[n+1]) || students.includes(chain[n])) { 
            // if one of them is in the data
            updateCount(tempData, student, teacher);
          }
          else {
            //console.log("student teacher relation is missing", chain[n], chain[n+1]);
          }
        }
      }
    }
  }
  // sort data in decending order of importance
  tempData.sort(function(a, b) {
  return b[2] - a[2];
});
  
  document.getElementById("btnMessage").innerHTML = "Done Processing!";
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'From');
  data.addColumn('string', 'To');
  data.addColumn('number', 'Weight');
  //filter cycles and only select to numNarrators and add lables
  var filtered = cycleFilter(tempData);
  
  setTimeout(enableButton, 100);
  
  document.getElementById("btnMessage").innerHTML = "Total of links:" + filtered.length;
  data.addRows(filtered.slice(0,numNarrators));
  google.charts.setOnLoadCallback(drawChart(data));
}
