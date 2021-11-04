# CG C++ Framework

This is the C++ framework for the advanced tutorials of the computer graphics lecture at the Friedrich-Alexander-Universität Erlangen-Nürnberg.

# Prerequisites

- This software requires third party libraries:
	- SDL2 https://www.libsdl.org/
	- GLM https://glm.g-truc.net/0.9.9/index.html
	- GLEW http://glew.sourceforge.net/ or https://github.com/Perlmint/glew-cmake
	- PNG http://www.libpng.org/pub/png/pngcode.html

- These libraries must be installed first using CMake. All libraries are delivered together with the framework. There is no need for downloading them yourself.
- Libraries must be installed only once, not each time you get a new assignment.

## Installing libraries (CIP-Pool)

In the CIP-Pools, all the required libraries are already installed. So, this step can be skipped.

## Installing libraries (Windows)

1. Download and install CMake ( https://cmake.org/ ) and Visual Studio Community Edition ( https://visualstudio.microsoft.com/de/ )
2. Create a directory **libs** or **libraries** (whatever suits you) where you install all your libraries. It is reasonable to have this on a low level as in the future you might want to add further libraries and use this folder also for other projects. The following explanations assume that you use **C:/libs**. If you want to use another directory, just adapt the directory the way you need it.
3. Add **C:/libs** and **C:/libs/bin** to the Environment Variable *Path* ( https://www.computerhope.com/issues/ch000549.htm ).
4. Create a subdirectory **libs/src**, copy all the libraries from **cgAdvancedFramework/deps/** to this folder and extract them.
5. SDL2: 
	- Open cmake-gui
		- Source code: **C:/libs/src/SDL2-2.0.12**
		- Binaries: **C:/libs/src/SDL2-2.0.12/build**
		- Add entry
			- Name: CMAKE_INSTALL_PREFIX
			- Type: PATH
			- Value: **C:\libs**
			- Ok
		- Configure
			- Accept creating build directory
			- Use default native compiler --> Finish
		- Generate
		- Open Project (this should start Visual Studio)
	- Visual Studio
		- Solution Configuration: Debug
		- right-click ALL_BUILD --> Build (if errors appear, here you might have done something wrong before)
		- right-click INSTALL --> Build (if errors appear, ...)
		- do the same for Solution Configuration: RelWithDebInfo (optional but recommended)
6. GLM:
	- copy folder **glm/glm** (you extracted the **glm** folder from **glm-0.9.9.7.zip**) to **C:/libs/include** (the **include** folder should have been created by installing SDL2)
7. GLEW:
	- Open cmake-gui
		- Source code: **C:/libs/src/glew-cmake-master/build/cmake**
		- Binaries: **C:/libs/src/glew-cmake-master/build/cmake/build**
		- same as for SDL2
	- Visual Studio
		- same as for SDL2
8. PNG (zlib)
	- Open cmake-gui
		- Source code: **C:/libs/src/zlib-1.2.11**
		- Binaries: **C:/libs/src/zlib-1.2.11/build**
		- same as for SDL2
	- Visual Studio
		- same as for SDL2
9. PNG (lpng1637)
	- Open cmake-gui
		- Source code: **C:/libs/src/libpng-1.6.37**
		- Binaries: **C:/libs/src/libpng-1.6.37/build**
		- same as for SDL2
	- Visual Studio
		- same as for SDL2
		
10. Restart your computer. Otherwise your changes at the *Path* variable will not be noticed by the system and it won't find your libs.

## Installing libraries (Linux)

You can either follow the seven steps below or run the script prepare.sh by using ./prepare.sh.

1. Download and install CMake ( https://cmake.org/ )
2. Extract the libraries from **cgAdvancedFramework/deps/** wherever you want
3. SDL2:
	- go to the folder of the source code, i.e. **SDL2-2.0.12**
	- mkdir build
	- cd build
	- cmake ..
	- make -j4
	- sudo make install
4. GLM:
	- copy folder **glm/glm** to **usr/local/include**
5. GLEW:
	- go to the folder of the source code, i.e. **glew-cmake-master**
	- cd build/cmake
	- mkdir build
	- cd build
	- cmake ..
	- make -j4
	- sudo make install
6. PNG (zlib)
	- same as for SDL2
7. PNG (lpng)
	- same as for SDL2

# Setup CG framework
- This software uses the C++17 standard, please make sure your C++ compiler supports it.

## Windows
- Open cmake-gui
	- Source code: **yourFolder/cgAdvancedFramework**
	- Binaries: **yourFolder/cgAdvancedFramework/build**
	- Configure
		- Accept creating build directory
		- Use default native compiler --> Finish
	- Generate
	- Open Project (this should start Visual Studio)
- Visual Studio
	- Set your project (i.e. *Advanced03*) as start-up project by right-clicking it and selecting "Set as start-up project".
	- If you built the libs in Debug and RelWithDebInfo, you can use these configurations here too.

## Linux
- create a folder "build" in the root directory of this project.
- cd build
- cmake ..
- make

# Adding an assignment to the framework
- Add the folder with the assignment to **cgAdvancedFramework/src**, i.e. **cgAdvancedFramework/src/Advanced03**
- Configure and generate the project. This adds the new assignment to the project
	- Windows: open cmake-gui --> Configure, Generate
	- Linux: cd build, cmake .., make

# Compiling and running the code
- Once the cmake part is done, compilation is only done through Visual Studio on Windows and make on Linux. Cmake is only required when another assigment is added to the framework.