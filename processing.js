// Source: Kaggle Hadith Data Set  
var URL = "https://raw.githubusercontent.com/OmarShafie/VizHadith/master/"
var hadithURL = URL+"all_hadiths_clean.csv";
var narratorsURL = URL+"all_rawis.csv";

//TODO: Take input from user
var input ="11013";

//Parse Parameters
var inputType = "remote";
var stepped = 0, rowCount = 0, errorCount = 0, firstError;
var start, end;
var firstRun = true;
var maxUnparseLength = 10000;

$(function()
  {
  // Demo invoked
  $('#submit').click(function()
                     {
    if ($(this).prop('disabled') == "true")
      return;

    stepped = 0;
    rowCount = 0;
    errorCount = 0;
    firstError = undefined;

    var config = buildConfig();

    // Allow only one parse at a time
    $(this).prop('disabled', true);

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
          console.log("Parsing file...", file);
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
        console.log("Running...");
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

  console.log("Parsed Narrators...");
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

  // icky hack
  setTimeout(enableButton, 100);
}

function completeFn(results)
{ 
  console.log("Parsed Hadiths...");
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
}

function now()
{
  return typeof window.performance !== 'undefined'
    ? window.performance.now()
  : 0;
}
/*-------------- Main Code -------------*/
function lookupNarrator(index){
  return narratorsData.find(function(element) {
    return element[0] == index;
  });
}

function isCyclicUtil(v, visited, recStack, graph){
  visited[v] = true;
  recStack[v] = true;
  var index = -1;
  for(var j = 0; j < graph.length-1; j++){
    if (graph[j][0] == v) {
      index = j;
    }
  }
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

function isCyclic(data, graph){
  //console.log("checking for cycle", graph);
  var visited = {};
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
function updateCount(data, source, target, graph){
  var found = false;
  var i = 0; 

  while(!found && i < data.length){
    if(data[i][0] == source && data[i][1] == target){
      found = true;
      data[i][2]++;
    }
    i++;
  }
  if (!found){
    //Avoid a cycle
    data.push([source, target, 1]);
    var index = -1;
    for(var j = 0; j < graph.length-1; j++){
      if (graph[j][0] == source) {
        index = j;
      }
    }
    if (index >=0 && graph[index].length > 1) {
      graph[index].push(target);
    }
    else {
      //console.log("graph adds",source);
      graph.push([source, target]);
    }
    if (isCyclic(data, graph)) {
      data.pop();

      for(var j = 0; j < graph.length-1; j++){
      if (graph[j][0] == source) {
        index = j;
      }
    }
      //console.log("graph adds",source);
      graph[index].pop();
      //console.log("cycle avoided from",source, target)
    }
  }
  return graph;
}
function process(hadithData, narratorsData){

  console.log("Start Processing...");
  console.log("narrators:", narratorsData);
  
  var graph = [];
  
  var tempData = [];
  for(var i = 1; i < hadithData.length-1 ;i++)
  {
    if(hadithData[i][6].includes(input)){
      var chain = hadithData[i][6].split(", ");
      for(var n = 0; n < chain.length -1;n++)
      {
        var student = lookupNarrator(chain[n]);
        var teacher = lookupNarrator(chain[n+1]);
        if(!student) {

          console.log("narrator is missing", chain[n]);
        } else if (!teacher) {

          //console.log("narrator is missing", chain[n+1]);
        }
        else{
          var teachers = student[10];
          var students = teacher[11];
          if (teachers.includes(chain[n+1]) || students.includes(chain[n])) {
            graph = updateCount(tempData, student[1].slice(0,20), teacher[1].slice(0,20), graph);
          }
          else {
            //console.log("student teacher relation is missing", chain[n], chain[n+1]);
          }
        }
      }
    }
  }
  
  console.log("Done Processing...");
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'From');
  data.addColumn('string', 'To');
  data.addColumn('number', 'Weight');
  data.addRows(tempData);
  console.log(tempData);
  google.charts.setOnLoadCallback(drawChart(data));
}