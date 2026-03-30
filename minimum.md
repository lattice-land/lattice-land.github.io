# Parallel Minimum Algorithm

We present a simple algorithm computing the minimum element of an array in parallel on GPU.
We introduce the main concepts behind this framework, and give a first grasp to use the library.

## An array of element on GPU

The first thing to do is to create an array of numbers to be passed to a GPU kernel.
As easy as it seems, there is already a small pitfall not to fall in.
Thanks to our library [cuda-battery](CUDA-Battery.md), we can use a `vector<int>` similarly to what we use on CPU.
Surprisingly, such a simple `vector` class is not yet available on GPU, although they are working on a copy of the STL called [libcudacxx](https://nvidia.github.io/libcudacxx/) working on CUDA GPU.
As soon as `vector` is available there, we will use the standard one, meanwhile, let's use the one from cuda-battery.
One of the main distinction between CPU and GPU programming is the memory.
On the CPU side, we allocate using `new` or `malloc`, but on GPU you should allocate using the more specific `cudaMalloc`.
Although it does not seem like a big deal, it makes developing code working on both CPU and GPU a bit harder.
We rely on the _allocators_ provided by cuda-battery, and basically all the code is templated by a `class Allocator`.
In the standard library, the class `vector` is parametrized by an allocator, and so is the `battery::vector` version.
Although most of us never use it, it is actually not very difficult.
The safest allocator to use is `battery::ManagedAllocator` which uses the managed memory of CUDA, which is a memory automatically accessible from the CPU and GPU, and the data migrates automatically between the two worlds.

```c++
#include "vector.hpp" // From cuda-battery.
#include "allocator.hpp" // From cuda-battery.

int main() {
  battery::vector<int, battery::ManagedAllocator> v{5, 1, 2, 3};
}
```

To make the type shorter, let's use the following alias:
```c++
using namespace battery; // let's make things shorter for this tutorial.
using ivector = vector<int, ManagedAllocator>;
```

A common use-case is to declare and initialize an array on the CPU and then pass it to the GPU.
However, there is a catch...
None of the following kernel declaration will work as we would like to:

```c++
__global__ void min_kernel(ivector& v);
__global__ void min_kernel(const ivector& v);
__global__ void min_kernel(ivector v);
```

The two first are not working because the address of `v` in the main is an address on the CPU side, and of course it does not work when we try to access it on the GPU, so it will segfault.
The third version works but it performs an unwanted copy of the array.
After all, we used a managed allocator to avoid copying the array to the GPU once initialized and declared on the CPU.
There is not a hundred ways to achieve what we want: we need to pass the data through a pointer allocated on the GPU.
Since we are coding in "modern C++", we will avoid manipulating raw pointers, and instead will rely on `shared_ptr`.
Once again, a CUDA-friendly version of `shared_ptr` is provided by cuda-battery.

```c++
#include "shared_ptr.hpp"
#include "vector.hpp"
#include "allocator.hpp"

using namespace battery;
using ivector = vector<int, ManagedAllocator>;
using svector = shared_ptr<ivector, ManagedAllocator>;

__global__ void min_kernel(svector v);

int main() {
  svector v = make_shared<ivector, ManagedAllocator>(ivector{5, 1, 2, 3});
}
```

Now we can pass an array to our GPU kernel, we can start working on the minimum algorithm.
The result of the algorithm is retrieved using an integer pointer, because CUDA kernels cannot return value.
The rule of thumb is to use `shared_ptr<T, ManagedMemory>` to pass any argument of type `T` to a kernel, unless it is a primitive constant.
If you do that, we do not even need to worry about deallocation.
But using `shared_ptr` for parameters passing is just necessary for the kernel, afterwards, you can use reference parameter passing as usual (see `minimum` below).

```c++
CUDA int minimum(const ivector& v) {
  int result = std::numeric_limits<int>::max();
  for (int i = 0; i < v.size(); ++i) {
    result = min(result, v[i]);
  }
  return result;
}

__global__ void min_kernel(svector v, shared_ptr<int, ManagedAllocator> result) {
  *result = minimum(*v);
}

int main() {
  svector v = make_shared<ivector, ManagedAllocator>(ivector{5, 1, 2, 3});
  shared_ptr<int, ManagedAllocator> result =
    make_shared<int, ManagedAllocator>(std::numeric_limits<int>::max());
  min_kernel<<<1, 1>>>(v, result);
  CUDIE(cudaDeviceSynchronize());
  printf("minimum: %d\n", *result);
}
```

## Parallelizing the minimum algorithm

The code presented above is still single-threaded, although it runs on the GPU.
A common approach to parallelize `minimum` is to divide the array into `N` parts, where `N` is the number of threads available.
Each thread then computes a local minimum, and a single thread eventually aggregates the results.
