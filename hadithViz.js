// Source: Kaggle Hadith Data Set  
var URL = "https://raw.githubusercontent.com/OmarShafie/VizHadith/master/"
var hadithURL = URL+"all_hadiths_clean.csv";
var narratorsURL = URL+"all_rawis.csv";

//TODO: Take input from user
var input = "";

//Parse Parameters
var inputType = "remote";
var stepped = 0, rowCount = 0, errorCount = 0, firstError;
var start, end;
var firstRun = true;
var maxUnparseLength = 10000;

var isParsingDone = false;
var parsedData;
var HadithArr = [];

$(function()
  {
  // Demo invoked
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
      input = document.getElementById("input").value;
      if (input == ""){
        input = "إنما الأعمال بالنيات";
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
  enableButton()
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

function lookupNarrator(scholar_index){
  //returns data of the narrator with index from the narratorsData
  var found = narratorsData.find(function(element) {
    return element[0] == scholar_index;
  });
  if (!found){
    // else create a narrator data
    found = [scholar_index, scholar_index];
  }
  return found
}

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
  //console.log("visiting", v, visited);
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
      //console.log("removing link as it creates a cycle", [source[0],target[0]])
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

function getTeachers(narrator){
  if (narrator.length == 25){
    return narrator[16].split(", ");
  }
  return [];
} 

function getStudents(narrator){
  if (narrator.length == 25){
    return narrator[15].split(", ");
  }
  return [];
} 

function now() {
        return new Date().getTime();
    }

function query(text){
   // hadith has the Rawi(input)
  return text.includes(input);
}

function process(array, callback){
  document.getElementById("btnMessage").innerHTML = "Start Processing...";
  var startTime = now();
  var tempData = []; //to be passed to after process
  var chunk = 300;
  var i = 1;
  var counter = 0;
  function loop() {
    var cnt = chunk;
    while (cnt-- && i < array.length-1) {
      var hadithId = i;
      var markedHadith = false;
      var chain = array[i][6].split(", "); // list of chain of narrators in the sanad(index 6)
      if(query(array[i][7])){
        //add source book
        updateCount(tempData, array[i][2], chain[0], hadithId);

        for(var n = 0; n < chain.length -1;n++) {
          var student = lookupNarrator(chain[n]); //get student details
          // TODO: optimize perfomance
          var teacher = lookupNarrator(chain[n+1]); //get teacher details
          if(student.length == 2) {
            // student is missing from the dataset
            //console.log("narrator is missing", chain[n]);
          } else if (teacher.length == 2) {
            // teacher is missing from the dataset
            //console.log("narrator is missing", chain[n+1]);
          }
          else{
            //confirm the chain of narration
            // this solves the case of a narration that has multiple shifts
            // example: A -> B -> C, B -> D, C ->E, D ->E
            // issue rises when processing C,B as C -> B
            var teachers = getTeachers(student); // get list of student teachers
            var students = getStudents(teacher); // get list of teacher students
            if (teachers.includes(chain[n+1]) || students.includes(chain[n]) || teachers.length == 0 || students.length == 0) { 
              // if one of them is in the data
              updateCount(tempData, chain[n], chain[n+1], hadithId);
            }
            else
            {
              if (!markedHadith) {
                counter++;
                markedHadith = true;
                console.log(counter, "....", "Hadith, Rawi: ",i,student[0]);
              }
            }
            
          }
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

  // sort data in decending order of importance
  temp.sort(function(a, b) {
    return b[2] - a[2];
    });
  
  //filter cycles and add lables
  var graph = cycleFilter(temp); // graph = [..., [[key, Sum(w[1],w[2] ...w[m])], [n1,w[1]], [n2,w[2]], ..., [nm,w[m]] [h1,h2...] ], ...]
  graph.sort(function(a, b) {
    return b[0][1] - a[0][1];
    });

  document.getElementById("btnMessage").innerHTML += "    Total of Narrators: " + graph.length;
  var ready_data = [];
  //graph = graph.slice(0, numNarrators);


  var names = [];
  for (var i = 0; i < graph.length; i++){
    var node = graph[i];
    var narrator = lookupNarrator(node[0][0]);
    var name = narrator = narrator[0]+" "+narrator[1].slice(0,20);
    names.push(name);
  }

  for (var i = 0; i < graph.length; i++){
    var node = graph[i];
    var nodeInd = getIndex(node[0][0], graph);
    for (var j = 1; j < node.length; j++){
      var index = getIndex(node[j][0], graph);
      if (index >= 0) {
        var tooltip = '<div class="hadithTooltip" ><table><thead><tr>';
        tooltip += '<th>'+names[nodeInd]+"---"+node[j][2].length+"--->"+names[index]+'</th>';
        tooltip += '<th>Id</th>';
        tooltip += '<th>Chain</th>';
        tooltip += '<th>Book</th>';
        tooltip += '</tr></thead><tbody>';
        for(var h = 0; h < node[j][2].length; h++){
          var hadith = HadithArr[(node[j][2][h])];
          tooltip += "<tr><td>";
          tooltip += hadith[7];
          tooltip += "</td>";

          tooltip += "<td>";
          tooltip += hadith[4];
          tooltip += "</td>";

          tooltip += "<td>";
          tooltip += hadith[6];
          tooltip += "</td>";

          tooltip += "<td>";
          tooltip += hadith[2];
          tooltip += "</td></tr>";

        }
        tooltip += "</tbody></table></div>";
        ready_data.push([names[nodeInd], names[index], node[j][1],tooltip]);
      }
    }
  }

  var data = new google.visualization.DataTable();
  data.addColumn('string', 'From');
  data.addColumn('string', 'To');
  data.addColumn('number', 'Weight');
  data.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});
  data.addRows(ready_data);

  google.charts.setOnLoadCallback(drawChart(data));
  enableButton();
}

function main(hadithData){

  HadithArr = hadithData;
  process(HadithArr, afterProcess);
}

window.onload = function (){ document.getElementById("submit").click();}