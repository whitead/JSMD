// by Sean McCullough (banksean@gmail.com)
// 25.December 2007
//adapted to match wikipedia, cuz it was wrong in the first place. 

/** 
 * Javascript implementation of the Box-Muller transform.
 * http://en.wikipedia.org/wiki/Box-Muller_transform
 * The zigurat algorithm is more efficient, but this is
 * easier to implement. This particular implementation is a 
 * version of http://www.dreamincode.net/code/snippet1446.htm
 * @constructor 
 * @param {Number} sigma The standard-deviation of the distribution
 * @param {Number} mu The center of the distribution
 */


function NormalDistribution(sigma, mu, seed) {
	return new Object({
	    sigma: sigma,
	    mu: mu,
	    y1: 0,
	    y2: 0,
	    use_last: 0,
	    seed: seed || 1,
	    random: function() {
		var x = Math.sin(this.seed++) * 10000;
		return x - Math.floor(x);
	    },
	    sample: function() {
		var x1, x2, w;
		if (this.use_last) {		    
		    this.y1 = this.y2;
		    this.use_last = 0;
		} else {
		    do {
			x1 = 2.0 * this.random() - 1.0
			x2 = 2.0 * this.random() - 1.0
			w = x1 * x1 + x2 * x2
		    }while(w >= 1.0);

		    w = Math.sqrt( -2.0 * Math.log( w )  / w);
		    this.y1 = x1 * w;
		    this.y2 = x2 * w;			    
		    this.use_last = 1;
		}
		return this.mu + this.sigma * this.y1;
	    },
	    sampleInt : function() {
		return Math.round(this.sample());
	    }
	});
}

// conveneience function, works on bounds instead of sigma, mu.
// also unemcumbered by maintaining a stored deviate.  This makes it
// much less effiecient than the NormalDistribution class, but maybe
// easier to use.
// WARNING: this probably doesn't work with negative numbers.

function generateNormallyDistributedRandomVar(min, max) {
	var mu = (max+min)/2;
	var sigma = mu/2;
	var res = min - 1;
	while (res > max || res < min) {
		var dist = Math.sqrt(-1 * Math.log(Math.random()));
		var angle = 2 * Math.PI * Math.random();
		res = dist*Math.sin(angle) * sigma + mu;
	}
	
	return res;		
}

// convenience extension to Array so you can sample indexes on this distribution
Array.prototype.sampleIndex = function() {
	//if the array size has changed, we need to update the distribution object
	if (this.lastLength !== this.length) {
		this.samplingDistribution = new NormalDistribution((this.length/6), (this.length/2)-1);
		this.lastLength = this.length;
	}
	return this.samplingDistribution.sampleInt();
}
