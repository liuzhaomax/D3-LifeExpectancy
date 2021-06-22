// references: https://dracoblue.net/dev/linear-least-squares-in-javascript/

function findLineByLeastSquares(values_x, values_y) {
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    /*
     * We'll use those variables for faster read/write access.
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Nothing to do.
     */
    if (values_length === 0) {
        return [ [], [] ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }

    /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
    var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    var b = (sum_y/count) - (m*sum_x)/count;

    // /*
    //  * We will make the x and y result line now
    //  */
    // var result_values_x = [];
    // var result_values_y = [];
    //
    // for (var v = 0; v < values_length; v++) {
    //     x = values_x[v];
    //     y = x * m + b;
    //     result_values_x.push(x);
    //     result_values_y.push(y);
    // }

    return [m, b];
}

function leastSquaresequation(XaxisData, Yaxisdata) {
    var ReduceAddition = function(prev, cur) { return prev + cur; };

    // finding the mean of Xaxis and Yaxis data
    var xBar = XaxisData.reduce(ReduceAddition) * 1.0 / XaxisData.length;
    var yBar = Yaxisdata.reduce(ReduceAddition) * 1.0 / Yaxisdata.length;

    var SquareXX = XaxisData.map(function(d) { return Math.pow(d - xBar, 2); })
        .reduce(ReduceAddition);

    var ssYY = Yaxisdata.map(function(d) { return Math.pow(d - yBar, 2); })
        .reduce(ReduceAddition);

    var MeanDiffXY = XaxisData.map(function(d, i) { return (d - xBar) * (Yaxisdata[i] - yBar); })
        .reduce(ReduceAddition);

    var slope = MeanDiffXY / SquareXX;
    var intercept = yBar - (xBar * slope);

// returning regression function
//     return function(x){
//         return x*slope+intercept
//     }
    return [slope, intercept]

}


function linearRegression(y,x){

    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;

    for (var i = 0; i < y.length; i++) {

        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i]*y[i]);
        sum_xx += (x[i]*x[i]);
        sum_yy += (y[i]*y[i]);
    }

    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
    lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

    return lr;

}