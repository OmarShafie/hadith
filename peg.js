Start
  = _ q: Query _ {
  var re = new RegExp(q, "g");
  //var input = processingSanad.toString();
  var input = [1, 5917, 2].toString(); return "{" + re + "}.'" + input + "' => " + re.test(input);
  return re.test(input);
}

Query
  = _ head: Expression _ tail: (TailQuery) * _{ return "(?=.*" + head + ")" + tail; }
// NOT "!(" neg:Query  ")"{ return "("+neg+")";} 

TailQuery
  = _ op: ("|") _ tail: Expression _ { return "|" + tail; }
/ _ op:("&") _ tail: Expression _ {return "(?=.*"+tail+")";}
// XOR

Expression
  = _ ex: (Isnad / Factor) _ { return ex; }

Factor
  = _ "(" _ q: Query _ ")" _ { return "(" + q + ")"; }

Isnad
  = _ "$" _ list: Rawi + _ "$" _ { return "(^)" + list.join() + "($)"; }
/ _ "$" _ list:Rawi+ _ {return "(^)"+list.join()+"(,|$)";}
  / _ list: (Rawi +) _ "$" _ { return "(^|,)" + list.join() + "($)"; }
/ _ list:Rawi+ _{return "(^|,)"+list.join()+"(,|$)"}

Rawi
  = _ head: "@" id: Integer _ tail: (ORRawi) * _ { return id + tail; }
/ _ "(" _ r:Rawi+ _ ")" _ tail:(ORRawi)* _ { return "("+r.join()+")" + tail; }
  / _ "*" _ tail: (ORRawi) * _ { return "[0-9]+" + tail; }
// Quantifier

Quantifier
  = "<" n: Integer ">"  r: Isnad { return "(" + r + "){" + n + "}"; }

ORRawi
  = _ op: "|" _ tail: Rawi _{ return "|" + tail; }

Integer "integer"
  = _[0 - 9] +
  { return text(); }

_ "whitespace"
  = [\t\n\r] *