jQuery.extend( jQuery.fn.dataTableExt.oSort, {
    "date-euro-pre": function ( a ) {
        s = a.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, "$2/$1/$3");
        return new Date(s).getTime();
    },
  
    "date-euro-desc": function ( a, b ) {
        return a > b;
    },
  
    "date-euro-asc": function ( a, b ) {
        return b > a;
    }
} );