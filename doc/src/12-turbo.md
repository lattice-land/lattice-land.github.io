# v1.2.6: Warp-centric Fixpoint

_22 January 2025._ Version 1.2.6 introduces a warp-centric fixpoint engine designed to better leverage GPU architecture and improve propagation efficiency.

The previous fixpoint engine followed a straightforward scheduling strategy: with 256 threads and an array of propagators [p1, p2, ..., pN], each thread executes propagators spaced 256 apart—thread 1 handles p1, then p257, then p513, and so on. After processing its assigned propagators, each thread hits a barrier and waits for all others to complete before continuing the loop. The process terminates once no propagator changed the domain of any variable.

This strategy corresponds to the AC1 algorithm, first introduced by Mackworth in his 1977 paper _Consistency in Networks of Relations_. While AC1 is correct, it often performs redundant work—many scheduled propagators have no effect on variable domains, leading to inefficiencies.

### Introducing Warp-Centric Propagation

In v1.2.6, we propose a new fixpoint algorithm tailored to GPU architectures: the warp-centric AC1 fixpoint (WAC1). The key insight is that propagators grouped within a warp often share variables. This grouping is not intentional but emerges from how constraint models are written and how constraints are decomposed in ternary form.

WAC1 takes advantage of this spatial locality by allowing each warp to compute a local fixpoint across its 32 propagators before proceeding. Algorithmically, this approach reduces the number of propagator calls. On the hardware side, it reuses bytecode already loaded into cache and registers, improving execution efficiency.

To benchmark this improvement, we use version 1.2.8 and simulate the older versions:

* v1.2.5 ≈ v1.2.8 with `-disable_simplify -arch hybrid -fp ac1`
* v1.2.6 ≈ v1.2.8 with `-disable_simplify -arch hybrid -fp wac1`

Both configurations use `-or 128 -sub 15`.
We get a few bug fixes and a new statistics presented below.

### Benchmark Results (A5000)

| Metrics | Normalized average [0,100] | Δ v1.2.5 | #best (_/16) | Average | Δ v1.2.5 | Median | Δ v1.2.5 |
|---------|----------------------------|----------|--------------|---------|----------|--------|----------|
| Nodes per second | 98.78 | +19% | 12 | 39881.91 | +5% | 22466.70 | +26% |
| Deductions per node | 68.26 | -31% | 14 | 1117197.24 | -57% | 319343.77 | -32% |
| Fixpoint iterations per second | 65.62 | -34% | 1 | 465136.92 | -49% | 270480.10 | -41% |
| Fixpoint iterations per node | 51.90 | -48% | 16 | 17.07 | -58% | 11.71 | -51% |
| Propagators memory | 100.00 | 0% | 0 | 0.86MB | 0% | 0.42MB | 0% |
| Variables store memory | 100.00 | 0% | 0 | 403.25KB | 0% | 208.95KB | 0% |

With AC1, the average number of fixpoint iterations per node is around 40.
WAC1 cuts this down to just 17 iterations per node.
However, since each WAC1 iteration involves more work—reaching a local fixpoint within a warp—raw iteration counts are not directly comparable.
To better evaluate this, we introduce a new metric: _deductions per node_, representing the number of propagator calls per node. WAC1 reduces deductions by 31%, indicating faster convergence to a fixpoint. This leads to a 19% improvement in normalized nodes explored per second, demonstrating clear performance benefits.

### Performance on H100

The H100 GPU shows a similar trend. Note that these benchmarks used the actual v1.2.5 and v1.2.6 versions, so the deductions per node metric was not available. Both experiments ran with `-or 264 -sub 12 -arch hybrid`.

| Metrics | Normalized average [0,100] | Δ v1.2.5 | #best (_/16) | Average | Δ v1.2.5 | Median | Δ v1.2.5 |
|---------|----------------------------|----------|--------------|---------|----------|--------|----------|
| Nodes per second | 98.54 | +28% | 13 | 96386.82 | +2% | 46832.15 | +44% |
| Fixpoint iterations per second | 62.08 | -38% | 0 | 1438501.41 | -55% | 551572.85 | -35% |
| Fixpoint iterations per node | 47.11 | -53% | 16 | 17.11 | -61% | 12.46 | -50% |


### Conclusion

The new warp-centric fixpoint algorithm (WAC1) reduces redundant propagation work and better utilizes GPU hardware capabilities. With up to 31% fewer deductions per node and 19–28% faster node exploration, WAC1 represents a substantial improvement over the traditional AC1 approach.
Furthermore, it highlights the importance of fixpoint engines on performance, and we could consider further improving the fixpoint engine in future work.