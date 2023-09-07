# Turbo

(For a gentle and quick introduction to GPU programming, you can check out my [tutorial](https://ulhpc-tutorials.readthedocs.io/en/latest/gpu/cuda2023/) and go through the slides; it is especially useful to know the CUDA vocabulary).

*30 August 2023.* Turbo is a constraint solver running entirely on the GPU with an architecture based on abstract domains.
Intuitively, it seems that constraint solvers are a poor match for GPUs.
These solvers have complex architecture with many dynamic data structures, divergent branches and often save and restore the memory when backtracking.
Clearly not the kind of things GPUs like the most.
Moreover, over the years, new solving techniques have been primarily developed within a sequential mindset, without consideration for parallel execution.
The most successful approach to parallel constraint solving is _embarrassingly parallel search_ where the problem is decomposed into many subproblems that are solved independently on different cores.
Although GPUs have thousands of cores, it is not reasonable to execute one subproblem per core.
The reason is that a single core does not have its own cache.
Cores are actually grouped in streaming multiprocessors (SMs), and all cores in one SM share the same cache (called L1 cache).
The L1 cache is only 256KB on the most recent NVIDIA Hopper GPUs (which I don't have).
A quick calculation shows why one subproblem per core is not a viable option.
Suppose the domain of a variable is represented by an interval (the lightest you can do, it is usually represented by a set of intervals), hence 8 bytes, a store of 1000 variables takes 8KB of memory.
An SM has 64 (integer) cores, hence we need 64*8 = 512KB of cache to fit all the stores at once.
We should also store the propagators, and although the stateless propagators can be shared among subproblems, it easily takes up dozens of KB; memory that will not be available for the stores.
The threads will end up competing for the caches, and it will generate many memory transfers between the global memory, L2 cache and L1 cache.
Memory transfers are usually the most costly operation, hence you try to avoid them in a GPU; loading data from the global memory is about 10x slower than from the L1 cache.
I am not saying it is impossible to do efficiently, but it seems quite complicated, especially when taking into account warps that are SIMD units of the GPUs (blocks of 32 threads), and thus must all have their data ready in the cache at the same time when executing.
This is a hypothesis based on intuition and discussion with GPU experts, but I should verify it experimentally.

Instead of relying on ``one subproblem per core`` design that is so commonly used in CPU parallel constraint solver, we can execute one subproblem per SM.
And the parallelism inside an SM is obtained by parallelizing propagation!
It is worth mentioning that no attempt to parallelize propagation resulted in a faster solver in comparison to simply parallelizing the search.
In fact, no modern solver parallelizes propagation.
Because most solvers are designed for CPU, it seems that adapting an existing solver to work on GPU is doomed to fail.
The design rational of Turbo is to aim first at a _simple but correct_ parallel design.

I write this technical journal to document my attempts to obtain an efficient GPU-based constraint solver named Turbo.
Moreover, because I like my life to be (too) complicated, Turbo is also based on abstract interpretation and implements so-called _abstract domains_ which are very general mathematical generalizations of the representation of constraints.
Let's go!
