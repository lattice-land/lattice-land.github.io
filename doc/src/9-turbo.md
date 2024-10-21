# Open Hackathon

_17 October 2024_ We are participating in the [Poland Open Hackathon](https://www.openhackathons.org/s/siteevent/a0C5e000009W8MqEAK/se000307?p=4OVal7qBAY6%2FFLWHyETbkwh66SClhyelBl79%2FR1tID1ERZR9ly9oZEseBU%2B%2FQOAe%2B1PJ%2BAdY%2F%2F62bDJM0SlZYg%3D%3D).
This page will summarize our progresses and experience.
The hackathon is spread over 2 weeks starting by a meeting on 15 October to explain the GH200 architecture that equip the [Helios HPC](https://www.cyfronet.pl/en/19951,artykul,helios_supercomputer.html), how to connect and run jobs on it, and then discuss with our mentors.
Among the mentors, we are lucky to have an engineer from Nvidia working on [cuOpt](https://developer.nvidia.com/blog/record-breaking-nvidia-cuopt-algorithms-deliver-route-optimization-solutions-100x-faster/) and a new secret [linear programming solver](https://developer.nvidia.com/blog/accelerate-large-linear-programming-problems-with-nvidia-cuopt/).
During the meeting, I try to compile Turbo on the HPC and... boom, `nvcc` is killed by the memory manager because it is using too much memory.
I encountered a similar problem last year and reported the bug to Nvidia.
The bug is still opened, but by adding `__noinline__` attributes in key places, I could work around it and compile it.
It seems that for `sm_90` architectures, the compiler is again doing very aggressive optimizations, and Turbo is just too large for it.
By putting the full solver in a single kernel, we avoid the memory transfers between the CPU and GPU, but even when the code is compiling, the bottleneck is the high number of registers per thread and the size of the kernel.
The next meeting is on 22 October, for the whole day.
Without a code that is compiling, it is going to be hard to profile and optimize anything...
After a few days, I managed to develop a new hybrid algorithm where only the propagation loop is on the GPU, and the search is on the CPU.
It is now compiling fine on Helios.
This is the version 1.2.1 of Turbo, against which we will compare the progresses made during this Hackathon.

## Turbo v1.2.1: Hybrid Dive and Solve Algorithm

If you don't know the "propagate-and-search" algorithm of constraint programming, please watch [this video](http://hyc.io/videos/aaai2022.mp4) I made for a conference (thanks Covid), starting at 5'30''.
It also explains how this algorithm is executed on parallel on GPU.

We keep the same algorithm as full-GPU Turbo but only performs the propagation on the GPU.
The algorithm consists of two parts:

1. `dive(root, path)`: From the root of the search tree, commit to the path given to reach a node `subroot` at a fixed depth.
2. `solve(subroot)`: Solve the subproblem `subroot` by propagate and search.
3. When a subproblem has been completely explored, we take a new path to explore if any is left.

During the dive and solve operations, the propagation step is always executed on the GPU, by calling a kernel parametrized with a single block.

To execute this algorithm on multiple blocks, we create `N` CPU threads that will explore in parallel different `path` and solve different subproblems.
The file `https://github.com/ptal/turbo/blob/v1.2.1/include/hybrid_dive_and_solve.hpp` documents this algorithm in more detail.


... benchmarks result on Helios and on my desktop to compare to come...

## How to compile and run Turbo on Helios

First, download the project and its dependencies:

```
mkdir lattice-land
cd lattice-land
git clone git@github.com:NVIDIA/cccl.git
git clone git@github.com:xcsp3team/XCSP3-CPP-Parser.git
git clone git@github.com:ptal/cpp-peglib.git
git clone git@github.com:lattice-land/cuda-battery.git
git clone git@github.com:lattice-land/lala-core.git
git clone git@github.com:lattice-land/lattice-land.github.io.git
git clone git@github.com:lattice-land/lala-pc.git
git clone git@github.com:lattice-land/lala-power.git
git clone git@github.com:lattice-land/lala-parsing.git
git clone git@github.com:lattice-land/.github.git
git clone --recursive git@github.com:lattice-land/bench.git
git clone --recursive git@github.com:ptal/turbo.git
```

Next, go on the Helios branch of Turbo:

```
cd lattice-land/turbo
git checkout helios
```

To compile:

```
sbatch compile-helios.sh helios.sh
```

And to run on an example:

```
sbatch run-helios.sh helio.sh
```

