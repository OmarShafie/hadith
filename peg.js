// Simple Arithmetics Grammar
// ==========================
//
// Accepts expressions like "2 * (3 + 4)" and computes their value.
Start = Query //input:Isnad eq: _"=="_ pattern:Query { return input==pattern;}

Query = head:Expression tail:(("^" / "&" / "|") Expression)*{
      return tail.reduce(function(result, element) {
        if (element[1] === "^") { return result? !element[3]: element[3]}
        if (element[1] === "&") { return result && element[3]; }
        if (element[1] === "|") { return result || element[3]; }
      }, head);
    } 

Expression = ex:(Isnad / Factor) {return ex;}

Factor
  = "(" q:Query ")" { return q; }
  /  "!(" _ q:Query _ ")" { return !q; }
  
Isnad = list:Rawi+ {
	return list}

Rawi = head:"@" id:Integer {return id; } 

Integer "integer"
  = _ [0-9]+ { return parseInt(text()); }

_ "whitespace"
  = [ \t\n\r]*