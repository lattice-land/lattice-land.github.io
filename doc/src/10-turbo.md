# v1.2.4: Ternary Normal Form

_27 December 2024_ During the hackathon with Nvidia, we profiled the code and found out that the representation of propagators was problematic.
Let's take an example with the constraint `x * x + y < 5` which is internally represented by the following AST:

<img src="turbo-v1.2/propagator_tree.png" alt="isolated" width="250"/>

Because the constraints can be of any arity and arbitrarily deep, we have no choice but to represent this tree with pointers and dynamic memory allocation.
In Turbo, we used [variant](https://en.cppreference.com/w/cpp/utility/variant) and [shared_ptr](https://en.cppreference.com/w/cpp/memory/shared_ptr) to represent propagators.
The propagators are executed using a switch statement of the following form:
```cpp
switch(term.index()) {
  case IVar:
  case IConstant:
  case INeg:
  case IAdd:
  case ISub:
  case IMul:
  // ...
```

In the profiling report, it is shown that `switch(term.index())` generates a lot of uncoalesced accesses.
Previously, we have reduced divergent branches by sorting propagators with the same shape (see [sorting propagators](https://lattice-land.github.io/6-turbo.html)).
But the main issue was the uncoalesced accesses to the propagators.

To solve this issue, we propose to decompose the problem into constraints that can be represented without pointers (fixed depth) and that are small (to enable coalesced memory load).
For this purpose, we introduce a new problem decomposition call the _ternary normal form_ (TNF) where all propagators are of the form `x = y <op> z` with `x,y,z` variables.
Furthermore, we take a minimal set of operators that includes the arithmetic operators `+,-,*,/,min,max` and two comparison operators `<=, =`.
All the other constraints are rewritten into those operators.
The constraint `x * x + y < z` in TNF is:
```
t1 = x * x
t2 = t1 * y
ONE = (t2 <= z)
```

Where `t1,t2,ONE` are new variables where `ONE` is initialized to `1`.
Note that the symbol `=` is relational, hence using `ONE = (t2 <= z)` forces the constraint on the right to be true.
This is called a "reified constraint" in the jargon of constraint programming, but in TNF it has the same representation as any other constraint.
TNF allows us to represent compactly a propagator using:
```cpp
struct bytecode_type {
  Sig op;
  AVar x;
  AVar y;
  AVar z;
};
```
`AVar` is an integer representing the index of the variable in the store and `Sig` is also an integer representing the operator.

## Problems in Ternary Normal Form

One obvious disadvantage of this approach is the increased number of temporary variables and constraints.
The increase in the number of constraints is relatively low and stable across problems (between 1x and 4x).
However, the increase in the number of variables ranges between 1x and 139x (on Wordpress).
We should investigate this in the future to reduce the number of generated variables.

| Problem | Data | #Vars | #Vars (TNF) | #Constraints | #Constraints (TNF) |
|----------|------|-------|-------------|--------------|--------------------|
| team-assignment | data3_5_31 | 15932.0 | 35445.0 (x2.22) | 25684.0 | 45197.0 (x1.76) |
| generalized-peacable-queens | n8_q3 | 2940.0 | 20186.0 (x6.87) | 8273.0 | 25519.0 (x3.08) |
| spot5 | 404 | 1112.0 | 22053.0 (x19.83) | 8124.0 | 29065.0 (x3.58) |
| nfc | 24_4_2 | 169.0 | 527.0 (x3.12) | 222.0 | 580.0 (x2.61) |
| blocks-world | 16-4-5 | 49447.0 | 109068.0 (x2.21) | 73421.0 | 133042.0 (x1.81) |
| triangular | n39 | 3863.0 | 207966.0 (x53.84) | 105136.0 | 309239.0 (x2.94) |
| accap | accap_a4_f30_t15 | 530.0 | 2319.0 (x4.38) | 993.0 | 2782.0 (x2.80) |
| tower | 100_100_20_100-04 | 12547.0 | 38559.0 (x3.07) | 23257.0 | 49269.0 (x2.12) |
| roster-sickness | small-4 | 4980.0 | 7978.0 (x1.60) | 6067.0 | 9116.0 (x1.50) |
| accap | accap_a40_f800_t180 | 28494.0 | 147451.0 (x5.17) | 58616.0 | 177573.0 (x3.03) |
| diameterc-mst | c_v20_a190_d4 | 3045.0 | 7336.0 (x2.41) | 6962.0 | 11253.0 (x1.62) |
| triangular | n10 | 267.0 | 1370.0 (x5.13) | 765.0 | 1868.0 (x2.44) |
| wordpress | Wordpress7_Offers500 | 667.0 | 92695.0 (x138.97) | 30893.0 | 122921.0 (x3.98) |
| roster-sickness | large-2 | 22952.0 | 29840.0 (x1.30) | 25693.0 | 32653.0 (x1.27) |
| stripboard | common-emitter-simple | 2123.0 | 14581.0 (x6.87) | 4563.0 | 17093.0 (x3.75) |
| gfd-schedule | n55f2d50m30k3_10124 | 32604.0 | 67749.0 (x2.08) | 54575.0 | 89720.0 (x1.64) |

## Benchmarks

The following table compares hybrid v1.2.3 and hybrid v1.2.4, both with 128 blocks.

| Metrics | Normalized average [0,100] | Δ v1.2.3 | #best (_/16) | Average | Δ v1.2.3 | Median | Δ v1.2.3 |
|---------|----------------------------|----------|--------------|---------|----------|--------|----------|
| Nodes per second | 83.75 | +29% | 11 | 21808.77 | +18% | 6061.18 | +48% |
| Fixpoint iterations per second | 100.00 | +254% | 16 | 845483.88 | +553% | 143327.93 | +193% |
| Fixpoint iterations per node | 100.00 | +187% | 0 | 40.45 | +138% | 22.76 | +148% |
| Propagators memory | 19.91 | -80% | 15 | 0.85MB | -90% | 0.42MB | -89% |
| Variables store memory | 100.00 | +656% | 0 | 402.75KB | +718% | 208.20KB | +1844% |

Let us analyze the speedup of this new version v1.2.4.
The number of fixpoint iterations per second has increased by 254% which is a very large gain.
However, the increase in nodes per second is only 29%, also only on 11/16 problems.
There are two reasons behind this mismatch:

1. The convergence of the fixpoint loop is two times slower than in v1.2.3, probably due to the fact we did not sort the TNF propagators properly.
On all 16 problems, the new version always needs more iterations to converge than in v1.2.3.
2. The increase in variables leads to fewer problem being stored in shared memory: only 3/16 in comparison to 11/16 before.

The first point is somewhat compensated by the number of fixpoint iteration per second which almost double.
It shows the effectiveness of the TNF for GPU architecture.
Perhaps more surprisingly, the memory footprint of the propagators is much lower than in v1.2.3, with an average decrease of 80%.
Although we have more propagators, each one takes only 16 bytes whereas, in the propagator representation of v1.2.3 we had the overhead of the shared pointer and variant data structures.

As for the full GPU version, we notice a similar behavior (we compare against full GPU v1.2.0 because v1.2.{1-3} were only improvement on the hybrid version):

| Metrics | Normalized average [0,100] | Δ v1.2.0 | #best (_/16) | Average | Δ v1.2.0 | Median | Δ v1.2.0 |
|---------|----------------------------|----------|--------------|---------|----------|--------|----------|
| Nodes per second | 89.02 | +28% | 12 | 14467.35 | +24% | 5583.57 | +50% |
| Fixpoint iterations per second | 100.00 | +315% | 16 | 510492.99 | +586% | 136773.93 | +238% |
| Fixpoint iterations per node | 100.00 | +203% | 0 | 40.47 | +167% | 24.07 | +162% |
| Propagators memory | 19.91 | -80% | 15 | 1.03MB | -90% | 0.51MB | -89% |
| Variables store memory | 100.00 | +630% | 0 | 402.93KB | +715% | 208.39KB | +1813% |

## Profiling

The hackathon reminded me that we should always guide the next improvement according to what the profiler says.
Obviously, it is a known principle but so easy to forget...

I equipped the code with new
