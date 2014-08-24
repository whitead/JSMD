function prepend_emit(array, element) {
    var copy = array.slice(0);
    copy.unshift(element)
    return copy;
}

/*  given the sizes in each dimension (sim), fxn will be called
*  on every possible dim-tuple. 
*
*/
function enumerate_grid(fxn, dim, sizes, indices) {
    if(typeof indices === 'undefined') {
	indices = [];
    }
    while(dim >= sizes.length) {
	dim -= 1;
    }
    for(var i = 0; i < sizes[dim]; i++) {
	if(dim > 0) {
	    enumerate_grid(fxn, dim - 1, sizes, prepend_emit(indices, i));
	} else {
	    fxn(prepend_emit(indices,i));
	}
    }
}

function square_lattice(counts, spacing, offset) {
    var result = [];
    var tmp;
    if(typeof spacing === "number") {
	tmp = spacing;
	spacing = [];
	counts.forEach(function() {spacing.push(tmp) });
    }
    if(typeof offset === "number") {
	tmp = offset;
	offset = [];
	counts.forEach(function() {offset.push(tmp) });
    }

    enumerate_grid(function(tuple) {
	tuple.forEach(function() {
	    var pos = []
	    for(var i = 0; i < counts.length; i++) {
		pos.push(tuple[i] * spacing[i] + offset[i]);
	    }
	    console.log(pos)
	    result.push(pos);
	    
	});
    }, counts.length, counts);
    return result;
}

	
