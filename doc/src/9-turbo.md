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

If you don't know the "propagate-and-search" algorithm of constraint programming, please watch [this video](http://hyc.io/videos/aaai2022.mp4) I made for a conference, starting at 5'30''.

We keep the same algorithm as full-GPU Turbo but only performs the propagation on the GPU.

