# v1.2.{1,2,3}: Open Hackathon

_17 October 2024_ We are participating in the [Poland Open Hackathon](https://www.openhackathons.org/s/siteevent/a0C5e000009W8MqEAK/se000307?p=4OVal7qBAY6%2FFLWHyETbkwh66SClhyelBl79%2FR1tID1ERZR9ly9oZEseBU%2B%2FQOAe%2B1PJ%2BAdY%2F%2F62bDJM0SlZYg%3D%3D).
This page will summarize our progresses and experience.
The hackathon is spread over 2 weeks starting by a meeting on 15 October to explain the GH200 architecture that equip the [Helios HPC](https://www.cyfronet.pl/en/19951,artykul,helios_supercomputer.html), how to connect and run jobs on it, and then discuss with our mentors.
Among the mentors, we are lucky to have two engineers from Nvidia working on [cuOpt](https://developer.nvidia.com/blog/record-breaking-nvidia-cuopt-algorithms-deliver-route-optimization-solutions-100x-faster/) and a new secret [linear programming solver](https://developer.nvidia.com/blog/accelerate-large-linear-programming-problems-with-nvidia-cuopt/).
During the meeting, I try to compile Turbo on the HPC and... boom, `nvcc` is killed by the memory manager because it is using too much memory.
I encountered a similar problem last year and reported the bug to Nvidia.
The bug was closed as "will not fix", the reason is that our kernel is just too large and we should split it in smaller kernels.
But by adding `__noinline__` attributes in key places, I could work around it and compile it on `sm_70` and `sm_86` architectures.
It seems that for `sm_90` architectures (of the GH200), the compiler is again doing very aggressive optimizations, and Turbo is just too large for it.
By putting the full solver in a single kernel, we avoid the memory transfers between the CPU and GPU, but even when the code is compiling, the bottleneck is the high number of registers per thread and the size of the kernel.
The next meeting is on 22 October, for the whole day.
Without a code that is compiling, it is going to be hard to profile and optimize anything...
After a few days, I managed to develop a new hybrid algorithm where only the propagation loop is on the GPU, and the search is on the CPU.
It is now compiling fine on Helios.
The real hackathon took place online on 28, 29 and 30 of October, each time we stayed connected online and discussed with the mentors when needed from around 9AM to 3 or 4PM.

Let's see an executive summary of the versions used and developed during this hackathon:

* _15 October 2024_: Turbo 1.2.0 is not compiling on Helios (ptxas is memkill).
  * Reason: Kernel is too large.
* _22 October 2024_: New design with a smaller kernel (Turbo v1.2.1).
  * The CPU controls the search loop, a kernel is run each time we propagate.
  * Use N CPU threads, each launching a kernel with 1 block using stream.
  * Compiling, but too slow, too many streams (only `1628` nodes per second...).
* _28 October 2024_: New design with a persistent kernel (v1.2.2).
  * N CPU threads communicate with N blocks of a persistent kernel.
  * Compiling, on-par with the full GPU version.
* _30 October 2024_: Deactivating entailed propagators (v1.2.3).
  * Use [CUB scan](https://nvidia.github.io/cccl/cub/api/classcub_1_1BlockScan.html) to deactivate propagators that are entailed during search.
  * Obtained 10% speed-up.

## Hybrid Dive and Solve Algorithm (v1.2.2)

If you don't know the "propagate-and-search" algorithm of constraint programming, please watch [this video](https://youtu.be/vAzGmkOJveY) I made for the AAAI conference (thanks Covid), starting at 5'30'' (if you already your basics about GPU).
It also explains how this algorithm is executed in parallel on GPU.

We keep the same algorithm as full-GPU Turbo but only performs the propagation on the GPU.
The algorithm consists of two parts:

1. `dive(root, path)`: From the root of the search tree, commit to the path given to reach a node `subroot` at a fixed depth.
2. `solve(subroot)`: Solve the subproblem `subroot` by propagate and search.
3. When a subproblem has been completely explored, we take a new path to explore if any is left.

During the dive and solve operations, the propagation step is always executed on the GPU.
Starting from version 1.2.2, we execute a single kernel and each CPU thread interacts with a single block of that persistent kernel.

## Deactivating Entailed Propagators (v1.2.3)

A frequent optimization is to avoid calling propagators that are entailed in the fixpoint loop.
To give a very simple example, if `x=[1,3]`, then for sure we know that `x > 0`, and so the propagator implementing `x > 0` does not need to be executed.
To achieve that, we keep an array `vector<int> indexes` giving the indexes of the propagators not yet entailed.
The fixpoint loop can be easily modified to iterate over `indexes` instead of iterating from `0` to `P` where `P` is the number of propagators.
It is easy to verify in parallel that each propagator is entailed because this is a read-only check, therefore we can assign one thread to each propagator we need to check.
This step produces a mask `vector<bool> mask` representing which propagators are still alive.
The difficult part is to create the new array `indexes` representing that subset in parallel.
This is a known problem in GPU programming and the scan algorithm (aka. prefix sum) allows to parallelize this step and copying into a new array `indexes2` only the values `indexes[i]` such that `mask[indexes[i]]` is `true`.

## Benchmarks

We try the new versions on Helios and on my local desktop computer (in order to compare with the full GPU version).
The superchip GH200 equipping Helios has a CPU with 72 cores and a H200 GPU with 132 SMs whereas my desktop has a CPU with 10 cores and a RTX A5000 GPU with 64 SMs.

On the desktop:
* We confirm v1.2.1 is very slow.
* The version v1.2.0 fully executing on GPU and v1.2.2 hybrid (64 blocks) are on-par in terms of average nodes-per-second.
*

On the first version  The raw power of GH200 is excellent since it

| Name                                   | Architecture | Average nodes-per-second | #Problems at optimality | #Problems SAT | #Problems unknown |
|:---------------------------------------|--------------|-----------------------:|------------------:|--------------:|------------------:|
| turbo.gpu_1.2.3_hybrid_4096_264        | Helios (GH200) | 45520.8  |                 0 |            14 |                 2 |
| turbo.gpu_1.2.2_hybrid_4096_264        | Helios (GH200) | 40330.9  |                 0 |            14 |                 2 |
| turbo.gpu_1.2.3_hybrid_4096_132        | Helios (GH200) | 36589.3  |                 0 |            14 |                 2 |
| turbo.gpu_1.2.2_hybrid_4096_132        | Helios (GH200) | 33232.3  |                 0 |            14 |                 2 |
| turbo.gpu_1.2.0_gpu_4096_64            | Desktop (RTX A5000) | 10412.7  |                 0 |            14 |                 2 |
| turbo.gpu_1.2.2_hybrid_4096_64         | Desktop (RTX A5000) | 10271    |                 0 |            14 |                 2 |
| turbo.gpu_1.2.1_hybrid_4096_64         | Desktop (RTX A5000) | 1628.89 |                 0 |            14 |                 2 |
