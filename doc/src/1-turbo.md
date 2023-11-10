# Turbo

(For a concise introduction to GPU programming, you can check out my [tutorial](https://ulhpc-tutorials.readthedocs.io/en/latest/gpu/cuda2023/) and go through the slides; it is especially useful to know the CUDA vocabulary).

*30 August 2023.* Turbo is a constraint solver running entirely on the GPU with an architecture based on abstract domains.
Intuitively, due to their complex architecture and dynamic data structures, constraint solvers seem to be a poor match for GPUs.
Moreover, over the years, new solving techniques have been primarily developed within a sequential mindset, without consideration for parallel execution.
The most successful approach to parallel constraint solving is _embarrassingly parallel search_ (EPS) where the problem is decomposed into many subproblems that are solved independently on different cores.
Although GPUs have thousands of cores, it is not reasonable to execute one subproblem per core.
The primary reason is that a single core does not have its own cache.
Cores are actually grouped in streaming multiprocessors (SMs), and all cores in one SM share the same cache (called L1 cache).
The L1 cache is only 256KB on the most recent NVIDIA Hopper GPUs (which I don't have).
A quick calculation shows why one subproblem per core is not a viable option.
Suppose the domain of a variable is represented by an interval (the lightest you can do, it is more often represented by a set of intervals), hence 8 bytes, a store of 1000 variables takes 8KB of memory.
Suppose an SM has 64 (integer) cores, then we need 64*8 = 512KB of cache to fit all the stores at once.
We should also store the propagators, and although the stateless propagators can be shared among subproblems, it easily takes up dozens of KB; memory that will not be available for the stores.
The threads will end up competing for the caches, and it will generate many memory transfers among the global memory, L2 cache and L1 cache.
Memory transfers are usually the most costly operation, hence you try to avoid (or hide) them in a GPU; loading data from the global memory is about 10x slower than from the L1 cache.
I am not saying it is impossible to do efficiently, but it seems quite complicated, especially when taking into account warps that are SIMD units of the GPUs (blocks of 32 threads), and thus must all have their data ready in the cache at the same time when executing.
This is a hypothesis based on intuition and discussion with GPU experts, but it has not been verified experimentally.

Instead of relying on a "one subproblem per core" design that is so commonly used in parallel constraint solvers, we can execute one subproblem per SM.
And parallelism within an SM is achieved by parallelizing propagation!
It is worth mentioning that no attempt to parallelize propagation resulted in a faster solver in comparison to simply parallelizing the search.
In fact, no modern solver parallelizes propagation.
Because most solvers are designed for CPU, it seems that adapting an existing solver to work on GPU is doomed to fail.
The design rationale of Turbo is to aim first at a _simple but correct_ parallel design.

I write this technical journal to document my attempts to obtain an efficient GPU-based constraint solver named Turbo.
Moreover, because I like my life to be (too) complicated, Turbo is also based on abstract interpretation and implements so-called _abstract domains_ which are mathematical generalizations of the representation of constraints.
Let's embark on this journey!
