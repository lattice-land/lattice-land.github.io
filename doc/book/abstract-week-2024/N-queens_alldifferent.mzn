include "alldifferent.mzn";

int: n=200;
array[1..n] of var 1..n: queens_alldiff;
constraint alldifferent(queens_alldiff);
constraint alldifferent([queens_alldiff[i]+i | i in 1..n]);
constraint alldifferent([queens_alldiff[i]-i | i in 1..n]);

solve satisfy;        