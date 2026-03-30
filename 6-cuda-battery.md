# A Word of Caution on Shared-State Parallelism

Developing a parallel algorithm is relatively easy as long as threads read and write independent memory chunks.
Such an algorithm is referred as [embarrassingly parallel](https://en.wikipedia.org/wiki/Embarrassingly_parallel).
As a rule of thumb, it is best if you can stay within this paradigm.
For instance using map-reduce operations, where all threads work on separate memory cells during the map operation, and then a single thread performs a reduction of all temporary results obtained.
Sometimes this is not possible, or you want to get to the next level to get better performance.
Beware, designing _correct and efficient_ parallel algorithms with threads communicating in a shared memory system is a whole new world.
We cannot even scratch the surface here, and this library does not provide much support for it.
Nevertheless, it is possible to write such algorithms in CUDA using [atomics and synchronization primitives](https://nvidia.github.io/libcudacxx/extended_api/synchronization_primitives.html).
To use them well, I would advise to take a class (or [read a book](https://arxiv.org/abs/1701.00854)) on parallel programming and memory consistency models.
