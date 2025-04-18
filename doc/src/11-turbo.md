# v1.2.5: Trivially Copyable

_4 January 2025._ If _premature optimization_ is the root of all evil, we show a case where _premature generalization_ is the root of inefficiency on the GPU.

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

### Helios (GH200 Superchip)

On Helios (GH200), however, the difference between these two versions becomes negligible.
This is likely due to the unified memory architecture of SM90, which reduces the impact of memory transfer costs.
The following table shows the difference with 264 blocks and hybrid architecture.

| Metrics | Normalized average [0,100] | Δ v1.2.4 | #best (_/16) | Average | Δ v1.2.4 | Median | Δ v1.2.4 |
|---------|----------------------------|----------|--------------|---------|----------|--------|----------|
| Nodes per second | 98.02 | 0% | 10 | 94111.37 | -3% | 32453.57 | 0% |
| Fixpoint iterations per second | 98.13 | 0% | 8 | 3175947.36 | -7% | 847653.49 | +2% |
| Fixpoint iterations per node | 99.69 | 0% | 10 | 43.71 | 0% | 25.15 | 0% |
| Propagators memory | 99.97 | 0% | 1 | 0.85MB | 0% | 0.42MB | 0% |
| Variables store memory | 99.97 | 0% | 1 | 402.75KB | 0% | 208.20KB | 0% |

It is interesting to compare the H100 to my desktop GPU A5000.
Since the A5000 has 64 SMs and H100 has 132 SMs, it should be at least twice as fast on H100.
The normalized average shows indeed an increase of +125%, which is a bit more than 2 times faster, but also due to the fact that the GH200 is equipped with a 72-cores CPU, while my desktop has only a 10-cores CPU.

| Metrics | Normalized average [0,100] | Δ A5000 | #best (_/16) | Average | Δ A5000 | Median | Δ A5000 |
|---------|----------------------------|----------|--------------|---------|----------|--------|----------|
| Nodes per second | 100.00 | +125% | 16 | 80590.15 | +312% | 24332.89 | +153% |
| Fixpoint iterations per second | 100.00 | +131% | 16 | 2591379.51 | +335% | 528451.52 | +76% |
| Fixpoint iterations per node | 98.59 | +2% | 7 | 43.04 | +4% | 26.03 | +2% |
