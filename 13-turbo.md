# v1.2.7: Preprocessing Again

_21 March 2025._ Ternary constraints significantly accelerate parallel propagation—often by an order of magnitude—thanks to their uniform representation. However, this comes with a trade-off: the number of variables and constraints increases significantly, in some cases by up to four orders of magnitude. To address this, I revisited preprocessing, inspired by recent and past work in the constraint programming community, especially:

* I. Araya et al., [ Exploiting Common Subexpressions in Numerical CSPs](https://doi.org/10.1007/978-3-540-85958-1_23), 2008, CP.
* P. Nightingale et al., [Automatically improving constraint models in Savile Row](https://doi.org/10.1016/j.artint.2017.07.001), 2017, Artificial Intelligence.

Thanks to the compact structure of ternary representations, implementing preprocessing algorithms becomes simpler and more efficient. The core optimization introduced in this version is the elimination of common subexpressions.

Given two ternary constraints `x = y <op> z` and `a = b <op'> c`, if the right-hand sides are syntactically identical (y = b, op = op', z = c), we can safely eliminate one of the constraints and introduce an equality `x = a` instead. This small transformation, repeated many times, has a large cumulative impact.

The full preprocessing algorithm will be described in an upcoming paper.

### Benchmark Results (A5000)

| Metrics | Normalized average [0,100] | Δ v1.2.6 | #best (_/16) | Average | Δ v1.2.6 | Median | Δ v1.2.6 |
|---------|----------------------------|----------|--------------|---------|----------|--------|----------|
| Nodes per second | 100.00 | +24% | 16 | 46886.52 | +18% | 28322.51 | +26% |
| Deductions per node | 61.01 | -39% | 16 | 812898.02 | -27% | 219665.79 | -31% |
| Fixpoint iterations per second | 90.60 | +4% | 8 | 443548.64 | -5% | 326175.74 | +21% |
| Fixpoint iterations per node | 82.93 | -17% | 16 | 14.99 | -12% | 10.23 | -13% |
| Propagators memory | 65.62 | -34% | 16 | 0.64MB | -25% | 0.25MB | -41% |
| Variables store memory | 61.68 | -38% | 16 | 288.38KB | -28% | 89.04KB | -57% |

Preprocessing in v1.2.7 improves overall solver performance by reducing redundancy at the constraint level. Notably:

* Nodes explored per second increased by 24%.
* Deductions per node dropped by 39%, which means the fixpoint engine converges faster.
* Propagator and variable memory footprints shrank by 34% and 38%, respectively.
* On six benchmarks, the reduced variable store now fits into shared memory (up from three in v1.2.6)

Currently, preprocessing is only applied to the ternarized model. A potential improvement would be to apply subexpression elimination (as in Nightingale et al.) to the original model before ternarization, opening new opportunities for optimization.
