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
      else {
        numNarrators = parseInt(numNarrators)
      }
    if (!firstRun){
      console.log("--------------------------------------------------");
    }
    else {
      firstRun = false;
    }
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
  document.getElementById("submit").innerHTML = "Submit";
}

function now()
{
  return typeof window.performance !== 'undefined'
    ? window.performance.now()
  : 0;
}
/*-------------- Main Code -------------*/
function getNarratorGrade(tag){
  var narrator_index = tag.split(" ")[0];
  var narrator = lookupNarrator(narrator_index);
  if (narrator.length === 25) {
    return narrator[12];
  }
  return "NA";
}

function gradeToColor(grade){
  console.log(grade);
  var mapping = {
    1 : "darkgreen",
    2 : "seagreen",
    3 : "mediumseagreen",
    4 : "mediumseagreen",
    5 : "springgreen",
    6 : "lime",
    7 : "greenyellow",
    8 : "yellow",
    9 : "gold",
    10: "coral",
    11: "lightcoral",
    12: "salmon",
    13: "red",
    14: "crimson",
    15: "maroon",
    16: "silver",
    17: "lightslategray",
    18: "darkslategray",
  };
  if (grade.includes("صحابي") || grade.includes("صحابة") || grade.includes("صحبة")){
    return mapping[1];
  }
  else if (grade.includes("أوثق")){
    return mapping[2];
  }
  else if (grade.includes("Narrator[Grade:Thiqah Thiqah]") || grade.includes("ثبت")  || grade.includes("حافظ") || grade.includes("ثقة ثقة")){
    return mapping[3];
  }
  else if (grade.includes("Narrator[Grade:No Doubt]")  || grade.includes("البخاري")  || grade.includes("مسلم")){
    return mapping[4];
  }
  else if (grade.includes("Narrator[Grade:Thiqah]") || grade.includes("ثقة")){
    return mapping[5];
  }
  else if (grade.includes("Narrator[4") || grade.includes("الأربعة") || grade.includes("الستة")){
    return mapping[6];
  }
  else if (grade.includes("Narrator[Grade:Sadooq]") || grade.includes("صدوق")  ){
    return mapping[7];
  }
  else if (grade.includes("Narrator[Grade:Sadooq/Delusion]")){
    return mapping[8];
  }
  else if (grade.includes("Narrator[Grade:Maqbool]")  || grade.includes("مقبول")){
    return mapping[9];
  }
  else if (grade.includes("لين")){
    return mapping[10];
  }
  else if (grade.includes("Narrator[Grade:Not Thiqah]") || grade.includes("Narrator[Grade:Unknown-Majhool]") || grade.includes("مجهول") || grade.includes("مستور")){
    return mapping[11];
  }
  else if (grade.includes("Narrator[Grade:Undefined]")){
    return mapping[12];
  }
  else if (grade.includes("Narrator[Grade:Abandoned]") || grade.includes("متروك") || grade.includes("منكر")){
    return mapping[13];
  }
  else if (grade.includes("Narrator[Grade:Weak]") || grade.includes("ضعيف")){
    return mapping[14];
  }
  else if (grade.includes("Narrator[Grade:Liar]") || grade.includes("كذب")){
    return mapping[15];
  }
  else if (grade.includes("Narrator")){
    return mapping[16];
  }
  else if (grade.includes("NA")){
    return mapping[17];
  }
  else{
    return mapping[18];
  }
}
function lookupNarrator(index){
  //returns data of the narrator with index from the narratorsData
  var found = narratorsData.find(function(element) {
    return element[0] == index;
  });
  if (!found){
    // else create a narrator data
    found = [index,index]
  }
  return found
}

function updateCount(data, source, target){
  // updates the count for [source, target, count] in data
  var found = false;
  var i = 0; 
  //TODO: Optimize this
  while(!found && i < data.length){
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
    // returns the index of key in the graph
    // graph = [..., [key, n1, n2 ...], ...]
    for(var i = 0; i < graph.length; i++){
      var vertix = graph[i][0];
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
      if (!visited[node[neighbour]]) {
        if (isCyclicUtil(node[neighbour], visited, recStack, graph)){
          return true;
        }
      } else if (recStack[node[neighbour]] == true) {
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
      if (isCyclicUtil(graph[n][0],visited,recStack, graph)){
        return true
      }
    }
  }
  return false;
}

function cycleFilter (edges){
  // edges = [..., [source, target, weight], ...]
  var graph = []; // create an adjacency list of narrators indices graph
  var data = []; // to be returned as polished data
  for(var e = 0; e < edges.length; e++){
    // for each edge, add to graph, check if it creates a cycle
    var source = edges[e][0];
    var target = edges[e][1];
    var weight = edges[e][2];
    var index = getIndex(source[0], graph);
    if (index >= 0) {
      graph[index].push(target[0]);
    }
    else {
      index = graph.length;
      graph.push([source[0],target[0]]);
    }
    if (isCyclic(graph)) {
      console.log("removing link as it creates a cycle", [source[0],target[0]])
      graph[index].pop(); //remove point as it creates a cycle
    }
    else {
      data.push([source[0] + " " +source[1].slice(0,20),target[0] + " " + target[1].slice(0,20), weight]);
    }
  }
    return data;
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

function process(hadithData, narratorsData){

  console.log("Start Processing...");
  
  var tempData = []; // get lables, sort and remove cycles at the end
  //for(var i = 1; i < 500; i++){
  for(var i = 1; i < hadithData.length -1; i++){
    var chain = hadithData[i][6].split(", "); // list of chain of narrators in the sanad(index 6)
    if(chain.includes(input)){ // hadith has the Rawi(input)
      if (lookupNarrator(chain[0])) {
        updateCount(tempData, [hadithData[i][2],hadithData[i][2]], lookupNarrator(chain[0]));
      }
      for(var n = 0; n < chain.length -1;n++)
      {
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
            updateCount(tempData, student, teacher);
          }
        }
      }
    }
  }
  // sort data in decending order of importance
  tempData.sort(function(a, b) {
  return b[2] - a[2];
});
  
  console.log("Done Processing!");
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
