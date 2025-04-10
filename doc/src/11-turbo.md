# v1.2.5: Trivially Copyable

_4 January 2025._ If _premature optimization_ is the root of all evil, we demonstrate in this version that _premature generalization_ is the root of inefficiency on the GPU.

While profiling Turbo, I identified `cuda::std::tuple` as a performance bottleneck.
The inefficiency stemmed from the `Interval` class, which was originally implemented using a `CartesianProduct` abstraction to represent intervals as a pair of lower and upper bounds.
The goal being to stay close to the mathematical definition of interval.
For generality, `CartesianProduct` supports an arbitrary number of lattice types, storing them internally in a tuple.
However, tuple is _not trivially copyable_.
This meant that every time an interval was transferred from the CPU to GPU (and vice-versa) the constructor of each element was invoked, incurring a significant overhead.

To address this, I refactored `Interval` to directly store the lower and upper bounds as members, eliminating the use of `CartesianProduct` and `tuple`.
As shown in the table below, this simple refactoring doubled the number of nodes explored per second, for the hybrid version with 128 blocks.

| Metrics | Normalized average [0,100] | Δ v1.2.4 | #best (_/16) | Average | Δ v1.2.4 | Median | Δ v1.2.4 |
|---------|----------------------------|----------|--------------|---------|----------|--------|----------|
| Nodes per second | 99.98 | +97% | 15 | 34154.16 | +56% | 17018.07 | +180% |
| Fixpoint iterations per second | 99.96 | +104% | 15 | 1102807.71 | +30% | 419951.32 | +192% |
| Fixpoint iterations per node | 99.82 | +4% | 6 | 42.51 | +5% | 25.34 | +11% |
| Propagators memory | 100.00 | 0% | 0 | 0.85MB | 0% | 0.42MB | 0% |
| Variables store memory | 100.00 | 0% | 0 | 402.75KB | 0% | 208.20KB | 0% |

Interestingly, the full GPU architecture (`-arch gpu`) benefits less from this optimization.

| Metrics | Normalized average [0,100] | Δ v1.2.4 | #best (_/16) | Average | Δ v1.2.4 | Median | Δ v1.2.4 |
|---------|----------------------------|----------|--------------|---------|----------|--------|----------|
| Nodes per second | 99.98 | +8% | 15 | 15135.09 | +5% | 6002.31 | +7% |
| Fixpoint iterations per second | 100.00 | +7% | 15 | 523632.56 | +2% | 151634.36 | +11% |
| Fixpoint iterations per node | 99.43 | -1% | 13 | 40.22 | -1% | 24.03 | 0% |
| Propagators memory | 100.00 | 0% | 0 | 1.03MB | 0% | 0.51MB | 0% |
| Variables store memory | 100.00 | 0% | 0 | 402.93KB | 0% | 208.39KB | 0% |

It indicates that non-trivial copy is particularly inefficient when transferring data between CPU and GPU.

On Helios (GH200), however, the difference between versions becomes negligible. This is likely due to the unified memory architecture of SM90, which reduces the impact of memory transfer costs.
