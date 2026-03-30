# CMake CUDA Project

([code of this section](https://github.com/lattice-land/cuda-battery/tree/v1.0.0/demo/CMakeLists.txt))

In order to compile and test the code presented above, you will need to add the headers of this library to `nvcc`.

```bash
nvcc -I cuda-battery/include demo.cu
```

We prefer to delegate the management of dependencies to [CMake](https://cmake.org/), a build automation tool.
However, creating a CMake project for hybrid CPU/GPU code is not an easy task, and we provide a demonstration CMake project in [cuda-battery/demo](https://github.com/lattice-land/cuda-battery/tree/v1.0.0/demo).
You can start your own project by copying the `demo` folder and modifying the name of the project inside the file `CMakeLists.txt`.
To compile and run this project, you can write:

```
cd cuda-battery/demo
mkdir -p build/gpu-debug
cmake -DCMAKE_BUILD_TYPE=Debug -Bbuild/gpu-debug
cmake --build build/gpu-debug
./build/gpu-debug/demo
```

It compiles the demo project in debug mode using the GPU compiler (`nvcc`), along with the unit tests (using the Google testing framework GTest).
You can also compile it in release mode by simply changing `debug` to `release` in the previous commands.
To run the tests, the command `ctest` can be used as follows:

```
ctest --test-dir build/gpu-debug/
```

Among the characteristics of this project:

* Files have the `.cpp` extension instead of the `.cu` extension.
* It compiles code for the native GPU architecture by default (so for the GPU of the computer you are compiling your code on).
This can easily be changed if you are cross-compiling by defining the flag `CMAKE_CUDA_ARCHITECTURES` at the configuration stage:
```
cmake -DCMAKE_CUDA_ARCHITECTURES=70 -DCMAKE_BUILD_TYPE=Release -Bbuild/gpu-release
```
* Several useful options inherited from cuda-battery (enabling C++20 and constexpr extension).
* A testing framework where you can write your CPU tests using Google Test framework (see `demo/tests/demo_test.cpp`) and your hand-made GPU tests (see `demo/tests/demo_test_gpu.cpp`).
* Moreover, when testing GPU code, we verify there is no memory leaks or some data races (using `compute-sanitizer`).

We have documented the [CMakeLists.txt](https://github.com/lattice-land/cuda-battery/tree/v1.0.0/demo/CMakeLists.txt) so you can adjust it to your own project.
