# Pallet Town (Unoptimized Solver)

_31 August 2023._ We start this adventure with a functional but slow GPU solver.
To make it work on the GPU, we had to simplify the architecture of mainstream CPU-based constraint solver in many regards.
Let's start with the main design decisions behind Turbo:
* *Pure GPU*: We decided early on to make it a solver entirely on the GPU, this is to avoid memory transfer between CPU and GPU, and also to force us to have a complete parallel mindset.
* *Propagation loop*: Based on the very first AC1, we simply take the first N propagators, run them in parallel, then take the next N propagator, and so on until they are all executed, where N is the number of cores available in the current block.
We repeat this operation in a fixed point loop until no change is detected anymore.
This implies we do not have a queue of propagators to be woken up or any notion of events in the solver.
* *Backtracking*: It is based on full recomputation, each time we backtrack, we re-apply all the decisions from the root node; actually, from the root of the current EPS subproblem being solved.
* *Embarrassingly parallel search*: We dynamically create subproblems that are explored individually by GPU blocks, hence the parallel propagation only happens inside one block.
* *Abstract domains*: The solver architecture is based on abstract domains which encapsulate solving algorithms dedicated to a particular constraint language, similarly to theories in SMT.
* *No conflict learning*: Conflicts require dynamic data structures to represent the implication graph, and memory allocation is quite costly on GPU, so we have no conflict learning.
* *Lock-free*: Although propagators are sharing the memory, we do not have locks on the variables, and actually no lock at all.

We have thrown away many optimizations considered essential in mainstream CPU-based constraint solvers.
Incidentally, the GPU solver is much simpler than a CPU solver, while obtaining similar performances (of course, when comparing a pure CP solver without SAT).
Back in 2021, our hypothesis was that drastically simplifying the solver design was necessary to implement a GPU solver and that it could be efficient.
We implemented a prototype (Turbo) that demonstrated it could work as we obtained similar performances between Turbo and Gecode (on a 6-cores CPU with 12 threads) on RCPSP.
We also laid out the theory behind parallel constraint propagation on GPU and show that, although we did not use any lock, it was giving correct results.
These findings were summarized in our AAAI 2022 paper.
