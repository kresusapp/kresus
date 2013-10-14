jQuery.extend( jQuery.fn.dataTableExt.oSort, {
    "fr-number-pre": function ( a ) {
        s = a.replace(" ", "").replace(",", ".");
        return Number(s);
    },
  
    "fr-number-desc": function ( a, b ) {
        return Number(a) > Number(b);
    },
  
    "fr-number-asc": function ( a, b ) {
        return Number(b) > Number(a);
    }
} );