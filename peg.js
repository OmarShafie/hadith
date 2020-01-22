Start = Query

Query 
	= head:Expression tail:(ORQuery)*
    { 
      var re = new RegExp("("+head + tail+")","g");
      var input = [1,22,3].toString();
      return "{" + re + "}.'"+ input +"' => " +re.test(input);
    } 

ORQuery
	= op:("|") tail: Expression
    {return op + tail}

Expression = ex:(Isnad / Factor) {return ex;}

Factor
  = "(" q:Expression ")" { return "("+q+")"; }
  /  "!(" _ q:Expression _ ")" { return "!("+q+")"; }
  
Isnad = list:Rawi+ {return "(^|,)"+list.join()+"(,|$)";}

Rawi 
	= head:"@" id:Integer tail:(ORRawi)* {return "("+id + tail+")"; } 
    / "*" {return "[0-9]+";}

ORRawi
	= op:"|" tail:Rawi { return op + tail; }

Integer "integer"
  = [0-9]+ 
  { return parseInt(text()); }

_ "whitespace"
  = [ \t\n\r]*
