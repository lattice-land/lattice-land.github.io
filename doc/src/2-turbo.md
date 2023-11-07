# Design Rational

_31 August 2023._ We start this adventure with a functional but slow GPU solver.
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
However, abstract domains are semantic objects while SMT theories are syntactic objects (and a formal connection exists between the two), which makes abstract domains closer the actual implementation code.
* *No conflict learning*: Conflicts require dynamic data structures to represent the implication graph, and memory allocation is quite costly on GPU, so we currently have no conflict learning.
* *Lock-free*: Although propagators are sharing the memory, we do not have locks on the variables, and actually no lock at all.

We have thrown away many optimizations considered essential in mainstream CPU-based constraint solvers.
Incidentally, the GPU solver is much simpler than a CPU solver, while obtaining similar performances (of course, when comparing a pure CP solver without SAT learning).
Back in 2021, our hypothesis was that drastically simplifying the solver design was necessary to implement a GPU solver and that it could be efficient.
We implemented a [prototype (Turbo)](https://github.com/ptal/turbo/tree/aaai2022) that demonstrated it could work as we obtained similar performances between Turbo and Gecode (on a 6-cores CPU with 12 threads) on RCPSP.
We also laid out the theory behind parallel constraint propagation on GPU and show that, although we did not use any lock, it was giving correct results.
These findings were summarized in our [AAAI 2022 paper](http://hyc.io/papers/aaai2022.pdf).

For more than one year, I have been refactoring and extending this initial prototype in multiple ways.
One goal has been achieved now and Turbo can solve MiniZinc model with two limitations: for now, it only supports integer variables, and all global constraints are decomposed into primitive constraints.
The solver Turbo is part of a larger project called _Lattice Land_, which is a collection of libraries representing lattice data structures.
The long-term goal is to be able to reuse these libraries outside of constraint solving, for instance in static analysis by abstract interpretation and in distributed computing using CRDT.
The code of Turbo is the glue putting together the required libraries to solve a constraint problem.

## Benchmarking Suite

However, as one could expect, the new _abstract domain_ design comes with a price: it is less efficient than the prototype.
I will try to integrate one by one various optimizations and attempt to first reach the previous efficiency, and then go beyond it.
To benchmark our progresses, I think it is reasonable to start with a set of easy instances (J30 benchmarks on RCPSP) and a set of hard instances (from MiniZinc competition 2022).
I have selected a subset of the MiniZinc competition benchmarks where I discarded models with set variables (unsupported by Turbo).
For a representative but quicker benchmarking, I selected 1 or 2 instances per problems, arbitrarily varying between small and large.
For RCPSP, I randomly selected 19 instances.
In the following table, I describe the problems of the benchmarking suite.

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
| Triangular | 2 | Puzzle | None. | Sum constraints. |
| Generalized-peacable Queens | 1 | Toy problem: A variant of n-queens with several armies of queens. | `regular`, `global_cardinality` (1), `all_equal` (1), `value_precede_chain` (1\*), `lex_lesseq` (\*) | Almost only global constraints. |
| GFD Schedule | 1 | Scheduling problem: productions of group of items in various facilities. | `cumulative`, `at_most`, `nvalue` | Many implications / disjunctions. |
| RCPSP | 18 | Scheduling problem: Minimize makespan of tasks under resources constraints. | `cumulative` | Precedence constraints, disjunctions. |
| Spot 5 | 1 | Satellite imaging: select a subset of photograph to be taken maximizing a weight. | `table` | |

## Benchmarks Analysis



