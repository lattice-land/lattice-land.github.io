# v1.0.1: Unoptimized Turbo

_08 November 2023._ We start this adventure with a functional but slow GPU solver.
To make it work on the GPU, we had to simplify the architecture of mainstream CPU-based constraint solver in many regards.
Let's start with the current design decisions behind Turbo:
* *Pure GPU*: We decided early on to make it a solver entirely on the GPU, this is to avoid memory transfers between CPU and GPU.
We are also forced to design each component with a parallel mindset.
* *Propagation*: The propagation loop is based on the very first AC1 algorithm: we simply take the first N propagators, run them in parallel, then take the next N propagators, and so on until they are all executed, where N is the number of cores available in the current block.
We repeat this operation in a fixed point loop until no change is detected anymore.
This implies we do not have a queue of propagators to be woken up or any notion of events in the solver.
* *Backtracking*: It is based on full recomputation, each time we backtrack, we re-apply all the decisions from the root node; actually, from the root of the current EPS subproblem being solved.
* *Embarrassingly parallel search*: We dynamically create subproblems that are explored individually by GPU blocks, hence the parallel propagation only happens inside one block.
* *Abstract domains*: The solver architecture is based on abstract domains which encapsulate solving algorithms dedicated to a particular constraint language, similarly to theories in SMT.
However, abstract domains are semantic objects while SMT theories are syntactic objects (and a formal connection exists between the two).
Our opinion is that abstract domains are closer the actual implementation code than SMT theories.
Moreover, since a product of abstract domains is also an abstract domain, this framework offer promising perspectives for combining solving algorithms.
* *No conflict learning*: Conflicts require dynamic data structures to represent the implication graph, and memory allocation is quite costly on GPU, so we currently have no conflict learning.
* *Lock-free*: Although propagators are sharing the memory, we do not have locks on the variables, and actually no lock at all (it's a lie: we have one lock for printing).

We have thrown away many optimizations considered essential in mainstream CPU-based constraint solvers.
Incidentally, the GPU solver is much simpler than a CPU solver, while obtaining similar performances (of course, when comparing a pure CP solver without SAT learning).
Back in 2021, our hypothesis was that drastically simplifying the solver design was necessary to implement a GPU solver and that it could be efficient.
We implemented a [prototype (Turbo)](https://github.com/ptal/turbo/tree/aaai2022) demonstrating it could work: we obtained similar performances between Turbo and Gecode (on a 6-cores CPU with 12 threads) on RCPSP.
More importantly, we laid out the theory behind parallel constraint propagation on GPU and show that, although we did not use any lock, it was giving correct results.
These findings were summarized in our [AAAI 2022 paper](http://hyc.io/papers/aaai2022.pdf).

For more than one year, I have been refactoring and extending this initial prototype in multiple ways.
One goal has been achieved now and Turbo can solve MiniZinc model with two limitations: for now, it only supports integer variables, and all global constraints are decomposed into primitive constraints.
The solver Turbo is part of a larger project called _Lattice Land_, which is a collection of libraries representing lattice data structures.
The long-term goal is to be able to reuse these libraries outside of constraint solving, for instance in static analysis by abstract interpretation and in distributed computing using CRDT.
The code of Turbo is the glue putting together the required libraries to solve a constraint problem.
The new _abstract domain_ design comes with a price: it is less efficient than the prototype.
It was expected since the prototype could only handle a very small constraint language with limited architectural overhead.
I will try to integrate one by one various optimizations and attempt to first reach the previous efficiency, and then go beyond it.

## Benchmarking Suite

To benchmark our progresses, I think it is reasonable to start with a set of easy instances (J30 benchmarks on RCPSP) and a set of harder instances (from MiniZinc competition 2022).
I have selected a subset of the MiniZinc competition benchmarks where I discarded models with set variables (unsupported by Turbo).
For a representative but quicker benchmarking, I selected 1 or 2 instances per problems, arbitrarily varying between small and large instances.
For RCPSP, I randomly selected 19 instances of the J30 dataset.
In the following table, I describe the problems of the benchmarking suite (`diffn` (1) indicates one occurrence of the global constraint `diffn`, `alldifferent` (\*) indicates the global constraint occurs in redundant or symmetry breaking constraints).

| Problem | #Instances | Description | Global Constraints | Shape |
|---------|------------|-------------|--------------------|-------|
| Wordpress | 1 | Allocation problem: assign software components to hardware units under some constraints. | None | Many `sum()()`. |
| ACCAP | 2 | Allocation problem: Airport check-in counter allocation problem (ACCAP) with fixed opening/closing times. | `diffn` (1) | Precedence constraints. |
| Tower | 1 | Allocation problem: assign handsets to communication towers to maximize connection quality. | None | |
| Team Assignment | 1 | Allocation problem: make teams of players to maximize happiness and balancing. | `bin_packing_load`, `alldifferent` (\*), `bin_packing` (1\*) | Sums of Boolean. |
| NFC | 1 | Graph problem: network flow global constraint. | `network_flow_cost` | Equality/sum constraints. |
| Diameterc-mst | 1 | Graph problem: Diameter Constrained Minimum Spanning Tree | None | Many implications / disjunctions.  |
| Stripboard | 2 | Layout for electrical components on stripboard: find the most compact layout. | `diffn` (1), `disjunctive` (1), `alldifferent` (1\*), `strictly_decreasing` (1\*) | Many implications. |
| Blocks world | 1 | Planning problem: find a path of minimum length from an initial configuration to a final configuration of the puzzle. | `increasing` (1), `global_cardinality_closed` | |
| Roster Sickness | 1 | Scheduling problem: assign employees to work shifts with expertise constraints.  | None | Lexicographic optimization. |
| Triangular | 2 | Puzzle | None | Sum constraints. |
| Generalized-peacable Queens | 1 | Toy problem: A variant of n-queens with several armies of queens. | `regular`, `global_cardinality` (1), `all_equal` (1), `value_precede_chain` (1\*), `lex_lesseq` (\*) | Almost only global constraints. |
| GFD Schedule | 1 | Scheduling problem: productions of group of items in various facilities. | `cumulative`, `at_most`, `nvalue` | Many implications / disjunctions. |
| RCPSP | 18 | Scheduling problem: Minimize makespan of tasks under resources constraints. | `cumulative` | Precedence constraints, disjunctions. |
| Spot 5 | 1 | Satellite imaging: select a subset of photograph to be taken maximizing a weight. | `table` | |

## Benchmarks Analysis

The goal of our first benchmarking session is to have an idea how close is Turbo from modern/state-of-the-art constraint solvers (spoiler: not very close).
In order to assess the efficiency of Turbo, I compared it against Choco and Or-Tools:

* [Turbo](https://github.com/ptal/turbo/tree/v1.0.1) v1.0.1: C++/CUDA constraint solver without SAT clause learning and without global constraints.
* [Choco](github.com/chocoteam/choco-solver) v4.10.13: Java constraint solver without SAT clause learning and with global constraints.
* [Or-Tools](github.com/chocoteam/choco-solver) v9.6: C++ constraint solver with SAT clause learning and global constraints.

Since Turbo has no global constraint, I also benchmarked the two previous solvers on problem with decomposition of global constraints, named `choco.noglobal` and `or-tools.noglobal` below.
Turbo is also developed in a way it can be executed on both the CPU or the GPU, although no special effort is made to make it efficient on CPU; it is useful to debug and compare the efficiency of almost identical solving algorithms.

The machine on which I performed the benchmarks is a Dell Precision 5820 (desktop computer):

* CPU: Intel Core i9-10900X (3,7GHz, 4,7GHz Turbo, 10C, cache 19,25Mo, HT, 165W).
* RAM: 64 Go, 2 x 32 Go, DDR4 UDIMM.
* GPU: NVIDIA RTX A5000, 24Go, 64 streaming multiprocessors (8192 CUDA cores), 230W.

About the details of the experiments:

* Timeout: 5 minutes per instance (it is relatively small in order to quickly iterate and test new optimizations of Turbo).
* EPS (TurboGPU): generate 1024 subproblems (`-sub 10` for "2^10").

_Warning_: Before we start, let's get something straight: *the comparison between TurboGPU and other solver is relatively unfair.*
In particular, because of EPS, TurboGPU uses breadth-first search at the top of the tree, and thus sometimes can get better bounds, while the others use depth-first search and might stay stuck in the left part of the search tree longer.
In contrast, on some problems, depth-first search allows TurboCPU to find a better bound because it goes deeper in the search tree.
To be completely fair, we should enable parallelism for each solver since most of them support it.
We don't because when you run a race, you don't try to overtake the 1th runner when you are at the back of the race, you first focus on overtaking the runner in front of you ;-)

Alright, let's go with the benchmarks, the full Jupyter notebook is available [here](https://github.com/ptal/turbo/blob/v1.0.1/benchmarks/analysis-v1.0.1.ipynb).
We first start by an overview:

![Status comparison](turbo-v1.0.1/overall.png)

The overall results are not surprising.
When looking at Choco and Or-Tools, we might wonder if global constraints are worth the investment, especially when clause learning is activated (Or-Tools).
In the following, we take a closer look at Choco and Or-Tools:

![OrTools vs OrTools.noglobal](baseline/or-tools-vs-or-tools-noglobal.png)
![Choco vs Choco.noglobal](baseline/choco-vs-choco-noglobal.png)

Here, we only compare the objective bounds and not the time needed to reach the best found objective.
Back to Turbo, let's compare it to our its CPU-version and the baseline solvers:

![TurboCPU vs TurboGPU](turbo-v1.0.1/turbocpu-vs-turbogpu.png)
![TurboGPU vs OrTools](turbo-v1.0.1/turbogpu-vs-ortools.png)
![TurboGPU vs OrTools.noglobal](turbo-v1.0.1/turbogpu-vs-ortools-noglobal.png)
![TurboGPU vs Choco](turbo-v1.0.1/turbogpu-vs-choco.png)
![TurboGPU vs Choco.noglobal](turbo-v1.0.1/turbogpu-vs-choco-noglobal.png)

For future references, it is interesting to have an average of some speed and memory metrics across all problems:

* Average nodes per second for TurboGPU: 1246.77 (median = 35.07)
* Average ratio of fixpoint_iterations to nodes for TurboGPU: 8.48 (median = 7.11)
* Number of problems with non-zero num_blocks_done and not optimal/unsatisfiable: 13
* Average propagator_mem for TurboGPU across all data_files: 16.41 MB  (median = 13.07 MB)
* Average store_mem for TurboGPU across all data_files: 167.78 KB (median = 174.01 KB)

When comparing the number of nodes per second, we can see that TurboGPU explores around 5 to 10 times more nodes per second than TurboCPU ; showing a "purely computational gain" when using the GPU.
Just 5x to 10x quicker is actually not that much quicker considering we have 64 streaming multiprocessors, and indicate we are underusing the parallel capacities of the GPU.
In the future, I'll benchmark how efficiently Turbo is using the GPU using the profiling tools of NVIDIA.

![TurboGPU nodes per second](turbo-v1.0.1/number-of-nodes-per-second.png)

You might notice that on RCPSP, TurboCPU is actually better in terms of nodes per second.
The reason is that the number of subproblems is not large enough, and some streaming multiprocessors become IDLE because no more problems can be consumed.
On two problems, we have only one streaming multiprocessors working, meaning only 1/64 of the GPU is used at the end...
We need to study more the EPS decomposition.

![TurboGPU EPS](turbo-v1.0.1/turbo-eps-nodes.png)

Finally let's look at the fixpoint iterations.
On average, Turbo needs to execute each propagator 8 times before reaching a fixpoint, of course it depends on the problem:

![TurboGPU fixpoint iterations](turbo-v1.0.1/number-of-fixpoint-iterations-per-node.png)

To conclude this first benchmarking session, I found the results encouraging, especially when considering how primitive is the propagation loop.
I think two important missing optimisations are:
1. Preprocessing in the root node (and maybe each root node of the EPS subproblem).
2. Disable propagators that are entailed.

See you next time for more benchmarking!
