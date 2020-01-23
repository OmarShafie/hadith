Start 
	= q:Query {
      var re = new RegExp("("+q+")","g");
      //var input = processingSanad.toString();
      var input =[1,2,3,4,5,618].toString(); return "{" + re + "}.'"+ input +"' => " +re.test(input);
      return re.test(input); 
    } 

Query 
	= head:Expression tail:(TailQuery)* { return "(?=.*"+head +")"+ tail;} 
    // NOT "!(" neg:Query  ")"{ return "("+neg+")";} 

TailQuery
	= op:("|") tail: Expression {return op + tail}
	/ op:("&") tail: Expression {return "(?=.*"+tail+")"}
    // XOR

Expression 
	= ex:(Isnad / Factor) {return ex;}

Factor
  = "(" q:Query ")" { return q; }
  
Isnad 
	= "$" list:Rawi+ "$" {return "(^)"+list.join()+"($)";}
    / "$" list:Rawi+ {return "(^)"+list.join()+"(,|$)";}
    / list:(Rawi+) "$" {return "(^|,)"+list.join()+"($)";}
    / list:Rawi+ {return "(^|,)"+list.join()+"(,|$)"}
    
Rawi 
	= head:"@" id:Integer tail:(ORRawi)* {return "("+id + tail+")"; } 
    / "(" r:Rawi ")" { return r; }
    / "*" {return "[0-9]+";}
    // Quantifier
    
Quantifier
	= "<" n:Integer ">"  r:Isnad { return "("+r+"){"+n+"}";}
    
ORRawi
	= op:"|" tail:Rawi { return op + tail; }
Integer "integer"
  = [0-9]+ 
  { return text(); }

_ "whitespace"
  = [ \t\n\r]*